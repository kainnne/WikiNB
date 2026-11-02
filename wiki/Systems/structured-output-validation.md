---
title: "AI 結構化輸出的 Schema 與業務規則驗證"
description: "以合成活動資料說明 JSON 解析、欄位契約、來源核對與寫入前檢查，避免把格式正確當成內容正確。"
type: note
status: active
tags: [AI, JSON, Schema, API, 驗證]
date: 2026-11-02
---

# AI 結構化輸出的 Schema 與業務規則驗證

> 本文由 AI 輔助自動化流程產製與更新。

請 AI 把一份活動說明整理成表格或 JSON，通常是自動化的第一步。下一步若要建立行事曆、寄通知或寫進資料庫，就不能只看輸出是否整齊。模型可能交出欄位完整的資料，卻把地點猜錯，或把報名截止時間填成活動開始時間。

這篇使用虛構活動資料建立一條驗證流程。讀完後，應能分辨解析錯誤、資料契約錯誤、來源不一致與執行條件未滿足，並知道各種錯誤應在哪一層處理。

## 四層檢查

| 層次 | 要確認的事情 | 失敗範例 |
| --- | --- | --- |
| JSON 解析 | 文字能否還原成資料結構 | 多了一段解說、引號未閉合 |
| Schema | 欄位、型別與允許值是否符合約定 | 人數是字串、缺少來源欄位 |
| 來源與業務規則 | 資料是否有根據、關係是否合理 | 截止時間晚於活動開始、來源沒有這個地點 |
| 執行條件 | 此刻是否能對目標系統執行 | 沒有寫入權限、重複建立、目標版本已變更 |

這四層是應用流程的設計分工。通過前一層，只代表能進入下一層檢查。模型自己回報「已驗證」也不能取代實際驗證器和外部系統的回覆。

## 最小資料契約

假設來源只有一句話：「公開講座 A 預計 24 人參加，地點尚待確認。」系統需要活動名稱、人數、地點與來源識別碼。以下是使用 JSON Schema Draft 2020-12 的示例：

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "title": { "type": "string", "minLength": 1 },
    "attendees": { "type": "integer", "minimum": 0 },
    "location": { "type": ["string", "null"] },
    "source_id": { "type": "string", "minLength": 1 }
  },
  "required": ["title", "attendees", "location", "source_id"],
  "additionalProperties": false
}
```

`properties` 說明欄位規則，`required` 指定必填欄位，`additionalProperties: false` 拒絕未列出的欄位。只列出 `properties`，不會自動讓那些欄位變成必填。[JSON Schema 物件規則](https://json-schema.org/understanding-json-schema/reference/object)

`location` 必須出現，但允許值為 `null`，讓「尚未確定」有明確表示方式。`null`、空字串與完全沒有欄位是三種不同情況。此例仍允許空字串，如果產品要求只能填非空地點或 `null`，需要再補字串長度限制。[JSON Schema 型別](https://json-schema.org/understanding-json-schema/reference/type)

合理的候選輸出是：

```json
{
  "title": "公開講座 A",
  "attendees": 24,
  "location": null,
  "source_id": "sample-event-a-v1"
}
```

這份輸出保留未知值，沒有自行補上教室。它仍然只是候選資料，`source_id` 必須由應用程式對照實際來源，不能因為模型填了一段字，就認定引用存在。

## 格式通過之後的檢查

把地點改成「第一演講廳」，仍會通過上面的 Schema，因為它確實是一個字串。可是來源沒有提供這個地點，所以來源核對應拒絕這個值，或標記為需要確認。若流程要求地點確定才能建立公開活動，原本的 `null` 也不能直接進入正式發布。

再看人數。`24` 是整數，`"24"` 是字串。驗證器不應在未約定時默默轉型。如果產品確實接受文字數字，可以設計明確的正規化步驟，保留轉換前的值，再驗證轉換後的結果。這樣出錯時才知道問題出在來源、抽取還是轉換。

業務規則也可能涉及多個欄位。例如活動結束時間必須晚於開始時間，場地容量必須足夠，時段不能與已確認的預約衝突。其中有些條件可用 Schema 表達，涉及資料庫現況或外部服務的條件則需要另外查詢。不要為了把所有檢查塞進同一份 Schema，讓規則變得難以維護。

Schema 的 `if`、`then`、`else` 可依資料內容套用不同條件。`dependentRequired` 能表達「出現某欄位時，另一欄位也必須存在」，但這種相依不會自動變成雙向。[JSON Schema 條件驗證](https://json-schema.org/understanding-json-schema/reference/conditionals)

## 實作順序與錯誤回傳

流程可以依序進行：解析回應、驗證 Schema、對照來源、檢查業務規則，最後才準備寫入。格式錯誤時，回報具體欄位與問題，例如 `attendees` 必須是整數。來源不足時，保留未知值或請求補資料，不要求模型「再努力猜一次」。

若允許自動修正，應限制修正次數，並保留原始候選資料、驗證錯誤及修正結果。每次修正後都重新驗證，不能因為第二次輸出更像答案，就直接放行。紀錄只保留排錯所需的內容，涉及個資的原文不應直接進入一般日誌。

驗證成功與寫入成功也要分開。若寫入後網路中斷，先用穩定識別碼讀回目標系統，不能重新生成一筆新資料再送一次。這屬於交易與去重設計，Schema 無法獨自處理。

## 驗收案例

| 測試資料或條件 | 預期結果 |
| --- | --- |
| 上面的完整候選資料 | 通過 Schema，保留地點待確認 |
| `attendees` 改為 `"24"` | 型別驗證失敗 |
| 刪除 `source_id` | 必填欄位驗證失敗 |
| 增加 `approved: true` | 額外欄位驗證失敗 |
| 地點填入來源未提供的演講廳 | Schema 可通過，來源核對失敗 |
| 來源識別碼不存在 | Schema 可通過，引用查證失敗 |

前四項適合交給驗證器測試，後兩項需要來源清單或人工核對。這些是合成案例，不代表任何真實活動或正式系統已通過驗收。

## 適用範圍與維護

本文 Schema 適用於一般支援 Draft 2020-12 的驗證器。模型服務的結構化輸出介面可能只支援其中一部分關鍵字，使用前須核對該服務文件，不能直接假設可原樣送入所有 API。

欄位改名、型別改變或新增必填欄位時，也要考慮舊資料與舊呼叫端。可保存契約版本、建立遷移步驟，並用既有失敗案例重新檢查。最終目標是讓接收端清楚知道什麼資料可以繼續處理，以及拒絕時應如何修正。

官方來源核對：2026-11-02。活動資料、流程分層與測試案例為本文的原創示例。

## 相關文章

- [[Learning/ai-systems-engineering/b04-http-json-api]]
- [[Learning/ai-systems-engineering/b05-llm-interface]]
- [[Systems/context-and-evidence-design]]
- [[Systems/ai-knowledge-map]]

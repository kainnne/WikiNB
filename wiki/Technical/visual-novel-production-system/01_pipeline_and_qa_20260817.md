---
title: 視覺小說製作系統：管線、技術架構與 QA
description: 整理模組化視覺小說 SOP 的階段閘門、Ren’Py 專案結構、在地化資料流、變更導向 QA 與發行邊界。
type: note
status: active
tags:
  - 技術文件
  - 視覺小說
  - RenPy
  - Pipeline
  - QA
date: 2026-08-17
---

# 視覺小說製作系統：管線、技術架構與 QA

## 定位／對應既有頁

本頁是 [[Projects/Creative/visual-novel-production-system]] 的技術補充。它描述一套可重用的製作 SOP、文件路由與驗收契約，**不是一款已完成或已 release 的遊戲，也不是任何作品的發售證明。**

目前可確認的是 v2 系列 SOP、範例 manifest 與發行前檢查方法；單部作品是否真的具備這些目錄、腳本、素材、測試結果與平台 build，仍要到該作品 repository 驗證。

## 已確認技術

### 文件路由而非單一巨型規格

系統把責任拆成：

- 入口 README：文件地圖、規則優先序與任務路由。
- 文字與多語 SOP：正文、人物聲線、有限潤稿 loop、繁中 MVP 與在地化。
- 製作規格：Ren’Py、素材、演出、UI、音訊、QA、隱私與發行邊界。
- 出版前清單：正式包、權利、商店資訊、簽章與發售停止條件。
- locale 模組：各目標語言的語用與檢查規則。
- 單部 Project Contract：覆蓋全域預設，保存該作品真正的範圍與例外。

Agent 依任務只讀必要文件與必要章節，例如文字工作不預載完整技術 QA，單一語言不預載其他語言全文。這個路由本身就是控制 context、token 成本與誤改範圍的技術設計。

### 技術基底

SOP 的量產預設為：

- Ren’Py 8.x。
- 1920×1080 虛擬畫布、16:9。
- 離線可玩，不要求帳號、後端或外部服務才能閱讀主體內容。
- Windows 與 macOS 是預設桌面目標；Web／HTML5、Android 與 iOS 預設不製作、不測試、不封裝。
- 非 16:9 顯示器保留比例與完整構圖，使用 letterbox／pillarbox，而不是拉伸或任意裁切。

這些是 SOP 預設，不是已完成平台清單；單部 Project Contract 可以改變範圍。

### 建議專案分層

```text
project/
├── README.md
├── ASSETS.md
├── project-manifest.json
├── game/
│   ├── script.rpy
│   ├── story_*.rpy
│   ├── assets.rpy
│   ├── audio_slots.rpy
│   ├── gallery_music_room.rpy
│   ├── options.rpy
│   ├── gui.rpy
│   ├── screens.rpy
│   ├── tests/testcases.rpy
│   ├── tl/<locale>/
│   ├── images/<category>/
│   └── audio/<category>/
├── artwork/
├── source-audio/
├── docs/
└── tests/
```

責任分配要點：

- `script.rpy` 只保留入口、角色定義與必要狀態。
- 正文分到 `story_*.rpy`，避免入口檔成為巨型檔案。
- 劇本呼叫語意音訊槽，不直接散寫實體音檔名稱。
- `ASSETS.md` 記錄缺口、建議路徑、狀態與暫代方案。
- `project-manifest.json` 宣告標題、版本、尺寸、平台、語言、故事檔、結局、CG、音訊需求與隱私排除。
- checker 應比較 manifest 與 `options.rpy` 等實作值，不假設兩者自然同步。
- `TEST-RESULTS.md` 只保存目前候選版、環境、核心結果、已知限制與批准狀態，不寫重複流水帳。

## 資料流／演算法

### 階段閘門

```text
Project Contract
  → Gate A 範圍、manifest、素材缺口
  → Gate B 繁中校準場景與保留場景
  → Gate C 可連續閱讀的繁中全文候選＋snapshot 鎖定
  → Gate D 映射 Ren’Py、素材、UI、音訊與演出
  → Gate E 繁中本機候選版驗收
  → Gate F 其餘五語在地化與六語整合
  → Gate G 使用者批准後才建立與交付平台包
```

每一 Gate 完成自己的可驗收 artifact 後停止。方向、權利、正式發行與已定義人工驗收點才等待使用者；階段內的安全工作不需要每小步重問。

### 繁中文字到 Ren’Py

1. 以 Project Contract、場景卡與角色卡產生繁中基礎稿。
2. 首次交付前做一次場景化潤稿，處理資訊順序、對話承接、人物反應、聲線與可演出節拍。
3. 以認知負荷、初次閱讀、對話與人物三路診斷標記問題，審查者只標記、不直接改稿。
4. 合併重複標記，只接受有證據的 P0／P1；P2 不能單獨觸發新一輪。
5. 第二輪只定向重寫已接受範圍，之後只驗修改段與相鄰對話。
6. 兩輪後仍有 P0 就交由人工處理，不再無限全文美化。
7. 繁中先以可從頭讀到結局的 Markdown 交付；使用者以 snapshot ID 鎖定後，才映射成 Ren’Py statement／label。

嚴重度定義：

- P0：事實、分支、人物知識或意思錯誤，必修。
- P1：明顯影響理解、人物或對話，應修。
- P2：品味微調，不可單獨啟動新一輪全文重寫。

這個固定兩輪上限防止 Agent 因自評分數或主觀偏好持續改寫，並讓「何時停止」成為可驗收規則。

### 校準與保留測試

- 先選一個約 15～30 個玩家可見文字區塊的校準場景，涵蓋至少兩名角色、新資訊、立場摩擦與一次狀態改變。
- 再選一個規則建立時未使用、而且類型不同的保留場景。
- 兩個場景必須使用同一規則；不能為了讓保留場景過關臨時加特例。
- 兩者通過後才凍結 SOP 版本並展開全文。

這相當於把「一段看起來不錯」和「規則具有基本泛化能力」分開。

### 多語資料流

台灣繁中是人工內容驗收基準。其他五語在繁中本機測試完成、準備正式上架前才一次整合。

每句重要內容的翻譯輸入不只包含原文，還可包含：

- statement／translation ID。
- 場景卡與角色聲線卡。
- 六欄詞彙與姓名映射。
- 表面意思、真正意圖、不可直說內容、情緒方向、不可改變事實與可自由在地化範圍。

每個目標語言做兩種審查：

1. 在地語感審查：自然搭配、禮貌、句尾、節奏與人物聲線。
2. 語意／狀態審查：事實、伏筆、稱呼、人物知識與選項代價。

整合後只修接受的段落，再驗修改段、詞彙表與有效 translation ID。沒有母語人工審校時，只能標記為 Agent 在地化候選版，不能宣稱母語商業審校。

### Manifest 驅動

範例 manifest 提供可機器讀取的宣告層，主要欄位包含：

- schema version、作品 title、slug 與版本。
- engine、虛擬尺寸、目標平台與 Web 開關。
- 支援語言。
- story files、篇幅政策、一般與偏離結局。
- 字型、品牌圖、封面、視窗圖示、必要圖片與事件 CG 狀態。
- 音樂語意槽與必要 SFX。
- 不得進公開包的 privacy exclusions。

manifest 是「預期狀態」；真正驗證要由 checker 對照檔案存在性、Ren’Py 設定與正式包內容，不能只檢查 JSON 可解析。

### 音訊與資產

- 劇本只呼叫語意槽，讓同一故事事件不綁定特定音檔。
- 繁中 snapshot 鎖定後，從已確認的動作建立一次動作／音效對照，再回寫 Ren’Py。
- 音效先批次檢查解碼、峰值、響度與刺耳高頻，再抽驗代表場景與停止時機。
- 素材權利紀錄保存來源、作者、授權、日期、修改與輸出檔名。
- 私人參考、生成中間稿、原始音訊、憑證、cache、存檔與測試資料不能進 Git 或玩家包。

## 測試驗證

SOP 採「依變更分類」而不是每次跑全套：

| 變更類型 | 必要驗證 |
|---|---|
| 純文字／錯字 | 修改段與前後文；章節完成時 lint |
| label／選項／變數 | 內容檢查、lint、受影響路線 smoke |
| 角色／背景／CG | manifest、尺寸、載入、變更場景、代表接觸圖 |
| UI／transform | lint、相關 testcase、桌面截圖 |
| 音訊 | 動作對照、manifest、批次技術檢查、代表播放場景 |
| 單一語言 | 有效 ID、詞彙表、修改段與雙重審查 |
| 本機候選版 | 靜態檢查、lint、一次完整 native smoke、本機啟動 |
| 批准後發行 | 指定平台 build、簽章、checksum、上傳後驗收 |

全域測試規則：

- Fail fast：前一步失敗先修，不繼續更昂貴的檢查。
- 同一 source snapshot 的完整 smoke 最多一次。
- 修正後只重跑失敗項與直接依賴。
- 純對白或錯字不自動使既有 native smoke 失效。
- UI、素材、音訊、label、變數或引擎設定改變時，才跑對應功能測試。
- 沒有目標平台實機或 VM 時必須標記「尚未實機驗證」，不能用結構檢查冒充實測。

本頁所依據的資料夾是 **SOP 與範例 manifest**；沒有單部遊戲的 `.rpy` 實作、build、checksum 或 `TEST-RESULTS` 可供本次驗證。因此上表是已定義的驗收契約，不是已經執行通過的測試報告。

## 部署／執行邊界

- 正式封裝前必須有明確的 source snapshot、版本、平台與語言集合。
- 只有使用者明確批准的 snapshot 才能建立批准平台的包。
- 玩家可見內容、版本、公開素材或設定再變更時，原批准失效，回到受影響驗收層。
- 正式流程包含 Force Recompile、build 分類、敏感檔掃描、代表 smoke、簽章、checksum 與上傳後遠端檔案核對；各項是否實際需要依平台與發行方式決定。
- Web 與行動平台不在預設範圍；不能因 Ren’Py 支援某平台就寫成已測試或已上架。
- macOS／Windows 的簽章、notarization、平台後台與商店審查屬發行階段，不應預先寫成完成狀態。
- 真正不能公開的檔案不能靠 archive 或封裝保密；只要進玩家包，就應假設可被技術性擷取。

## 限制

- 這套系統目前是文件化 SOP，不是已完成的自動化製作框架。
- 範例目錄、manifest 與 checker 契約不代表每部作品已實作相同檔案。
- 量產數量、平台、語言與內容範圍都是可被 Project Contract 覆蓋的預設，不是硬編碼產品承諾。
- Agent 在地化不能取代母語級商業審校；未審校時必須誠實標示。
- 自動 lint、靜態檢查與 smoke 不能取代實際閱讀、操作、平台安裝與權利審查。
- 發行平台規則會變動，正式操作前仍須回到當期官方文件與後台要求。
- SOP 無法證明某部遊戲已完成、已封裝、已簽章、已通過商店審查或已 release。

## 公開邊界

可公開：文件路由、階段閘門、Ren’Py 目錄責任、manifest schema 類型、文字有限 loop、多語資料流、變更導向 QA、隱私與發行停止原則。

不公開：任何單部作品的未公開故事、角色設定、完整劇本、私人肖像、原始或未採用素材、生成 prompt、原始音訊、測試存檔、憑證、簽章資料、帳號資訊、成本、定價、合作對象、權利談判與商務開發備忘錄。公開 Wiki 也不把內部審美偏好或私人來源誤寫成已對外承諾。

## Source of truth

- `../ScopeCut_Projects/visual-novel-production-sop/README.md`
- `../ScopeCut_Projects/visual-novel-production-sop/project-manifest.example.json`
- `../ScopeCut_Projects/visual-novel-production-sop/視覺小說製作規格與創作偏好.md`
- `../ScopeCut_Projects/visual-novel-production-sop/小說文字撰寫與多語在地化SOP.md`
- `../ScopeCut_Projects/visual-novel-production-sop/出版前商業決策與上架檢查清單.md`
- `../ScopeCut_Projects/visual-novel-production-sop/locales/`

上述文件是 SOP 現況的 source of truth。單部作品的實作、測試與發行狀態必須以該作品自己的 Project Contract、manifest、原始碼、測試結果與 build 紀錄為準。

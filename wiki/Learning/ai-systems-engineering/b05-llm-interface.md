---
title: "B05 LLM 應用介面"
description: "從 messages、token 與回傳格式理解一次模型呼叫。"
type: note
status: active
tags:
  - AI 系統工程
  - 工程基礎
date: 2026-10-09
---

# B05 LLM 應用介面

使用者看到的是聊天框，模型收到的是程式組好的請求。要理解品質或成本，先看實際送出的 messages、資料與設定，而不是只看畫面。

Token 是模型處理文字的單位，不固定等於一個字。Context 是這次請求可使用的內容；聊天紀錄、工具結果與文件片段都可能佔用空間。Messages 常用角色區分指示、使用者問題與既有回應，但角色名稱本身不能取代程式的權限控制。

生成設定會影響輸出行為。要求 JSON 或指定欄位，有助於程式讀結果；結構化回傳符合格式，仍可能填錯數值。Streaming 是分段接收結果，也不等於模型更正確。

## 看同一題的兩份請求

第一份只問「A-17 正常嗎？」第二份附上量測時間、溫度、門檻和資料來源。第二份比較有條件回答，但仍需規定：沒有資料時說明缺口，不自行補值；最後由程式核對必要欄位。

一段格式正確、內容卻寫成 28 度的 JSON，是答案錯誤。回應本文被截斷而無法解析，是格式或傳輸處理問題。兩者的修正方式不同，不能都靠增加提示詞長度。

## 練習

在一份合成請求裡標出指示、問題、歷史與工具資料。再為答案指定 `status`、`evidence_time`、`reason` 三個欄位，列出程式還需要檢查什麼。

自我檢查：能解釋為什麼縮短 context 可能降低成本，也可能丟掉判斷需要的資料；輸出長短與可用性要一起看。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/b08-debug-and-evidence]] — 上一篇：B08
- [[Learning/ai-systems-engineering/n01-requests-and-history]] — 下一篇：N01

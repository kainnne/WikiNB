---
title: "B01 AI 應用全貌與系統分工"
description: "分清應用、模型、Agent、工具和資料的責任，追一遍完整請求。"
type: note
status: active
tags:
  - AI 系統工程
  - 工程基礎
date: 2026-10-09
---

# B01 AI 應用全貌與系統分工

看到一張 AI 架構圖，我先問：使用者的問題從哪裡進來？真正的資料在哪裡？哪個程式有權執行動作？框框多不代表系統比較完整，能追完一個請求才有用。

App／Application 是整個應用。Frontend 接收輸入、呈現結果；Backend 處理請求與業務規則；Database 保存紀錄。LLM 依收到的內容生成回應，Tool 是程式實際能執行的能力，Agent loop 則負責讓模型提出工具請求、交給程式執行、再把結果交回模型。

這些是責任分工。一個 Python 程式也能同時包含後端、工具與迴圈，不必一開始拆成六個服務。雲端或地端說的是運行位置，前端或後端說的是工作內容，兩組分類可以同時存在。

## 追一個設備查詢

假設使用者問「A-17 現在正常嗎？」資料庫裡有最近一次的測量紀錄。最簡單的流程可以是：

```text
使用者 → 前端 → 後端 → 查詢紀錄
                       ↓
                 把紀錄交給 LLM
                       ↓
                  回傳可讀說明
```

查詢步驟已經固定時，由後端直接執行就好。如果要依問題選擇不同工具，才需要考慮 Agent loop。模型說「應該查 A-17」只是提出動作，程式仍要檢查設備 ID、使用者權限及工具是否存在。

工具回傳 `found: false` 表示完成查詢但沒有紀錄。Timeout 表示沒有完成這次查詢。兩者都不能改寫成「設備正常」；文字生成也不能補出不存在的測量值。

## 練習

畫出這個查詢的資料流，在每條箭頭旁寫傳送的內容。再回答：如果查詢工具壞了，誰應該知道失敗？若模型想重啟設備，原本的只讀流程在哪一層阻止它？

自我檢查：能把「模型提出動作」和「程式執行動作」分開說明，也能指出哪一份紀錄才是設備狀態的依據。

## 官方閱讀

- [MDN：Client-server overview](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview)

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/b02-python-reading]] — 下一篇：B02

---
title: "N06 身分、授權、護欄與核准"
description: "從可信身分到工具執行，建立授權與真人核准的流程。"
type: note
status: active
tags:
  - AI 系統工程
  - Agent
date: 2026-10-09
---

# N06 身分、授權、護欄與核准

Authentication 確認「你是誰」，Authorization 決定「你能做什麼」。登入成功後，仍可能沒有權限讀某台設備或修改門檻。兩件事要分開處理。

瀏覽器傳來的 `role: admin` 不是可信證明。角色與權限應從已驗證的服務端身分取得。按鈕隱藏只能改善介面，直接呼叫 API 時仍要做同一套檢查。

## 提議和執行分成兩步

模型可以提出「將 A-17 的警示門檻從 80 改為 85」，先保存為 pending，記下設備、原值、新值、提出者與有效時間。管理者核准時，應看到原提議的完整內容，不能只同意一句模糊的「繼續」。

執行前再確認身分、提議狀態及設備目前值。已撤銷、過期或內容變動的提議要拒絕或重新確認。Idempotency 用來避免同一個核准請求因重送而重複執行；它不代表所有動作天然安全。

LangGraph 的[人工中斷與恢復](https://docs.langchain.com/oss/python/langgraph/interrupts)可協助安排流程暫停，但核准者資格和業務驗證仍由應用實作。

## 練習

列出 viewer、operator、admin 能用的工具與資料。測試偽造角色、核准別人的提議、重送同一次核准，以及直接跳過前端呼叫 API。

自我檢查：能追出越權在哪裡被拒絕，並確認拒絕之後真的沒有寫入資料或呼叫有副作用的工具。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/n05-endpoint-harness-session]] — 上一篇：N05
- [[Learning/ai-systems-engineering/n11-retrieval-and-rag]] — 下一篇：N11

---
title: "N05 Endpoint、Harness、Gateway、Session"
description: "分清入口、執行控制、路由與對話狀態的存放位置。"
type: note
status: active
tags:
  - AI 系統工程
  - Agent
date: 2026-10-09
---

# N05 Endpoint、Harness、Gateway、Session

Endpoint、Harness、Gateway、Session 常畫在同一張圖上，但它們回答的問題不同：入口在哪裡、誰控制執行、請求經過哪個關卡、這次對話的資料放在哪裡。

模型端點接收推論請求，不必然保存整個聊天產品的歷史。Harness 控制模型與工具的執行。Gateway 可以處理路由、驗證或流量控制；具體做了什麼，要看實際配置。Session 用來對應一次互動的狀態，Session ID 本身不能當成擁有者證明。

## 三個情境分開測

在同一個 Session 裡追問，應帶到約定的必要上下文。開新 Session，應避免混入前一次內容。重整瀏覽器後能否繼續，則取決於客戶端識別與服務端保存方式。

如果狀態只在記憶體，程序重啟可能消失。若使用持久化與 checkpoint，還要決定誰能恢復哪份狀態。LangGraph 的[持久化文件](https://docs.langchain.com/oss/python/langgraph/persistence)說明了 thread 與 checkpoint 的關係；它們仍需接上應用自己的授權。

## 練習

畫出畫面紀錄、服務端 Session、業務資料三個位置。依序測同 Session、新 Session、重整及服務重啟，記錄預期與實際差異。

自我檢查：能指出「能接續」靠的是哪份資料，也能證明另一個使用者拿到 Session ID 後仍不能讀取。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/n04-workflow-and-parallelism]] — 上一篇：N04
- [[Learning/ai-systems-engineering/n06-identity-and-approval]] — 下一篇：N06

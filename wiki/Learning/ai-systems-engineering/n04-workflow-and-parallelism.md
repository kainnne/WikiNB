---
title: "N04 工作流、相依與並行"
description: "看資料相依決定執行順序，辨別固定流程與模型決策。"
type: note
status: active
tags:
  - AI 系統工程
  - Agent
date: 2026-10-09
---

# N04 工作流、相依與並行

一個任務能不能並行，先看後面的步驟需不需要前面的結果。程式寫成 async，只代表有非同步處理能力，不表示每件事都可以同時開始。

假設要讀設備狀態和維護規則，再提出建議。兩個只讀查詢若互不相依，可以並行；產生建議必須等兩邊結果回來。若其中一邊失敗，不能把空資料當作「沒有問題」。

Routing 決定走哪條分支，Workflow 將已知步驟和條件固定下來。需要模型判斷時，把它的決策限定在允許的選項內，不把任意文字當成下一個函式名稱。

## 用 LangGraph 表達流程

先畫清楚輸入、狀態與分支，再選工具。LangGraph 的 State 保存流程資料，Node 表達一個步驟，Edge 表達接續關係。這些抽象用來呈現你已有的控制邏輯，不會替你決定正確的業務規則。[LangGraph overview](https://docs.langchain.com/oss/python/langgraph/overview)是框架角色的入口。

比較循序與並行時，用相同資料與環境記錄起終點。模擬兩秒延遲只能說明排程差異，不能當作 GPU 或真實 API 的效能結果。

## 練習

畫出兩個讀取步驟和一個產生建議步驟。加入「維護規則不存在」的分支，再決定哪種失敗可有限重試、哪種應立即回報。

自我檢查：能說明每條相依，而不是只因為看起來快就把所有步驟並行。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/az06-exam-and-practice-review]] — 上一篇：AZ06
- [[Learning/ai-systems-engineering/n05-endpoint-harness-session]] — 下一篇：N05

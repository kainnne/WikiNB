---
title: "AZ02 Foundry 聊天與單一 Agent"
description: "在最小聊天用戶端上辨別單次生成與 Agent 工具流程。"
type: note
status: active
tags:
  - AI 系統工程
  - Azure
date: 2026-10-09
---

# AZ02 Foundry 聊天與單一 Agent

先把聊天呼叫做好，再加入一個只讀工具，比一開始串上多個資料來源更容易看清問題。聊天流程需要接收輸入、送出請求、處理回應；Agent 流程還要處理工具與執行狀態。

System 指示描述應用要求，User 訊息承載這次問題。指示不能讓服務取得本來沒有的權限。端點、部署與用戶端設定要彼此對上；相同程式在不同專案裡也可能需要不同配置。

Foundry 提供受管理的 Agent 能力；依採用的方式，平台與自己的程式負責的範圍會不同。閱讀[官方 Agent Service 概覽](https://learn.microsoft.com/en-us/azure/foundry/agents/overview)時，先確認自己用哪一種路徑，不直接混用不同範例的 SDK 語法。

## 用同一題對照兩個版本

聊天版只拿到你提供的假設備紀錄；Agent 版可提出一次只讀查詢，再依工具結果回答。對照時檢查它究竟收到什麼資料、是否執行查詢、失敗回應怎麼處理。

入口網站裡的一次成功操作，不代表自己的用戶端已能呼叫。真正驗收要保留用戶端輸入、工具事件和服務回傳；若只有 mock，另外記實作待補。

## 練習

在可用且已確認預算的環境完成最小聊天，再加一個只讀工具。遇到錯端點、缺權限或工具失敗，逐一定位處理位置。

自我檢查：能解釋平台提供什麼、應用還要實作什麼，以及模型回應與工具成功紀錄的差別。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/az01-azure-foundations]] — 上一篇：AZ01
- [[Learning/ai-systems-engineering/az03-responsible-ai]] — 下一篇：AZ03

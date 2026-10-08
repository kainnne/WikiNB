---
title: "AZ01 平台與 Python 起步"
description: "把 Azure 資源、專案、部署與呼叫端接回同一張資料流。"
type: note
status: active
tags:
  - AI 系統工程
  - Azure
date: 2026-10-09
---

# AZ01 平台與 Python 起步

學 Azure 時，先看自己要運行的應用，再看平台把哪些工作交給你。資源名稱、模型名稱與部署名稱可能不同，不能看到同一個字就認為它們是同一件事。

Subscription 是資源與帳務的管理範圍，Resource group 用來組織資源，Region 影響可用服務和資料位置。Endpoint 是程式呼叫的入口，模型部署則決定某次請求使用哪個配置。SDK 只是應用連到服務的一種方式。

[Microsoft Foundry 的官方概覽](https://learn.microsoft.com/en-us/azure/foundry/what-is-foundry)說明了模型、Agent、工具與管理能力的關係。本單元先建立位置與責任的理解，不要求同時開出所有資源。

## 先把一次請求寫清楚

設備助手在本機整理問題與假資料，透過已授權的端點呼叫模型，讀取回傳後驗證格式。畫圖時分開標示本機程式、雲端資源、身分與資料傳送範圍。

呼叫前確認訂用帳戶、區域、模型是否可用及計費條件。範例先讀懂 Python、JSON 與例外處理；只有測試替身時，記成「請求流程練習」，不算真實 Azure 呼叫完成。

## 練習

畫出資源、部署、端點和用戶端的關係。讓一份合成回應缺少必要欄位，說明程式怎麼拒絕把它當成正常答案。

自我檢查：能指出密鑰在哪裡注入、哪個程序真正送出資料，以及需要清理哪些練習資源。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/b07-network-and-process]] — 上一篇：B07
- [[Learning/ai-systems-engineering/az02-foundry-chat-and-agent]] — 下一篇：AZ02

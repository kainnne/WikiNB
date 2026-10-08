---
title: "AZ03 負責任 AI 與能力選擇"
description: "把負責任 AI 原則轉成具體設計與驗證問題。"
type: note
status: active
tags:
  - AI 系統工程
  - Azure
date: 2026-10-09
---

# AZ03 負責任 AI 與能力選擇

負責任 AI 不只是在頁面寫一句提醒，而是決定資料怎麼使用、錯誤會影響誰，以及重要操作由誰負責。這些問題應在設計時就出現。

AI-901 考綱包含公平、可靠與安全、隱私與安全、包容、透明、問責。每個原則都要連到可觀察的行為。例如系統是否讓不同語言的人都能完成操作、是否說明資料限制、是否有人能追查錯誤決策。[Microsoft 的負責任 AI 說明](https://learn.microsoft.com/en-us/azure/foundry/responsible-use-of-ai-overview)提供平台相關的閱讀入口。

## 看一個維護助手的取捨

設備助手對不同地點使用不同資料來源，資料品質可能不同。不能只因模型相同，就假設判斷品質也相同。若部分設備缺紀錄，應說明缺口，保留人工確認方式。

內容過濾可以處理某些輸入或輸出風險，但不能代替工具授權、事實核對和業務核准。模型能力、部署位置、回應速度與資料邊界也要依任務選擇，不是越大的模型一定越適合。

## 練習

挑一個使用情境，寫出可能受影響的人、資料限制、錯誤後果，以及兩项可測試的改善。再說明哪一項控制仍有不足。

自我檢查：能用具體情境解釋原則，不把一個過濾開關說成整套系統已安全或可靠。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/az02-foundry-chat-and-agent]] — 上一篇：AZ02
- [[Learning/ai-systems-engineering/az04-text-and-speech]] — 下一篇：AZ04

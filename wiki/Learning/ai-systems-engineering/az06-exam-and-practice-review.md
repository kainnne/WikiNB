---
title: "AZ06 考綱覆蓋與模擬驗收"
description: "把考綱、概念與實作分開記，整理錯因而非只背答案。"
type: note
status: active
tags:
  - AI 系統工程
  - Azure
date: 2026-10-09
---

# AZ06 考綱覆蓋與模擬驗收

準備考試時，我會把「能解釋」、「做過實作」和「仍需補課」分開。練習題答對，只能說明那題；照抄範例跑成功，也不代表能處理換一種輸入的情況。

目前 AI-901 的官方考綱分為 AI 概念與能力、Microsoft Foundry 的實作。考綱會更新，開始備考或報名時重新讀[官方 study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-901)，不要把本地舊表格當成永久範圍。

## 用能力矩陣整理缺口

| 主題 | 我能解釋什麼 | 有什麼實作證據 | 還缺什麼 |
| --- | --- | --- | --- |
| 模型與 Agent | 請求、工具與執行的分工 | 一次用戶端和工具事件 | 失敗處理 |
| 文字與語音 | 辨識、分析與生成的差別 | 合成資料測試結果 | 噪音與錯 ID |
| 視覺與擷取 | 描述、生成與欄位擷取的差別 | 來源與輸出的對照 | 缺欄位處理 |

這張表是記錄方式，範例欄位不是個人已完成證據。官方練習評量需要依目前入口登入使用；另外的私人題庫仍從既有私人學習入口進入，不把題目搬到這組公開筆記。

## 練習

做完一組題後，把錯因分成名詞混淆、服務選錯、流程理解不足與讀漏條件。挑一個錯因，用自己的話重講，再做一個小情境確認。

自我檢查：能對照考綱指出缺口，也知道自己的學習判準不能保證正式考試結果。進階方向另行選擇，不把所有證照都當成本系列的前置條件。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/az05-vision-and-extraction]] — 上一篇：AZ05
- [[Learning/ai-systems-engineering/n04-workflow-and-parallelism]] — 下一篇：N04

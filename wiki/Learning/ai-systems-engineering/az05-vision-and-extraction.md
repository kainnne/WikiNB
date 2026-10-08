---
title: "AZ05 視覺、生成與資訊擷取"
description: "分清影像理解、圖像生成與欄位擷取，檢查輸出是否有來源。"
type: note
status: active
tags:
  - AI 系統工程
  - Azure
date: 2026-10-09
---

# AZ05 視覺、生成與資訊擷取

讀一張圖片、產生一張圖片和從表單取出欄位，是三種目的。它們可能使用相關模型或工具，但輸出判準不同。

影像理解要看是否正確描述可見內容；圖像生成要看是否符合指定條件；資訊擷取則要看欄位、單位與來源能否對上。OCR 讀出文字，不代表已經理解整份文件，也不代表表格關係一定正確。

[Azure Content Understanding](https://learn.microsoft.com/en-us/azure/ai-services/content-understanding/overview)提供文件與多種內容的理解及結構化擷取能力。實作時仍要依目前支援的輸入、配置與 SDK 核對範例。

## 看一張假的檢查表

表上有設備 ID、日期、量測值和備註。先決定需要的 schema，再檢查每個欄位是否能追回來源。沒有日期時回缺欄位，比根據檔名猜日期更清楚。表上寫 82，結果填 28，即使 JSON 完整也不能通過。

若另做圖像生成練習，使用合成示意圖，不把生成圖當成現場證據。文件擷取和創作功能分開驗收，避免把不同任務混在一起。

## 練習

做三張測試表：完整、缺欄位、文字模糊。對照來源與輸出，分開記錄讀取失敗、欄位缺失和內容誤判。

自我檢查：能區分可讀文字、結構化欄位與推測內容；缺資料時，程式不自行補成看似完整的結果。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/az04-text-and-speech]] — 上一篇：AZ04
- [[Learning/ai-systems-engineering/az06-exam-and-practice-review]] — 下一篇：AZ06

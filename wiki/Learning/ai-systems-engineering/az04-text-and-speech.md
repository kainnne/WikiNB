---
title: "AZ04 文字與語音"
description: "區分文字分析、語音辨識、語音合成與語音翻譯。"
type: note
status: active
tags:
  - AI 系統工程
  - Azure
date: 2026-10-09
---

# AZ04 文字與語音

「讓 AI 聽懂維修描述」可能包含好幾個工作。音訊變文字是 Speech recognition，文字變語音是 Speech synthesis，換成另一種語言則涉及翻譯；文字裡再找設備名稱、重點或情緒，是另一段分析。

先把需要的輸入與輸出說清楚，再選服務。用多模態模型直接接收音訊和經過逐字稿分析，是兩條不同流程，錯誤來源也不同。[Azure Speech 官方概覽](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/overview)可確認能力範圍。

## 追一段測試語音

假設錄音說「A-17 昨天下午聲音變大」。辨識結果可能把設備 ID 聽錯，文字分析也可能誤判時間或事件。後端需要將實際設備 ID 與已知資料核對，不直接以流暢的摘要代替查證。

如果要生成朗讀，先確認文字正確再合成；朗讀自然不代表內容正確。若要翻譯，另外檢查數字、單位與專有名詞是否保留。

## 練習

使用自己錄製、可用於測試的短音訊，列出原文、辨識結果、抽出的設備與時間。刻意加入一個相近的 ID，檢查哪一層需要人工或規則核對。

自我檢查：能指出失敗在音訊輸入、辨識、文字分析、翻譯或生成，而不是全部叫「語音 AI 不準」。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/az03-responsible-ai]] — 上一篇：AZ03
- [[Learning/ai-systems-engineering/az05-vision-and-extraction]] — 下一篇：AZ05

---
title: "P04 部署、容器與網路深化"
description: "把 API、模型與持久資料分開部署，理解 GPU 和平台條件。"
type: note
status: active
tags:
  - AI 系統工程
  - 地端與部署
date: 2026-10-09
---

# P04 部署、容器與網路深化

N10 已完成一般 CPU 服務的打包與啟動，這裡再加入地端模型、持久資料和平台條件。不要把所有內容塞進同一個 image，最後分不出更新的是程式還是權重。

Image 保存程式與依賴，Volume 或約定的掛載位置保存需要保留的資料，模型權重依部署設計管理。Registry 分發 image，Tag 是版本標記；可重現的部署還應記清楚對應的產物識別與配置。

## D06：加上本地模型

先確認 CPU 架構、OS、模型格式、驅動與 GPU runtime 的支援。為另一種架構建置 image，不只是換個檔名；現成二進位和套件可能不相容。Docker image 也不自動包含或取代主機的 GPU 驅動。

用 [Compose 的服務、網路與 volume](https://docs.docker.com/compose/intro/compose-application-model/)把 API、模型和資料接起來。每個容器的 localhost 要各自理解，服務開始運行後還要確認模型已載入、依賴已就緒。

## 練習

更新 API 時保留資料與權重，再示範回到舊版 API。分別關掉模型或資料服務，追出用戶端得到的錯誤。需要實際 GPU 驗證時，保留裝置可見性、模型載入與一次推論的證據。

自我檢查：能回答重建哪些產物、保留哪些資料、哪些條件來自主機，以及資料改版後能否直接回復舊程式。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/p03-execution-stack]] — 上一篇：P03
- [[Learning/ai-systems-engineering/p05-inference-performance]] — 下一篇：P05

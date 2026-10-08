---
title: "P06 影像與事件系統設計"
description: "將影格轉成有時間、條件與狀態的事件，再決定如何處理。"
type: note
status: active
tags:
  - AI 系統工程
  - 地端與部署
date: 2026-10-09
---

# P06 影像與事件系統設計

一張圖看見異常，不代表應立即執行現場操作。影像系統需要把片段判斷轉成可追蹤的事件，再依規則決定提醒、提議或等待確認。

Sampling 決定看哪些影格，Detection 找出物件，Tracking 嘗試連續對應物件，VLM 可把視覺與文字一起用於理解。每一段都有自己的限制；取樣沒拍到的事情，後面的模型無法從缺失資料證明發生過。

## 從影格走到提議

可先用合成資料設計：影格→偵測結果→結構化事件→規則判斷→提議→真人核准。事件帶時間、來源和必要證據，Queue 暫存待處理工作，State machine 定義 pending、confirmed、resolved 等狀態如何轉換。

快規則可以處理固定條件，較慢的模型補充描述或分析。模型沒有回應時，流程應按約定停下或採取已設計的備援，不能把沒有答案當成「安全」。

## 練習

畫正常、重複事件、漏影格與模型逾時四條路徑。說明何時合併事件、何時重新查證，以及哪一步需要人確認。

自我檢查：能區分影像推測、已確認事件和允許操作，不讓一個可能錯誤的畫面判斷直接變成控制命令。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/p07-security-and-operations]] — 上一篇：P07
- [[Learning/ai-systems-engineering/p09-reliability-and-metrics]] — 下一篇：P09

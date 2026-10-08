---
title: "P03 軟體至裝置的執行堆疊"
description: "把應用錯誤定位到程序、作業系統、驅動、runtime 或硬體。"
type: note
status: active
tags:
  - AI 系統工程
  - 地端與部署
date: 2026-10-09
---

# P03 軟體至裝置的執行堆疊

看到 GPU 錯誤，不先重裝全部環境。先看是哪一層提出錯誤：程式資料、依賴、模型格式、驅動或硬體，各有不同的檢查方式。

程式啟動後成為 Process，由 OS 管理記憶體與資源。Driver 讓軟體與硬體協作，Runtime 提供執行所需的支援。CUDA 是 NVIDIA 的並行運算平台與程式模型；韌體則在裝置較低層支援運作。模型權重是資料，不是整個服務。[CUDA 官方指南](https://docs.nvidia.com/cuda/cuda-programming-guide/index.html)可用來核對它的定位。

## 從錯誤往下追

Python 匯入套件失敗，先看環境和依賴；模型路徑不存在，先看檔案與掛載；GPU 不可見，先確認主機與容器能否看到裝置，再看驅動和 runtime 的支援條件。

某層成功只能證明那一層。主機能辨識 GPU，不代表容器已被配置為可用；容器看到 GPU，也不代表模型格式或記憶體條件已滿足。

## 練習

畫出應用→套件／runtime→OS／driver→硬體的堆疊，把三種假錯誤放到適當層次。寫出下一個能縮小原因的檢查，不一次修改整套環境。

自我檢查：能解釋為什麼這一步有助定位，也能指出尚未驗證的相鄰層。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/p02-hardware-and-memory]] — 上一篇：P02
- [[Learning/ai-systems-engineering/p04-deployment-and-gpu]] — 下一篇：P04

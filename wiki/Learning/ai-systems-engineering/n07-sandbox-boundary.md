---
title: "N07 Sandbox 的實際邊界"
description: "用可成功的對照請求，驗證檔案與網路隔離是否真的生效。"
type: note
status: active
tags:
  - AI 系統工程
  - Agent
date: 2026-10-09
---

# N07 Sandbox 的實際邊界

Prompt 告訴模型不要讀某個檔案，工具清單限制可提出哪些動作，Sandbox 則在執行環境限制能碰到的資源。三者保護的位置不同，不能把其中一種說成全部。

如果工具能執行一般 shell 指令，工具名稱被允許仍不表示每個命令都安全。檔案、網路、程序與憑證的實際邊界，要由配置和運行環境決定。

## 讓拒絕有可信的對照

準備一份確實存在、在一般環境可讀的測試檔案，再放到不允許的路徑。若沙箱回覆拒絕，查看政策與日誌是否對應這次存取。對照的允許路徑也要成功，才知道不是程式根本沒有執行。

網路測試同理：使用自己控制的測試端點，確認它在隔離外可連，再測允許和拒絕情況。網站本來壞了或檔案不存在，都不能證明隔離有效。

[NVIDIA OpenShell 概覽](https://docs.nvidia.com/openshell/about/overview)是理解政策執行位置的一個參考；採用任何實作前，仍要核對自己的版本、配置與實際拒絕證據。

## 練習

寫出檔案與網路各一組「本來可用→允許成功→拒絕失敗」的結果。把工具拒絕與作業系統層拒絕分開標記。

自我檢查：能回答限制在哪一層、是否有繞路，以及未開啟的控制為什麼不能算已具備的保護。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/p08-nvidia-roles]] — 上一篇：P08
- [[Learning/ai-systems-engineering/p07-security-and-operations]] — 下一篇：P07

---
title: "N09 Hermes、Harness 與 CLI"
description: "用責任表讀懂現成 Agent 的模型、工具、Session、記憶與 skills。"
type: note
status: active
tags:
  - AI 系統工程
  - Agent
date: 2026-10-09
---

# N09 Hermes、Harness 與 CLI

使用現成 Agent 時，先看它代替自己寫了哪些程式，再決定要不要採用。產品能提供某項功能，不代表你的配置已啟用，更不表示它有權操作所有資源。

Hermes 這個名稱要先對上來源。本單元以 [NousResearch 的 hermes-agent](https://github.com/NousResearch/hermes-agent)為參考，閱讀時記錄實際版本；不要把別的同名模型或專案混進來。

模型提供者負責推論，Harness 控制執行迴圈，工具集提供可執行能力，MCP 連接外部能力，Session 處理互動狀態，長期記憶保存可在之後使用的內容，Skills 則描述特定任務怎麼做。配置和權限必須逐項核對，不能從產品名稱推斷。

## 不先裝一整套工具

先在文件或受限範例裡找出一次請求的路徑，列出它會讀的資料、可用工具、狀態保存位置和網路依賴。再與自己寫的簡單 Agent 比較，看看現成產品減少哪些工作，又增加哪些需要理解的設定。

CLI 讓你從終端操作，不等於程式天然受到隔離；Skill 裡的操作說明也不等於已取得使用者或服務端授權。

## 練習

做一張責任表，將每項能力標成文件描述、已配置、已實測。挑一個尚未啟用的功能，說明為什麼不能在專案報告裡寫成已完成。

自我檢查：能看著配置追出一次實際操作，而不是只會列出產品功能。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/n08-persistent-agent]] — 上一篇：N08
- [[Learning/ai-systems-engineering/n10-api-and-container]] — 下一篇：N10

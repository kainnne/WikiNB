---
title: CodexRules 與 agents CLI 規則系統
description: 用中央規則套件、專案層指令與按需路由，讓不同專案中的 Codex 保持一致又不浪費上下文。
type: note
status: active
tags:
  - CodexRules
  - AGENTS.md
  - agents CLI
  - Token 管理
  - AI 協作
date: 2026-08-14
updated: 2026-09-03
---

# CodexRules 與 agents CLI 規則系統

CodexRules 是私人工作規則的中央來源，`agents` CLI 則負責把這套規則安裝或更新到不同專案。目標是讓 Agent 一進入專案就知道基本工作方式，又不必每次載入所有長篇說明。

## 分層方式

- 根目錄 `AGENTS.md`：只放高頻原則與「什麼任務該讀哪份規則」的路由。
- `AGENTS_Intro/`：依工作類型拆分詳細規則，需要時才讀。
- 專案自己的 `AGENTS.md`：補充該 repository 的命令、限制與驗收方式。
- README／HANDOFF／STATUS：保存專案事實與目前狀態，不塞進通用規則。

## `agents` CLI 的用途

新專案可用 `agents install` 安裝中央規則；中央規則更新後，用 `agents update` 同步受管理區塊。CLI 會保留專案自己寫的非管理內容，也能自動包含中央規則資料夾中新加入的 Markdown 文件。

## Token 效率原則

規則檔應告訴 Agent 如何找到答案，而不是複製每個專案的完整背景。開始任務時先讀短入口、專案狀態與相關來源；只有跨專案整理或知識同步時才擴大範圍。這樣能減少重複掃描，也比較不會讓過期資訊長期佔據上下文。

## 系統層操作的熔斷規則

專案內的程式修改、測試與可回復工作仍讓 Agent 自主完成；只有操作範圍進入主力機的登入環境、系統服務、預設 handler、Finder／圖示快取或其他全域設定時，才提升安全門檻。

這類工作採「盤點、備份、單一變更、真實驗證、再決定下一步」的交易式流程。若服務或命令阻塞、留下未知程序，或 Finder 與背景 App 開始異常，Agent 必須停止同一子系統的寫入與替代工具重試，改為保存證據、唯讀診斷並等待決策。完整方法見 [[Systems/safe-system-operations-with-agents]]。

## 排程設計與目前邊界

這套系統曾把來源監測、晨間摘要、GEO 稽核與發布決策拆成不同排程，並限制監測工作只能讀取資料、不能自行修改或上架。這項設計的價值是把「發現變化」「判斷重要性」與「正式發布」分開，讓 Agent 的權限和責任更容易檢查。

目前所有自動排程都已暫停。WikiNB、GEO 與跨專案整理改為由 Kaine 明確觸發；先人工判斷代表性與職涯關聯，再決定是否更新或發布。

## 公開與私人邊界

這一頁只說明系統概念。真正的私人路徑、例外規則與維護指令留在本機 CodexRules，不應因 WikiNB 公開而一併曝光。

## 相關頁面

- [[Systems/safe-system-operations-with-agents]]
- [[Technical/kainnne-lumareader/03_macos_launchservices_incident_20260902]]

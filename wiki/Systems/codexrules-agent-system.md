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
updated: 2026-08-14
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

## 公開與私人邊界

這一頁只說明系統概念。真正的私人路徑、例外規則與維護指令留在本機 CodexRules，不應因 WikiNB 公開而一併曝光。

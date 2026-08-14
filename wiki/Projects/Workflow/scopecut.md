---
title: ScopeCut 專案範圍定義工具
description: 把模糊點子轉成可交給 Codex 執行的 Project Contract，先對齊成果、限制與驗收方式。
type: note
status: active
tags:
  - ScopeCut
  - Codex
  - Project Contract
  - 專案規劃
  - AI 工作流
date: 2026-08-14
updated: 2026-08-14
---

# ScopeCut 專案範圍定義工具

ScopeCut 解決的是 AI 專案最常見的起點問題：使用者知道自己想做什麼，卻還沒有把目標、邊界與驗收條件說清楚。它用引導式表單收集資訊，再整理成可交給 Codex 的 Project Contract。

## 主要流程

1. 使用者以畫面引導描述問題、對象、預期成果、限制與不做的事項。
2. 本機 Codex 將輸入轉成結構化專案合約，供使用者確認。
3. 確認後可保存到 WikiNB 的專案區，成為後續實作與回顧的共同依據。

## 帶來的改善

- 在寫程式前先定義成功條件，減少 AI 反覆猜測。
- 把「這次不做什麼」寫清楚，避免需求持續膨脹。
- 讓專案規格以 Markdown 留存，而不是消失在一次性對話裡。
- 將規劃、實作與知識庫串成可追蹤流程。

## 目前邊界

ScopeCut 依賴本機 Bridge 與登入流程來呼叫 Codex、保存及同步內容。它產生的是可審閱的工作合約，不是自動保證專案完成；高風險決策、公開內容與最終驗收仍需要人工確認。

產品頁：[scopecut.kainnne.com](https://scopecut.kainnne.com/)

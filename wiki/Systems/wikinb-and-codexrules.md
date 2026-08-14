---
title: WikiNB、CodexRules 與專案資料的分工
description: 以來源專案保存事實、CodexRules 保存工作方法、WikiNB 發布人類可讀說明的三層知識架構。
type: note
status: active
tags:
  - WikiNB
  - CodexRules
  - 知識架構
  - 同步
  - Single Source of Truth
date: 2026-08-14
updated: 2026-08-14
---

# WikiNB、CodexRules 與專案資料的分工

WikiNB 和 CodexRules 不應完全重複。兩者服務不同讀者，也有不同更新條件；把它們硬合成一份，反而會讓公開資訊混入私人規則，並讓 Agent 載入大量不必要內容。

## 三層架構

| 層級 | 保存內容 | 主要讀者 |
|---|---|---|
| 專案 repository | 程式、README、測試、HANDOFF、目前狀態 | 開發者與執行任務的 Agent |
| CodexRules | 穩定的工作原則、路由、驗收與安全界線 | Codex、Gemini CLI 等本機 Agent |
| WikiNB | 經整理的成果、功能、限制、學習與關聯 | 人類訪客與知識問答系統 |

## 每日同步流程

1. 依來源白名單計算內容指紋，找出新增、修改、移除或遺失的檔案。
2. 只閱讀有變動的來源及其必要上下文。
3. 判斷變動是否形成值得長期保存的成果、功能、限制或學習。
4. 以人類可讀方式更新對應 Wiki 頁與總索引。
5. 只有當跨專案的工作方法真的改變時，才更新 CodexRules。
6. 執行連結、安全、測試與網站建置檢查，再提交與推送。

## 不同步的內容

密碼、token、個資、私人客戶或學校資料、內部絕對路徑、第三方未授權素材、一次性除錯紀錄，以及尚未驗證的成果都不直接進入公開 Wiki。需要保留的短期狀態應放在專案 HANDOFF，而不是永久規則。

## 對 AI 問答的幫助

巢狀分類與清楚的標題、摘要、標籤，能讓檢索先找到少數相關頁面。每頁再明確區分「已完成」「目前邊界」「下一步」，Codex 或 Gemini 就比較不會把計畫誤答成事實，也不必讀完整 Projects 資料夾才能回答。

## 相關頁面

- [[Projects/Knowledge/wikinb]]
- [[Systems/codexrules-agent-system]]

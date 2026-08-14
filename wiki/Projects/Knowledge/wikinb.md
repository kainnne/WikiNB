---
title: WikiNB 個人知識與 AI 複習系統
description: 將巢狀 Markdown 筆記、公開網站、本機 Codex 與 Gemini 問答串成同一個可維護的知識系統。
type: note
status: active
tags:
  - WikiNB
  - 知識庫
  - Markdown
  - Codex
  - Gemini
  - GitHub Pages
date: 2026-08-14
updated: 2026-08-14
---

# WikiNB 個人知識與 AI 複習系統

WikiNB 是我的筆記彙整、作品說明與 AI 提醒助理。它把 Markdown 當作長期可攜的知識格式：人可以直接在網站閱讀，Codex 與 Gemini 也能依同一批內容回答「我做過什麼、目前做到哪裡、下一步是什麼」。

## 已形成的能力

- 用巢狀 `wiki/` 目錄保存專案、學習、個人背景與系統說明。
- 網站支援搜尋與頁面閱讀，內容由 GitHub Pages 發佈。
- 本機 Bridge 提供登入、Codex 對話、同步、上傳、建資料夾、重新命名與刪除。
- Gemini 問答會先檢索相關頁面，再以可引用的知識內容回答。
- Codex 可直接讀取完整本機筆記，適合做較深入的回想、整理與下一步規劃。

## 內容原則

WikiNB 是給人看的公開知識層，不是把每個 repository 原封不動複製上網。每頁優先說明成果、功能、限制與關聯；密碼、token、私人資料、內部路徑、未公開素材與冗長執行紀錄不進入公開 Wiki。

## 目前更新方式

WikiNB 不再由排程自動監測或更新。需要整理時，先由 Kaine 明確提出，再以來源白名單與內容指紋找出真正改變的專案，只閱讀必要檔案，最後由人工確認哪些成果適合公開。這能降低重複審閱與 token 消耗，也避免把練習、未完成原型或過時方向誤寫成代表成果。

公開網站：[wikinb.kainnne.com](https://wikinb.kainnne.com/)

## 相關頁面

- [[Systems/wikinb-and-codexrules]]
- [[Systems/codexrules-agent-system]]

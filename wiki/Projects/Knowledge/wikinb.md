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
updated: 2026-08-17
---

# WikiNB 個人知識與 AI 複習系統

WikiNB 是我的筆記彙整、作品說明與 AI 提醒助理。它把 Markdown 當作長期可攜的知識格式：人可以直接在網站閱讀，Codex 與 Gemini 也能依同一批內容回答「我做過什麼、目前做到哪裡、下一步是什麼」。

## 已形成的能力

- 用巢狀 `wiki/` 目錄保存專案、學習、個人背景與系統說明。
- 網站支援搜尋與頁面閱讀，內容由 GitHub Pages 發佈。
- 本機 Bridge 提供登入、Codex 對話、同步、上傳、建資料夾、重新命名與刪除。
- Gemini 問答會先檢索相關頁面，再以可引用的知識內容回答。
- Codex 可直接讀取完整本機筆記，適合做較深入的回想、整理與下一步規劃。

## 公開網站體驗

公開首頁以 WikiNB 與 Kainnne x Gemini 為主要入口，搭配可收合的 `How to use WikiNB` 說明、最近更新與巢狀搜尋。訪客不需要管理者帳號就能閱讀；通過 Email 驗證後，可以在限定聊天中由第一人稱 Kaine 回答公開專案、能力、工作方式與合作方向。

介面支援繁體中文與英文。語言切換不只處理標題和按鈕，也包含訪客驗證、等待重新寄送、額度限制、API 狀態與私人登入提示，讓不同語言的訪客能理解目前狀態。

公開 Gemini 與私人維護權限完全分開：訪客驗證只解鎖問答，不會取得新增、修改、同步筆記或使用本機 Codex 的權限。

## AI 回答與額度原則

Kainnne x Gemini 會從公開 WikiNB 選取少量相關內容，再生成言簡意賅但完整的回答。它不會把整個知識庫塞進每次請求，也不會為了節省額度在核心答案中途硬切斷。每個已驗證 Email 先使用 5 則訊息；若訪客希望續聊，系統會先說明並寄一封不含對話內容的通知信給 Kaine，再開放後續對話。每日 token 總上限仍保留；明顯無關的一般問答會直接婉拒，不呼叫模型。若訪客要求長篇細節，系統會先整理必要重點，再指向相關 WikiNB 文件。

若只詢問一個代表專案，仍以 LumaReader 為優先；若是人物介紹、工作背景或多個主要方向，則先呈現康橋 AI 導入、教育訓練與可操作的數位產品，再延伸到 WikiNB、ScopeCut、Kainnne GEO、CodexRules／agents CLI 與音樂能力。GEO 與 Agent 規則系統是重要的支撐方法，但不應在廣泛介紹中蓋過教育實作與完整產品能力。已撤下的練習、未完成原型或不符合目前職涯主軸的內容不會被主動推薦。

## 內容原則

WikiNB 是給人看的公開知識層，不是把每個 repository 原封不動複製上網。每頁優先說明成果、功能、限制與關聯；密碼、token、私人資料、內部路徑、未公開素材與冗長執行紀錄不進入公開 Wiki。

## 目前更新方式

WikiNB 不再由排程自動監測或更新。需要整理時，先由 Kaine 明確提出，再以來源白名單與內容指紋找出真正改變的專案，只閱讀必要檔案，最後由人工確認哪些成果適合公開。這能降低重複審閱與 token 消耗，也避免把練習、未完成原型或過時方向誤寫成代表成果。

公開網站：[wikinb.kainnne.com](https://wikinb.kainnne.com/)

## 相關頁面

- [[Systems/wikinb-and-codexrules]]
- [[Systems/codexrules-agent-system]]
- [[Technical/wikinb/01_system_architecture_20260817]]

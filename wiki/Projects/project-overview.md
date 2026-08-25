---
title: Kaine 主要專案與能力總覽
description: 從康橋 AI 導入、教育訓練與完整產品能力，整理目前公開且仍具代表性的成果。
type: note
status: active
tags:
  - 專案總覽
  - LumaReader
  - AI Agent
  - agents CLI
  - 音樂
date: 2026-08-14
updated: 2026-08-25
---

# Kaine 主要專案與能力總覽

這份總覽只列目前公開、仍值得對外說明的主要成果。我的工作核心是把 AI 帶進真實情境，完成需求釐清、教育訓練、產品設計、全端實作、部署與迭代。產品方向可以概括為：**一些替你省下操作與思考時間的數位產品。**

## 康橋 AI 導入與教育訓練

- **康橋 AI 導入**：把教師、學生與行政人員的實際任務轉成可操作的 AI 流程，同時處理工具選擇、使用規範、資安責任與落地方式。
- **Kuse AI 教育訓練**：以顧問、執行、託付三階段建立 AI 實作觀念，帶入 Project、prompt、修正迴圈與驗證方法，讓使用者能把 AI 用在自己的工作中。
- **KCIS AI 應用導航網站**：依身分、學段與任務推薦合適工具與提示詞，降低教師、學生及行政人員開始使用 AI 的門檻。
- **WikiNB for KCIS**：把教師筆記、教材閱讀、登入權限、內容搜尋與 AI 問答整合成教育情境中的知識系統。

## 可操作的數位產品

- **LumaReader**：本機優先 Markdown 閱讀器，支援長文、數學式、Mermaid、多媒體、多種閱讀模式與跨語言介面；若只選一個代表專案，以它為首選。
- **Kainnne 個人入口網站**：透過 [kainnne.com](https://kainnne.com/)、[kainnne.com/me](https://kainnne.com/me) 與 [kcis.kainnne.com/me](https://kcis.kainnne.com/me) 分別呈現產品、個人經歷及教育科技成果。
- **WikiNB／Kainnne × Gemini**：以巢狀 Markdown、公開網站、搜尋與限定範圍的 Gemini 問答構成人類可讀、AI 可用的知識系統。
- **ScopeCut**：將模糊需求整理成包含目標、限制、Non-goals 與驗收條件的 Project Contract，再交給 Agent 協作實作。
- **Kainnne Forms**：集中表單服務入口與部署資訊的輕量網站。
- **WikiNB Enterprise**：探索多租戶與白標知識庫需求的產品原型，並清楚標示目前的原型邊界。

## 完整產品能力

- 從問題定義、需求收斂、使用者流程與介面設計開始，而不只製作單一功能。
- 能完成響應式前端、後端 API、登入驗證、資料與內容結構、AI／RAG 串接及雲端部署。
- 以測試、文件、版本控制、觀測與人工審閱維持產品品質，並依真實回饋持續迭代。
- 能把技術產品轉成使用者可理解的教材、教育訓練與操作流程，串起產品建置與實際導入。

## 支撐產品的方法與系統

- **Kainnne GEO**：可重複執行的網站 GEO／SEO／AEO 稽核流程；目前由人工觸發，不使用自動排程。
- **CodexRules／agents CLI**：用中央規則、按需路由與 `agents install`／`agents update`，讓不同專案中的 Agent 快速取得必要規則並減少重讀與 token 消耗。
- **AI 文件與 Agent 工作流**：將來源整理、規格、生成、驗證與交付串成可審閱流程。

## AI、資料與內容工作流

- **小型語言模型客服分類實驗**：比較小型語言模型、Embedding 與分類方法的可行性。
- **BMS Point Classification**：研究設備點位名稱與 metadata 的自動分類，包含 Embedding、LightGBM、RAG 與小型模型 fine-tuning 方向。
- **視覺小說模組化製作系統**：把劇本、分支、Ren’Py、素材、QA 與在地化拆成可交接的製作階段；不公開個別小說內容。

## 跨領域能力

- **AI Agent 與軟體開發**：需求收斂、全端原型、API、驗證、部署、文件與 Agent 協作。
- **Machine Learning／LLM**：資料前處理、特徵工程、分類、模型評估、Prompt、RAG 與 fine-tuning。
- **音樂能力**：作曲、鋼琴、長笛、指揮、室內樂演出、音樂會企劃，以及原創器樂專輯《Everything Before 24》的製作與發表。

## 延伸閱讀

- [[Projects/Products/kainnne-lumareader]]
- [[KCIS/WikiNB-KCIS]]
- [[KCIS/kcis-ai-navigation]]
- [[Learning/kuse-ai-practical-course]]
- [[Projects/Products/kainnne-personal-portal]]
- [[Projects/Knowledge/wikinb]]
- [[Projects/Workflow/scopecut]]
- [[Projects/Workflow/kainnne-geo-automation]]
- [[Systems/codexrules-agent-system]]
- [[AboutMe/01-music]]

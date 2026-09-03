---
title: AI 時代的前端基本功
description: 不以大量手寫程式為前提，建立能指揮 Agent、拆解介面、判讀架構、驗收與安全部署的前端基礎。
type: learning
status: active
tags:
  - Frontend
  - AI Agent
  - React
  - TypeScript
  - Next.js
date: 2026-09-02
updated: 2026-09-03
---

# AI 時代的前端基本功

這門課為具備設計判斷力、對前端有興趣，並以 AI Agent 作為主要實作夥伴的學習者設計。課程不以大量手寫程式為前提，而是補齊能把美感轉成規格、理解網站運作、判斷 Agent 方案、找出問題與安全發布所需的前端基本功。

## 課程定位

這不是「不用懂前端，讓 AI 全做」的課，也不是傳統語法填鴨課。目標角色是 **AI-first 前端產品操作者**：你保留產品、美感與決策權，把大量實作交給 Agent，但有能力描述、判斷、驗證、除錯與安全發布。

全系列共有 10 個單元。這一頁是課程地圖，每個單元另有一篇可以獨立閱讀的完整教材。文章會先用生活化的比喻建立直覺，再解釋名詞、實際網站中的位置、常見誤判、Agent 協作方法與親手驗證方式。練習不要求從空白頁手寫應用；你會透過閱讀、標記、改小參數、操作工具、審查 diff 與要求 Agent 提供證據來建立基本功。

## 系列閱讀方式

建議依序閱讀，但不用一次讀完。每次只處理一個單元中的一小段，先回答預測題，再做觀察或操作，最後用自己的話重新解釋。能完成 Teach-back 才代表觀念真的可以拿來判斷 Agent 的工作。

| 單元 | 完整文章 | 最重要的能力 |
| --- | --- | --- |
| 0 | [[Learning/ai-first-frontend-foundations/00-request-to-pixel]] | 看懂一個網址如何變成畫面 |
| 1 | [[Learning/ai-first-frontend-foundations/01-html-dom-semantic-structure]] | 把視覺版面翻成有語意的結構 |
| 2 | [[Learning/ai-first-frontend-foundations/02-css-visual-system]] | 把美感翻成可維護、可響應的規則 |
| 3 | [[Learning/ai-first-frontend-foundations/03-javascript-data-and-async]] | 看懂操作、資料與非同步狀態 |
| 4 | [[Learning/ai-first-frontend-foundations/04-react-components-and-state]] | 判斷元件、props、state 與 Effect 邊界 |
| 5 | [[Learning/ai-first-frontend-foundations/05-typescript-data-contracts]] | 用型別契約提早發現理解落差 |
| 6 | [[Learning/ai-first-frontend-foundations/06-npm-and-build-tools]] | 看懂專案如何安裝、啟動與建置 |
| 7 | [[Learning/ai-first-frontend-foundations/07-nextjs-server-client-boundaries]] | 判斷路由、資料與 server／client 邊界 |
| 8 | [[Learning/ai-first-frontend-foundations/08-agent-task-design]] | 把美感與需求寫成 Agent 可驗收契約 |
| 9 | [[Learning/ai-first-frontend-foundations/09-debugging-release-and-rollback]] | 用證據除錯、發布並保留回復能力 |

## 常用工具包

- [[Learning/ai-first-frontend-foundations/toolkit]] — 可重用的 Agent 前端任務 Brief、六面驗收與發布／rollback 證據表。

## 固定學習循環

每個單元都用相同節奏：

1. **先預測**：動手前說出你認為會發生什麼。
2. **建立模型**：只學足以解釋現象的核心觀念。
3. **辨認訊號**：在現有網站、專案檔案或錯誤訊息中找到它。
4. **指揮 Agent**：用任務規格要求 Agent 做小範圍變更。
5. **親手驗證**：用瀏覽器、終端機、diff 或 preview 證明結果。
6. **Teach-back**：用自己的話解釋，不靠背名詞。
7. **記錄狀態**：更新已掌握、仍混淆與下一次練習。

## 單元 0：從需求到像素的網站系統地圖

完整教材：[[Learning/ai-first-frontend-foundations/00-request-to-pixel]]

核心問題：一個網址怎麼變成螢幕上的畫面？

- 認識 client、server、request、response、HTML、CSS、JavaScript、asset、DOM、render。
- 分清「原始碼」「build 產物」「瀏覽器實際收到的內容」。
- 理解 framework、library、runtime、package、build tool 不是同一類東西。
- 練習：在一個已上線網站，用 Network 找 document、CSS、JavaScript、圖片與 API；說明每一項失敗時使用者會看到什麼。
- 產出：一張網站請求到像素的邊界圖。

## 單元 1：HTML／DOM——畫面的語意骨架

完整教材：[[Learning/ai-first-frontend-foundations/01-html-dom-semantic-structure]]

核心問題：畫面不看顏色時，結構還說得通嗎？

- HTML 元素、attribute、nesting、document outline、DOM tree。
- header、nav、main、section、button、link、form、label 等語意選擇。
- 可及名稱、鍵盤操作、圖片替代文字與表單錯誤提示。
- 練習：不改設計，只讓 Agent 修正一個頁面的語意與鍵盤操作；用 Elements 與鍵盤逐項驗收。
- 產出：語意／可及性稽核表。

## 單元 2：CSS——把美感變成可維護的視覺系統

完整教材：[[Learning/ai-first-frontend-foundations/02-css-visual-system]]

核心問題：怎麼把「看起來對」變成可重複、可響應、可驗收？

- cascade、specificity、inheritance、box model、position。
- Flexbox、Grid、spacing、typography、color、radius、shadow。
- design tokens、component variants、breakpoint 與 content-driven responsive design。
- hover、focus、active、disabled、loading、empty、error 等狀態。
- 練習：把一份美感描述翻成 token 與狀態矩陣，要求 Agent 套用；在手機、平板、桌面寬度驗收。
- 產出：最小 design system 與響應式檢查表。

## 單元 3：JavaScript——行為、資料與非同步

完整教材：[[Learning/ai-first-frontend-foundations/03-javascript-data-and-async]]

核心問題：使用者操作後，資料如何改變畫面？

- value、variable、array、object、function、condition、event。
- 資料形狀、不可變更新與「同一筆資料的唯一來源」。
- Promise、async／await、Fetch API、JSON、HTTP status 與 error。
- browser 與 server 執行環境的差別。
- 練習：閱讀 Agent 產生的互動流程，不從零手寫；預測一次 click、一次成功請求與一次失敗請求的狀態變化。
- 產出：事件表、資料表與失敗路徑圖。

## 單元 4：React——元件、props、state 與 Effect 邊界

完整教材：[[Learning/ai-first-frontend-foundations/04-react-components-and-state]]

核心問題：怎麼把介面拆成能長期維護的互動元件？

- component tree、JSX、props、state、render、event handler。
- 狀態的最小集合、derived data、lifting state up。
- Effect 是同步外部系統的逃生口；先分清 render、event、Effect。
- ref 的用途與不應濫用的情境。
- 練習：對一個表單或清單建立元件樹、props 表、state 表、event 表；抓出一個不必要的 Effect。
- 產出：React 四表規格，Agent 可直接依此實作。

## 單元 5：TypeScript——把想法變成資料契約

完整教材：[[Learning/ai-first-frontend-foundations/05-typescript-data-contracts]]

核心問題：如何在執行前發現「彼此以為的資料不同」？

- inference、annotation、object shape、optional、union、literal、narrowing。
- type 與 interface 的實務角色；函式輸入與回傳型別。
- `unknown`、型別斷言與 runtime validation 的邊界。
- React props、API response 與表單資料的型別契約。
- 練習：閱讀一個刻意失敗的 type check，先用白話說出契約衝突，再讓 Agent 修正；確認修正不是用 `any` 或亂加 `as` 隱藏問題。
- 產出：資料契約卡與 type-error 翻譯表。

## 單元 6：npm 與建置工具——看懂專案如何被組裝

完整教材：[[Learning/ai-first-frontend-foundations/06-npm-and-build-tools]]

核心問題：原始碼如何變成可以部署的產物？

- Node.js、npm、package、dependency、devDependency、lockfile。
- `package.json` scripts、dev server、build、bundle、source map、`dist/`。
- Webpack 的 dependency graph、entry、output、loader、plugin、mode。
- 為何現代框架常把配置藏起來，以及何時要向下追工具鏈。
- 練習：只讀一個現有專案的 `package.json`，請 Agent 畫出啟動與建置流程；親自核對 build log、輸出資料夾與 source map。
- 產出：專案啟動／建置卡，不要求手寫 Webpack config。

## 單元 7：Next.js——路由、資料與 server／client 邊界

完整教材：[[Learning/ai-first-frontend-foundations/07-nextjs-server-client-boundaries]]

核心問題：哪些工作應在 server，哪些必須到 browser？

- App Router、page、layout、nested／dynamic route、Link。
- Server Component 預設；需要 state、event、browser API 才建立 Client boundary。
- Route Handler、資料庫、secret、環境變數與 client bundle。
- loading、error、not-found、cache、dynamic data 與 streaming 的觀念。
- Proxy 只用於真正的 request boundary 工作，例如 rewrite、redirect 或 header 處理。
- 練習：為一個內容網站畫 route map 與 server／client boundary；要求 Agent 解釋每個 `'use client'` 的必要性。
- 產出：路由表、資料流與秘密邊界圖。

## 單元 8：Agent 任務設計——從美感直覺到可執行規格

完整教材：[[Learning/ai-first-frontend-foundations/08-agent-task-design]]

核心問題：怎麼讓 Agent 的快，變成可控而不是不可審查？

- 背景、使用者、目標、範圍、非目標、內容、互動與限制。
- reference 拆解：保留什麼、借鑑什麼、禁止照抄什麼。
- acceptance criteria、狀態矩陣、響應式規則、可及性與證據。
- 先檢查現有專案與 AGENTS.md，再計畫、實作、測試、摘要。
- 限制變更範圍；要求 Agent 說明假設、風險與未驗證項目。
- 練習：把「做得高級一點」重寫成 Agent 可驗收的任務契約，完成一次小變更並審查 diff。
- 產出：可重用前端任務 brief。

## 單元 9：除錯、驗收、部署與回復

完整教材：[[Learning/ai-first-frontend-foundations/09-debugging-release-and-rollback]]

核心問題：你怎麼知道網站真的完成，而不只是截圖好看？

- Elements／Styles、Console、Network、裝置模式與鍵盤驗收。
- `git status -sb`、`git diff`、測試、lint、typecheck、build 的證據層級。
- visual、functional、responsive、accessible、performance、security 六面驗收。
- preview 與 production；環境變數、部署紀錄、rollback 與部署後 smoke test。
- 練習：故意製造一個 API 失敗與一個 responsive 問題，根據證據定位；用 preview 驗收，寫出回復條件後才發布。
- 產出：發布證據包與 rollback 卡。

## 結業任務

選一個真實的小型網站需求，由 Agent 實作，你負責：

1. 寫 brief、元件樹、狀態表、路由表與驗收條件。
2. 判斷 server／client 與資料／secret 邊界。
3. 每輪審查 diff，拒絕無關或無法解釋的改動。
4. 用 Console、Network、裝置模式、鍵盤、測試與 build 驗收。
5. 先發布 preview，再完成 production 與 rollback 證據。

通過條件不是能背語法，而是能對每個重要決策回答：「為什麼這樣做、失敗會看到什麼、我用什麼證據確認」。

## AI Agent 時代必須建立的觀念

- Effect 用於同步 React 與外部系統；由特定使用者操作造成的工作通常留在事件處理流程。
- React render 是計算新的 UI 描述並提交必要的 DOM 更新，不等於把整頁清除重畫。
- TypeScript 型別在編譯後不會替你驗證 runtime 的外部資料；`as` 只是型別斷言，不是資料驗證。
- interface 與 type 都能描述資料契約；選擇重點是資料形狀、擴充方式與可讀性，不是背誦語法優劣。
- 新專案的工具選擇應根據 routing、data、render 與 deployment 需求，不要把初始化工具當成架構決策。
- 一個 route 可以混合 server／client、靜態、快取、動態與串流內容；應依資料與互動邊界判斷。
- Proxy 是 request boundary 工具，不用來承擔慢速資料取得或完整授權系統。

## 對話式學習紀錄

每次在本對話完成一個段落後，記錄四件事：

- 已能獨立解釋。
- 能在提示下操作。
- 仍容易混淆。
- 下一個最小練習。

穩定、可公開的教材會同步 WikiNB；個人卡點、未公開專案內容與研究底稿只留在本機工作區。

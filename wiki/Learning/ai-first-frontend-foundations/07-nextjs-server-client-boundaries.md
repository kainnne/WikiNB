---
title: 單元 7：Next.js——路由、資料與 server／client 邊界
description: 以頁面、資料、互動與秘密為線索理解 Next.js 應用，判斷工作應放在 server、client 或 request boundary。
type: learning
status: active
tags:
  - Frontend
  - Next.js
  - Routing
  - Server Components
  - AI Agent
date: 2026-09-03
updated: 2026-09-03
---

# 單元 7：Next.js——路由、資料與 server／client 邊界

> 課程首頁：[[Learning/ai-first-frontend-foundations]]

Next.js 不只是「幫 React 加路由」，也不是把整個網站自動變成 SSR。它提供一套組織頁面、共用 layout、在 server 取得資料、建立 client 互動、處理 request 與產生部署成果的框架慣例。

真正需要學的不是每個檔名，而是邊界判斷：哪一段只需要產生內容？哪一段需要使用者即時操作？資料和 secret 在哪裡？哪些結果可以預先準備，哪些必須在 request 發生時取得？當 Agent 加上 client boundary 或新 API route 時，你應該能判斷理由是否成立。

## 本單元完成條件

完成後，你應該能夠：

1. 畫出網站 route map，辨認 page、layout、nested 與 dynamic route。
2. 解釋 Server Component 與 Client Component 是執行責任邊界，不是兩種視覺元件。
3. 判斷 state、event 與 browser API 為何需要 client boundary。
4. 確認資料庫與 secret 不會進入 client bundle。
5. 區分 page data、Route Handler 與 request boundary 工作。
6. 為 loading、error、not-found、cache、dynamic 與 streaming 建立可驗收規格。

## Route 是網址與內容責任的對應

Route map 先回答：使用者能到哪些網址，每個網址的用途、主要內容與權限是什麼。

```text
/
/articles
/articles/[slug]
/account
/account/settings
```

Dynamic segment 代表部分路徑由資料決定，例如文章 slug。Nested route 代表頁面在網址與 layout 上具有層級關係。建立檔案前先畫 route map，可以避免 Agent 因為頁面看起來相似，就把不同使用情境塞進同一個巨型 component。

每一條 route 至少要記錄：

- URL pattern。
- 使用者目的。
- 是否公開、登入或需要特定權限。
- 主要資料來源。
- loading、empty、error 與 not-found 行為。
- 需要的 server／client 邊界。

## Page 與 layout 的責任

Page 表示某條 route 的主要內容入口。Layout 包住一組頁面，保存共用導覽、側欄或結構。共用不等於所有資料都塞進最外層 layout；只有跨子路由仍真正共同、且生命週期合理的內容才放上去。

如果 Agent 把頁面專用 loading、權限判斷或大量資料取得提升到全站 layout，可能讓不相關 route 也受到影響。反過來，每頁重複建立相同導覽與 context，也會失去 layout 的價值。

## Server Component：先在 server 完成不需要 browser 的工作

在 App Router 的心智模型中，component 預設可以在 server 執行。這讓它能接近資料來源、使用 server-only 能力，並減少送往 browser 的 JavaScript。

適合 server 的工作通常包括：

- 讀取資料庫或受保護服務。
- 使用不應公開的環境變數。
- 產生以內容呈現為主的 UI。
- 在輸出前完成資料整理與權限相關讀取。
- 使用較大的 server-only dependency，而不送進 client bundle。

Server Component 仍然是 React component，但不能直接處理 browser 中的 click state、`window` 或 DOM。它產生內容，再把需要互動的部分交給較小的 client 邊界。

## Client Component：只有需要互動能力的區域才跨界

Client Component 能使用 state、event handler、Effect 與 browser API。常見情境有：

- 使用者輸入與即時驗證。
- 開關選單、tab、dialog。
- 使用 local storage、clipboard 或 viewport。
- 訂閱 browser 事件。
- 使用只能在 client 運作的第三方元件。

Client boundary 會影響它下面的 module graph。把整頁標成 client 可能把原本可留在 server 的程式與資料處理一起送進 browser。這不一定立即出錯，但會增加下載、執行與秘密誤用風險。

審查每個 `'use client'` 時，只問一題：「這一層具體需要哪一項 client-only 能力？」如果只有其中一顆按鈕需要互動，就考慮把邊界縮到那個互動島，而不是整頁。

## Server 與 client 可以組合，不需要二選一

一個文章頁可以在 server 讀取文章與作者資料，再把收藏按鈕、留言輸入與分享對話框設為 client。使用者最後看到的是同一頁，但不同部分由不同環境承擔。

重要限制是跨邊界傳遞的 props 必須能被合理序列化，而且不能把 server-only function、資料庫連線或 secret 當作一般 props 送到 client。邊界同時也是資料公開邊界。

## 資料取得：先看誰需要與誰能安全接觸

選擇資料取得位置時，依序問：

1. 資料是否需要 secret 或資料庫權限？需要就留在 server。
2. 首次內容是否應直接出現在回應中？若是，優先在 server 準備。
3. 資料是否只因 client 上的即時操作而取得？可能由 client 發 request。
4. 結果能否跨使用者共用或快取？是否含個人化內容？
5. 更新後需要讓哪些 route 或 cache 失效？

不要因為「API 比較有架構」就讓 server component 透過自己的公開 API 繞一圈；也不要為了少一個 request，把所有互動資料都放在首次頁面輸出。

## Route Handler：建立明確的 HTTP 邊界

Route Handler 適合提供 request／response 介面，例如接收表單、回傳 JSON、處理 webhook 或讓 client 取得受控資料。它要定義 method、輸入驗證、授權、錯誤格式與狀態碼。

它不是把任何 server function 都包成 API 的理由。若工作只在同一個 server render 流程內使用，額外 HTTP 層可能增加延遲與契約成本。反之，若有外部呼叫者或需要明確網路邊界，Route Handler 就能提供可觀察、可測試的介面。

## Request boundary：在請求進入路由前做少量判斷

Rewrite、redirect、headers、locale 或少量請求分類，適合放在 request boundary。它位於大量請求的前方，因此工作應快速、可預測。

不要把慢速資料查詢、完整授權系統或複雜商業邏輯都塞進這一層。真正的權限仍應在接觸資料與執行敏感操作的位置再次驗證，不能只靠前端隱藏頁面或入口 redirect。

## Rendering 不只 SSR／CSR

現代應用可能同時包含：

- 預先產生且可長時間共用的內容。
- 依時間或事件重新驗證的快取內容。
- 每次 request 都要取得的動態內容。
- 先傳送頁面骨架，再逐步送出較慢區塊的 streaming。
- 到 browser 後才因互動取得或更新的資料。

這些不是互斥的全站模式，而是每條 route、每份資料甚至每個區塊的決策。對產品最重要的是新鮮度、等待體驗、個人化、成本與錯誤恢復，而不是選一個聽起來最先進的名詞。

## Loading、error 與 not-found 是正常狀態

框架提供邊界不代表設計已完成。你仍要決定：

- Loading 是否保留版面，避免內容跳動。
- Error 是否說明發生什麼、哪些資料仍安全，以及能否重試。
- Not-found 是真的資源不存在，還是因權限不應透露存在。
- Streaming 中先出現的內容是否足以讓使用者理解頁面。
- 某個子區塊失敗時，是否需要拖垮整頁。

這些狀態應進入設計與驗收，而不是由 Agent 自行使用預設文字填補。

## Cache 是資料承諾，不只是效能開關

快取代表「在某個範圍與時間內，允許重用先前結果」。你必須知道快取鍵包含什麼、對哪些使用者共用、何時失效，以及更新後如何重新取得。

個人資料若被錯誤共用，是安全問題；應更新的內容若長期不失效，是正確性問題；完全不快取則可能帶來成本與等待。不要用「開／關快取」一句話結束，要求 Agent說明資料新鮮度與隔離需求。

## 一張 server／client／secret 邊界表

| 工作 | 建議位置 | 判斷理由 | 驗證證據 |
| --- | --- | --- | --- |
| 文章內容讀取 | server | 首次呈現、不需 browser event | response、server log |
| 收藏按鈕狀態 | client + server action／API | 需要 click，更新需 server 驗權 | UI 狀態、request、資料結果 |
| 資料庫連線 | server only | 含權限與連線秘密 | import 邊界、client bundle 檢查 |
| URL redirect | request boundary／route | 在進入內容前改變目的地 | status、Location header |
| local storage 偏好 | client | browser-only API | 實際 browser 行為 |

## 與 Agent 協作的提示詞

```text
請先為這個 Next.js 功能產出 route map、資料流與 server／client／secret 邊界圖，不要先加 use client 或 API route。

每個 route 說明：
- page、共用 layout 與 dynamic segment；
- 首次內容與互動內容；
- 資料取得位置、權限與 cache／freshness 要求；
- loading、empty、error、not-found；
- 每個 client boundary 使用的 state、event 或 browser API；
- Route Handler 或 request boundary 是否真的必要。

實作後請檢查 client bundle 不含 secret，並用直接開深層 URL、重新整理、慢速資料、無資料、錯誤與未授權情境提供證據。
```

## 操作練習：為一個內容網站畫邊界

1. 列出首頁、列表、內容頁與管理頁的 route map。
2. 為每頁標示公開、登入或特定權限。
3. 圈出需要 state、event 或 browser API 的區塊。
4. 標出資料庫、secret 與外部服務，只能留在 server。
5. 為每份資料決定新鮮度與 cache 行為。
6. 寫出 loading、empty、error、not-found 的使用者畫面。
7. 讓 Agent 說明每個 client boundary，再刪除無法說明者。
8. 用 Network、server log、build 與 client bundle 證據驗收。

## 常見誤判

- 「Next.js 網站全部是 SSR」：同一頁可混合多種資料與互動邊界。
- 「use client 越多越能互動」：過大的邊界會增加 client 工作與公開風險。
- 「環境變數都只在 server」：被 client 使用或建置注入的值仍可能公開。
- 「redirect 就是授權」：敏感資料與操作位置仍要重新驗權。
- 「有 loading 檔案就完成等待設計」：版面、訊息、可恢復性仍需產品決策。
- 「cache 只是加速」：它同時決定資料新鮮度與使用者隔離。

## Teach-back 題目

1. Server Component 與 Client Component 的差別為什麼不是「有沒有 HTML」？
2. 什麼證據能支持一個 component 需要 client boundary？
3. Route Handler 何時有價值，何時只是多繞一層？
4. 為什麼 request boundary 的 redirect 不能取代真正授權？
5. Cache 決策如何同時影響效能、正確性與隱私？

上一課：[[Learning/ai-first-frontend-foundations/06-npm-and-build-tools]]

下一課：[[Learning/ai-first-frontend-foundations/08-agent-task-design]]

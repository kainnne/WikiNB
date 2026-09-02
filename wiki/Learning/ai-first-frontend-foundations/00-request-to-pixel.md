---
title: 單元 0：從需求到像素的網站系統地圖
description: 先理解網址、瀏覽器、server、HTML、CSS、JavaScript、API、build 與 runtime，再開始學框架。
type: learning
status: active
tags:
  - Frontend
  - Web Fundamentals
  - DevTools
  - AI Agent
date: 2026-09-02
updated: 2026-09-02
---

# 單元 0：從需求到像素的網站系統地圖

> 課程首頁：[[Learning/ai-first-frontend-foundations]]

## 本單元完成條件

你不需要背出完整網路協定，但要能用自己的話回答：

1. 瀏覽器輸入網址後，至少發生哪五件事？
2. HTML、CSS、JavaScript 與 API 各自故障時，畫面可能怎麼壞？
3. React、TypeScript、Webpack、Next.js 分別位於哪一層？
4. Agent 說「build 成功」時，為什麼還不能直接等於「網站完成」？

## 一張心智圖

```text
人的需求
  ↓ 轉成頁面、內容、狀態與驗收規格
專案原始碼
  ↓ TypeScript／框架／建置工具檢查與轉換
可部署產物或可執行伺服器
  ↓ 部署平台與網域
瀏覽器送出 request
  ↓ server 回傳 document、assets、data
瀏覽器解析 HTML + CSS，執行 JavaScript
  ↓ DOM／樣式／互動更新
使用者看到像素並完成任務
```

每個箭頭都可能成功或失敗。前端基本功不是把工具名稱背完，而是知道問題在哪個邊界、要看什麼證據。

## 各層只先記一件事

| 名稱 | 本單元的白話定義 | 出問題時先看 |
| --- | --- | --- |
| HTML | 內容與語意結構 | Elements、document response |
| CSS | 排版與視覺規則 | Styles、計算後樣式、viewport |
| JavaScript | 行為、資料處理與互動 | Console、Sources |
| API | 前端與資料服務的請求契約 | Network 的 URL、method、status、response |
| React | 用元件與狀態組合互動 UI 的 library | component／props／state／event |
| TypeScript | 在執行前檢查資料與程式介面契約 | typecheck error、型別定義 |
| Webpack | 從相依入口建立圖並輸出可服務 assets 的 bundler | build log、entry／output／loader／plugin |
| Next.js | 在 React 之上提供路由、render、server 能力與建置慣例的 framework | route、server／client boundary、build／runtime log |

## 三種「東西」不要混在一起

### 1. 原始碼

人與 Agent 維護的內容，例如 component、CSS、TypeScript、圖片與設定檔。瀏覽器不一定會原樣收到它。

### 2. Build 產物

工具檢查、轉換、切割、命名或壓縮後的檔案。Webpack 影片中的 `dist/`、bundle、hash、Babel 與 source map 都在解釋這個階段。

### 3. Runtime 狀態

網站真正執行時發生的事：請求 API、使用者點擊、資料成功或失敗、server log、browser console。Build 通過只能證明建置階段沒有阻擋錯誤，不能證明所有 runtime 路徑、畫面與可及性正確。

## SSR／CSR 先不要當成二選一

Next.js 影片用 SSR 與 CSR 對比幫助入門，這對理解「HTML 在哪裡先被準備」有用，但現代 Next.js 同一頁可以混合 server 與 client 工作：

- page 與 layout 預設可在 server 產生內容、取資料與保護 secret。
- 需要點擊狀態、Effect、`window` 或其他 browser API 的互動區才建立 client boundary。
- 首次載入可先收到 HTML，之後再 hydration，讓 client 互動生效。
- 靜態、快取、動態與串流也可能同時存在，不能用固定的「server 幾成、client 幾成」描述所有網站。

## 操作練習：第一次只觀察，不改程式

選一個你熟悉的公開網站，建議先用 WikiNB。

1. 打開瀏覽器 DevTools 的 Network，重新整理頁面。
2. 找到 Type 為 document 的第一個請求，記錄 status 與 response type。
3. 找一個 CSS、一個 JavaScript、一張圖片；若網站沒有其中一類，記錄「沒有」而不是猜。
4. 找是否有 fetch／XHR。若有，記錄 URL、method、status，以及 response 大致是 HTML、JSON 或其他格式。
5. 切到 Console，記錄 error 和 warning；沒有也要寫「未觀察到」。
6. 回答：如果你剛才看到的每一項各自失敗，使用者會看到什麼？

不要貼任何 token、cookie、Authorization header 或私人 response 給 AI。需要協助時，只提供已遮蔽的錯誤訊息、status、request 類型與重現步驟。

## 可直接交給 Agent 的提示詞

```text
請先不要修改任何檔案。閱讀這個前端專案的規則、package.json、主要入口與部署設定，然後用初學者能理解的方式畫出：
1. 開發指令到本機畫面的流程；
2. production build 到部署產物的流程；
3. 瀏覽器首次開頁時取得的 document、assets 與 data；
4. 哪些程式在 server、哪些在 browser；
5. 每個結論對應的檔案或指令證據。
不要只根據框架慣例猜測；未知處請標成未知，並列出安全的驗證方法。
```

## 常見誤判

- 「畫面有出現，所以 API 一定正常」：可能顯示的是快取、假資料或舊資料。
- 「沒有 Console error，所以完成」：視覺、鍵盤、空狀態與 server log 仍可能失敗。
- 「build 成功，所以 production 正常」：環境變數、網域、資料庫與執行環境仍可能不同。
- 「用了 Next.js，所以全部是 SSR」：現代 Next.js 允許不同 render 與 server／client 邊界混合。
- 「TypeScript 通過，所以資料安全」：型別在執行時不會自動驗證外部輸入。

## Teach-back 題目

先不要搜尋答案，用自己的話回答：

1. 為什麼 CSS 壞掉時，HTML 內容可能仍然存在？
2. API 回 500 與 JavaScript 在瀏覽器拋錯，Network／Console 各會提供什麼不同證據？
3. TypeScript 和 Webpack 都會出現在 build 階段，它們負責的問題有何不同？
4. 為什麼 Agent 的完成報告必須同時附上 diff、測試／build 與瀏覽器證據？

能以自己的網站為例說清楚四題，就進入單元 1；若只能認得名詞，先重做 Network 觀察。

## 影片選看片段

- [Webpack：為什麼需要建置工具（19:17）](https://www.youtube.com/watch?v=uP6KTupfyIw&t=1157s)
- [Next.js：SSR／CSR 入門對比（06:22）](https://www.youtube.com/watch?v=Kj4kQzP75Fk&t=382s)

看片時只抓心智模型，不照抄版本、比例或安裝指令；以課程中的現行校正為準。

## 官方參考

- [MDN：How the web works](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works)
- [Webpack：Core Concepts](https://webpack.js.org/concepts/)
- [Next.js：Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

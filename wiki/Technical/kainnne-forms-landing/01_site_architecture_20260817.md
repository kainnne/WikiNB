---
title: Kainnne Forms Landing 網站架構
description: 說明表單入口頁的 React／Vinext／Worker 結構、請求流程、SEO 輸出與尚未存在的表單資料邊界。
type: note
status: active
tags:
  - WikiNB
  - 技術文件
  - Kainnne Forms
  - React
  - Vinext
  - Cloudflare Workers
date: 2026-08-17
---

# Kainnne Forms Landing 網站架構

這一頁記錄 2026-08-17 的 landing page 實作。名稱中的 Forms 表示服務入口，不代表此 repository 已經具備表單建立、填答、送出、儲存或後台分析能力。

## 定位與對應功能頁

Kainnne Forms Landing 是單頁、低互動的品牌入口：當個人問卷沒有開放時，顯示目前狀態，並提供前往另一個表單服務的明確連結。產品定位與使用者可見功能見 [[Projects/Workflow/kainnne-forms-landing]]。

本 repository 的技術責任只有：

- server-render 一個可直接閱讀的狀態頁。
- 輸出 canonical、robots、sitemap、Open Graph 與 JSON-LD。
- 提供穩定的對外導向與基本品牌樣式。
- 產生可由 Sites runtime 執行的 Worker build。

## 已確認技術

### Runtime 與框架

- Node.js 22.13 以上。
- React 19 與 React Server Components 路線。
- Vinext 將 Next.js App Router 風格的程式轉成 Vite／Cloudflare runtime 可執行產物。
- Vite 8 與 Cloudflare Vite plugin 負責 build 及本機 runtime 模擬。
- TypeScript、ES modules 與單一 Worker entry。
- Tailwind 套件存在於工具鏈，但目前主頁樣式主要由 `app/globals.css` 的專案 CSS 負責。

### 頁面組成

`app/page.tsx` 是沒有 client-side state 的首頁元件，包含：

- 品牌名稱與簡化 mark。
- 「目前沒有進行中的個人問卷」狀態。
- 一個外部服務連結，並使用 `noopener noreferrer`。
- 返回 Kainnne 主站的頁尾連結。
- 與可見內容一致的 `WebPage` JSON-LD。

`app/layout.tsx` 定義文件語言、字型與共用 metadata，包括：

- canonical 基準。
- title 與 description。
- index／follow robots policy。
- Open Graph 與 Twitter card。
- favicon 與社群預覽圖。

`app/robots.ts` 與 `app/sitemap.ts` 分別產生 robots 與 sitemap；目前 sitemap 只列一個首頁 URL。

### Worker 與資產處理

`worker/index.ts` 是 runtime 入口：

1. 若請求進入 Vinext image optimization path，交給 Cloudflare image transform 與靜態資產 fetch。
2. 其餘請求交由 Vinext App Router handler。

首頁本身沒有圖片最佳化、資料庫查詢或第三方 API 請求；Worker 的 image 分支與環境型別是平台通用能力，不應誤解為本頁一定會使用。

### 保留但未接入的 scaffold

repository 仍包含 Sites starter 提供的資料庫、登入 helper 與 D1 example 結構，但目前產品路徑沒有引用它們：

- `db/schema.ts` 明確保持空 schema。
- `.openai/hosting.json` 沒有宣告 D1 或 R2 binding。
- `app/chatgpt-auth.ts` 提供通用 helper，但首頁沒有要求登入。
- `examples/d1/` 是示例，不是正式應用資料流。

因此不能因為套件清單含 Drizzle、Worker 型別含 DB，便宣稱 Kainnne Forms 已有表單資料庫或登入後台。

## 資料流

```text
瀏覽器 GET /
  ↓
Cloudflare／Sites runtime 將 request 交給 worker/index.ts
  ↓
Vinext App Router handler
  ↓
app/layout.tsx 套用語言、字型與 metadata
  ↓
app/page.tsx server-render 狀態卡與外部連結
  ↓
HTML 回傳瀏覽器
  └─ 使用者自行點擊連結後，才離開本站前往外部表單服務
```

這條資料流中沒有：

- 表單欄位輸入。
- submit handler。
- API route。
- D1／R2 寫入。
- 表單回覆保存。
- 使用者帳號或 session。
- 從被導向服務讀回狀態或資料。

## 關鍵決策

### 1. 入口與表單產品分離

品牌入口只處理「目前去哪裡」與「目前是否有個人問卷」。實際表單的建立、權限、資料處理與維護留在被導向的服務，降低入口站的資料風險與耦合。

### 2. 關鍵內容由 server-rendered HTML 提供

狀態、連結、title 與 structured data 都在首次 HTML 中，不依賴 hydration 後才出現。這讓無 JavaScript 的閱讀、搜尋爬取與基本可及性更可靠。

### 3. SEO 訊號由框架輸出

canonical、robots、social metadata、robots.txt 與 sitemap 都有明確來源檔，避免只在畫面文案中暗示網站身分。

### 4. 不為未存在的能力預先建立產品敘事

starter 中的 D1、Drizzle、登入 helper 與 example 不算已完成能力。只有真正被首頁或正式 route 引用、測試並部署的流程，才可列為產品技術。

## 測試／驗證

`npm test` 先執行 production build，再由 Node.js test runner 載入產生的 Worker，直接向 `/` 發送 request。測試目前確認：

- 回應為 HTTP 200 與 HTML content type。
- server-rendered HTML 含正確 title、狀態文案與目的地連結。
- 外部連結包含必要的 rel 屬性。
- HTML 含 JSON-LD。
- canonical、index/follow 與 Open Graph image 已輸出。
- 頁面沒有混入預覽 placeholder 或 loading skeleton。

repository 另提供：

```bash
npm run lint
npm run build
npm test
```

這些驗證覆蓋程式品質、可建置性與首頁 HTML contract；它們不測試被導向服務的可用性，也不驗證任何表單送出結果。

## 部署或執行邊界

- README 將 ChatGPT Sites 記為 hosting platform；repository 透過 Sites／Vinext／Cloudflare 工具鏈建置。
- `.openai/hosting.json` 保存平台 logical configuration，但平台 project identifier 不屬於本公開技術頁需要揭露的內容。
- README 在 2026-08-13 記錄自訂網域 HTTPS 仍待確認；本頁不把該歷史紀錄改寫成已完成部署驗證。
- 是否能以正式 hostname 開啟、憑證是否有效、HTTP 是否重新導向，仍應以當次外部檢查為準。
- 被導向服務由另一個專案與部署管理；本 repository 的 build 成功不代表目的地可用。

## 已知限制

- 單一頁面的狀態與目的地目前直接寫在元件中，沒有 CMS、狀態 API 或遠端設定來源。
- 沒有表單目錄、搜尋、分類、多語系切換或活動時間窗。
- 沒有自動檢查外部目的地是否健康；失效連結需靠其他監測或人工驗證發現。
- sitemap 的 `lastModified` 是固定日期，不會自動由內容 revision 推導。
- 首頁使用遠端字型工具鏈；建置環境與字型載入行為仍需在實際部署中觀察。
- 目前測試聚焦 HTML contract，沒有視覺回歸、不同 viewport、鍵盤流程或真實 edge runtime 的端對端測試。
- repository 中的 starter scaffold 增加理解成本；在沒有功能需求前，不應把它擴張成資料層。

## 公開邊界

可以公開框架、渲染流程、metadata 設計、測試範圍與「沒有表單資料流」的事實；不公開：

- Sites platform project identifier。
- DNS 管理帳號、驗證 token、憑證控制資料或部署憑證。
- 任何被導向表單的回覆、填答者資料、校內資料與後台設定。
- starter 或本機環境中的秘密、runtime binding values 與未啟用服務設定。

## Source of truth

以下路徑皆相對於 `Kainnne-Forms-Landing` repository：

- `README.md`
- `package.json`
- `.openai/hosting.json`
- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `app/robots.ts`
- `app/sitemap.ts`
- `app/chatgpt-auth.ts`
- `worker/index.ts`
- `vite.config.ts`
- `db/schema.ts`
- `tests/rendered-html.test.mjs`

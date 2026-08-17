---
title: Kainnne 個人入口網站技術架構
description: React 單頁入口、作品資料來源、GEO／SEO 產生器與 GitHub Pages 發布流程的公開技術說明。
type: note
status: active
tags:
  - Kainnne
  - React
  - Vite
  - GEO
  - GitHub Pages
date: 2026-08-17
---

# Kainnne 個人入口網站技術架構

## 定位與功能頁

功能、價值與整體生態系角色請先讀 [[Projects/Products/kainnne-personal-portal]]。

本頁只說明目前入口網站的公開工程架構。它是一個以作品為主要資料單位的 React 單頁網站，沒有自建應用程式後端或內容資料庫；作品、站點 metadata 與 About Q&A 都在建置時進入靜態 bundle。

狀態標記：

- **已實作**：可由目前程式碼或設定直接確認。
- **文件記錄／本輪未重跑**：README 或 workflow 有明確說明，但本次只做來源審閱。
- **規劃／外部操作**：仍需要平台或網域擁有者另外完成。

## 已確認技術

### 前端與內容

- **React + TypeScript + Vite**：`src/App.tsx` 組成單頁介面，TypeScript project build 後由 Vite 輸出 `dist/`。
- **資料驅動的作品卡片**：作品內容集中在 `src/projects.json`；`src/projects.ts` 提供 `Project`、分類、語言文字、狀態與連結欄位的型別邊界。
- **Markdown Q&A**：中英文 About 內容以 raw Markdown 匯入，使用 `marked` 轉成 HTML，再依一級與二級標題拆成可收合的分類與問題。
- **互動與視覺**：Motion 處理進場、hover 與捲動進度；shader 元件形成動態背景；CSS 負責雙模式、響應式版面與 reduced-motion 配合。
- **輕量狀態**：外觀模式寫入 `localStorage`；語言、彈出選單與其他互動狀態留在當前 React 執行階段。
- **第三方瀏覽數圖片**：頁尾直接載入外部計數服務提供的公開 SVG；這是頁面載入數，不是具身分識別的分析系統。

### GEO／SEO

- `src/siteMetadata.json` 集中站名、canonical、公開人物與品牌關聯、語言、社群與品牌圖像 metadata。
- `scripts/generate-seo.mjs` 同時讀取站點 metadata 與作品資料，產生或更新 HTML head、JSON-LD、`robots.txt`、`sitemap.xml` 與 web app manifest。
- JSON-LD 使用 `ImageObject`、`Brand`、`WebSite`、`ProfilePage`、`Person` 與 `ItemList`；作品清單只納入標記為公開上線且有公開網址的項目。
- 產生器有 `--check` 模式，可偵測 metadata 與已產生檔案之間的 drift。

## 系統與資料流

### 頁面資料流

```text
src/projects.json ──> src/projects.ts ──> React 作品卡片與快速連結
        │
        └──────────────────────────────> SEO 產生器的公開作品 ItemList

src/content/about*.md ──> marked ──> Q&A 分類／問題元件

React state + localStorage ──> 語言、外觀與互動呈現
```

新增作品時，主要資料路徑是增加一個符合 `Project` 形狀的 JSON 物件。作品網格、頁內快速連結與結構化資料會讀同一份資料，減少頁面文案與搜尋 metadata 分離維護的機會。

### 建置與發布流

```text
src/siteMetadata.json + src/projects.json
                    ↓ npm run seo:generate
index.html + robots.txt + sitemap.xml + site.webmanifest
                    ↓ TypeScript build + Vite build
                         dist/
                    ↓ GitHub Actions
                     GitHub Pages
                    ↓ custom domain
                     公開入口站
```

`npm run build` 先執行 SEO 產生器，再做 TypeScript project build 與 Vite build。CI 使用 lockfile 安裝依賴，將 `dist/` 當作 Pages artifact。

## 關鍵決策

1. **作品先於年表**：資料模型以可開啟的產品與工作系統為中心，不由傳統履歷時間線驅動首頁。
2. **單一作品資料來源**：UI 與 JSON-LD 共用 `src/projects.json`，避免搜尋引擎看到的作品清單和訪客看到的卡片不一致。
3. **建置期產生 SEO artifacts**：不依賴執行期 server；錯誤可以在 build 或 `seo:check` 階段被攔下。
4. **靜態部署**：入口站只提供公開展示與外連，不在本站保存帳號、表單或私人資料，降低營運與攻擊面。
5. **可存取性納入互動元件**：使用語意化按鈕、`aria-expanded`、Escape 關閉、skip link、焦點與 reduced-motion，而不是只處理視覺動畫。

## 測試與驗證

### Repository 提供的品質閘門

```bash
npm run seo:check
npm run build
```

- `seo:check` 比對產生器預期內容與目前 HTML／公開檔案，適合在 metadata 改動後快速找 drift。
- `npm run build` 會實際執行 SEO 產生、TypeScript 編譯與 Vite build，因此是目前最完整的自動化閘門。
- GitHub Pages workflow 會在乾淨的 Node 環境使用 `npm ci` 後重跑 build。

### 本輪證據強度

- **已確認**：資料來源、型別、SEO 產生邏輯與 workflow 由程式碼審閱確認。
- **本輪未重跑**：沒有在來源 repository 重新執行 `seo:check`、build 或實際 Pages 部署；本頁不把未重跑的結果寫成新驗證紀錄。

## 部署與執行邊界

- 公開站是純靜態 artifact；React 在瀏覽器中執行，沒有同 repository 的 API server。
- push 到主要分支會觸發 Pages workflow；custom domain 與 HTTPS 狀態仍由 GitHub Pages 與 DNS 設定共同決定。
- DNS、搜尋引擎站長工具驗證與 sitemap 提交是 repository 外部操作；技術設定能改善可發現性，但不保證排名或一定被 AI 搜尋引用。
- 外部作品、社群、音樂、Gemini 與瀏覽計數服務各自有獨立可用性與隱私政策；入口站只提供連結或載入公開資源。

## 已知限制

- 目前是單一大型 `App.tsx` 組裝多數區塊；功能增加後，元件責任與內容資料可能需要再拆分。
- About Markdown 會轉成 HTML 並以 React 的 HTML 注入機制呈現；內容目前是 repository 內受控檔案，不是讓匿名訪客提交的輸入。若未來改接外部 CMS，必須增加明確的 HTML sanitize 邊界。
- 作品資料依賴人工維護 `status`、公開網址與來源網址；資料標記錯誤會同時影響卡片與 JSON-LD。
- README 曾描述作品分類篩選與鍵盤快速入口；目前檢視到的主元件只確認作品導覽、卡片與 Escape 關閉選單，這兩項不得僅依 README 當作已驗證現況。
- 公開瀏覽數來自第三方圖片計數，無法等同唯一訪客，也可能包含自動化流量。

## 公開邊界

可公開：框架、資料模型、建置順序、結構化資料類型、靜態部署方式與可存取性策略。

不在本頁公開：聯絡 Email、私人 profile 原始資料、未公開作品、平台驗證紀錄、DNS 帳號資訊、憑證與任何環境變數實值。網站程式出現某項個人資料不等於技術文件需要再次複製它。

## Source of truth

- `README.md`
- `package.json`
- `src/App.tsx`
- `src/projects.json`
- `src/projects.ts`
- `src/siteMetadata.json`
- `src/content/about.md`
- `src/content/about.en.md`
- `scripts/generate-seo.mjs`
- `.github/workflows/deploy-pages.yml`

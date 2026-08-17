---
title: Kainnne LumaReader 技術架構
description: Electron 主程序、最小 preload、loopback 文件服務與 Markdown renderer 的本機優先架構說明。
type: note
status: active
tags:
  - LumaReader
  - Electron
  - Markdown
  - 本機優先
  - 應用程式安全
date: 2026-08-17
---

# Kainnne LumaReader 技術架構

## 定位與功能頁

產品目的、閱讀體驗與目前發行邊界請先讀 [[Projects/Products/kainnne-lumareader]]。

LumaReader 不是把 Markdown 上傳到遠端網站再閱讀，而是在 Electron 應用程式內啟動僅綁定 loopback 的文件服務，把使用者明確選取的資料夾轉成可瀏覽書庫。主程序保管檔案系統權限，renderer 專注解析與閱讀互動，中間以最小 preload 與唯讀 HTTP API 分隔。

狀態標記：

- **已實作**：目前程式碼可直接確認。
- **文件記錄／本輪未重跑**：既有 handoff 記錄曾完成，但本次未重新執行。
- **規劃／未驗證**：已有設定或方向，尚不能當成完成的跨平台發行成果。

## 已確認技術

### 四個執行邊界

1. **Electron main process**
   - 建立單一應用程式實例與 `BrowserWindow`。
   - 開啟作業系統原生資料夾選擇器。
   - 在 Electron `userData` 中保存書庫路徑。
   - 啟停 loopback 文件服務、處理應用程式生命週期與外部連結。
   - 支援自訂 protocol 把明確文件來源帶入既有視窗。
2. **Preload bridge**
   - 使用 `contextBridge` 暴露取得書庫、選擇書庫與監聽書庫變更三類能力。
   - 不把 Node.js、任意檔案 API 或可執行指令能力交給 renderer。
3. **Loopback document service**
   - 綁定 `127.0.0.1` 與作業系統分配的隨機 port。
   - 遞迴建立文件索引、讀取文件、展開 include、提供本機媒體、檔案變更 metadata 與 renderer 靜態資源。
4. **Renderer**
   - 使用 vendored Marked、KaTeX、Mermaid 與 highlight.js 完成 Markdown、數學式、圖表與程式碼呈現。
   - 管理書庫樹、搜尋、大綱、媒體檢視、原始碼檢視、閱讀模式、主題、字級、語言與閱讀進度。

### 文件與媒體支援

- 遞迴索引 `.md`、`.mkd`、`.mdx` 與 `.markdown`。
- MDX 只作靜態預覽；import 與 JSX 不會作為 JavaScript 執行。
- 文件大小上限為 8 MB，媒體上限為 32 MB。
- include 最多遞迴六層，並阻擋循環與跳出允許邊界的路徑。
- 隱藏資料夾、版本控制、dependency、build、coverage、release 與應用程式 bundle 等目錄不進入書庫掃描。
- 對本機專案文件，媒體與 include 不能跳出已選書庫；對使用者明確開啟的外部檔案，邊界收斂在該文件所在資料夾。
- 也可明確開啟 HTTP／HTTPS Markdown；此時只抓取文件文字，不把遠端來源改成目前書庫。

### Renderer 防護

- `contextIsolation`、Chromium sandbox 與 `webSecurity` 開啟；`nodeIntegration` 關閉。
- 視窗阻擋離開 reader origin 的站內 navigation；一般外部 HTTP 連結交給系統瀏覽器。
- Markdown 轉換後再經 element／attribute allowlist；移除事件屬性、inline style 與 script、iframe、object、embed、form 等高風險節點。
- URL 經 renderer 的安全連結轉換，checkbox 只保留 disabled 狀態。
- Mermaid 使用 strict security mode，圖表內容不取得 renderer 的一般執行權限。

## 系統與資料流

### 書庫選擇與索引

```text
使用者點選 Library
        ↓ Electron 原生 directory dialog
main process 驗證目錄 ──> 文件服務更新 library root
        │                          ↓
        └──> settings.json    遞迴掃描支援的 Markdown
                                   ↓
                            /api/files 索引
                                   ↓
                      renderer 資料夾樹與搜尋
```

HTTP API 沒有「更換 library root」端點。更換資料夾必須走 Electron IPC 與原生選擇器，避免 renderer 中的任意網頁內容把閱讀器導向其他本機目錄。

### 開啟與渲染文件

```text
renderer 選取 path／明確 source
        ↓ /api/file 或 /api/open
document service 驗證路徑、大小、類型與來源邊界
        ↓ 讀取原文 + 展開安全 include
JSON payload（raw text、render text、base、mtime、size）
        ↓
Marked → HTML allowlist → alerts／footnotes／media rewrite
        ↓
KaTeX + Mermaid(strict) + syntax highlight + outline
        ↓
直向／橫向／分頁閱讀介面
```

本機文件開啟後，renderer 約每 1.5 秒查詢 metadata。修改時間改變時只重新讀取目前文件，並盡量保留閱讀比例；遠端 HTTP 文件不參與這個本機 live refresh。

### 狀態保存

- **Main process**：保存目前書庫路徑。
- **Renderer localStorage**：保存閱讀模式、色盤、明暗、字級、介面語言與桌面 sidebar 狀態。
- **不保存**：Markdown 內容不複製到產品自己的雲端資料庫，也不由應用程式自動翻譯。

## 關鍵決策

1. **本機優先而不是 Web upload**：原始文件留在使用者選擇的資料夾；一般閱讀不需要雲端帳號。
2. **loopback service 作為檔案與瀏覽器邊界**：renderer 用固定形狀的唯讀 API 取資料，不直接取得 Node 檔案系統能力。
3. **更換根目錄只走 IPC**：這是書庫權限模型的核心，不讓 HTTP route 變成任意路徑選擇器。
4. **同一套程式碼服務 macOS 與 Windows**：Electron 與 electron-builder 共用來源，但發行 artifact 必須各平台實測，不能因設定存在就視為已發行。
5. **把第三方 renderer library 一起封裝**：一般本機閱讀不需要 CDN；外部網路只在使用者明確開啟遠端文件或外部連結時發生。
6. **功能豐富但解析採靜態策略**：支援 MDX 外觀與常見擴充語法，不執行文件夾帶的 JSX／import。

## 測試與驗證

### 自動化閘門

```bash
npm run check
npm test
```

- `npm run check` 對 main、preload、document service 與 renderer 執行 JavaScript syntax check。
- `npm test` 使用 Node test runner 執行六個文件服務測試：副檔名與 root、遞迴發現、include 展開、外部 file URL、不跳出書庫的媒體解析，以及 traversal 阻擋。

### 手動與封裝驗證

既有工程文件定義的完整順序還包含：以 fixtures 啟動 Electron、檢查桌面與窄版、建立 unpacked macOS app、實際啟動封裝結果，以及重開後確認書庫設定仍存在。

### 本輪證據強度

- **已確認**：六個測試案例、路徑防護、renderer sanitize、IPC 邊界與封裝設定由來源審閱確認。
- **文件記錄／本輪未重跑**：handoff 記錄 Phase 1 曾在 macOS 驗證功能與 Apple Silicon unpacked app；本次沒有重新執行測試、啟動 Electron 或封裝應用程式。
- **未驗證**：Windows installer、portable build、簽署、公證與正式下載流程仍不算完成。

## 部署與執行邊界

- 目前 repository 的主要交付物是原始碼與文件，不應把 `.app`、DMG、ZIP、EXE、MSI、NSIS 或 portable artifact 直接提交進 Git。
- electron-builder 已設定 macOS DMG／ZIP 與 Windows NSIS／portable target；「可設定」不等於「已在兩個平台完成發行驗證」。
- macOS 開發與封裝需要 macOS；Windows 安裝程式仍需 Windows runner 或實機驗證。
- 正式發行前還要決定 code signing、notarization、release workflow 與下載頁資產；這些都是下一階段，不屬於目前 source-only milestone。
- 使用遠端 HTTP／HTTPS source 會發出網路請求；「本機優先」描述預設書庫流程，不代表所有可選功能永久離線。

## 已知限制

- renderer 主要邏輯集中在單一 `app.js`；功能與語言持續增加時，維護與測試粒度可能受限。
- 自動測試聚焦 document service 與路徑邊界，尚未涵蓋完整 DOM 渲染、KaTeX／Mermaid 視覺結果、鍵盤操作與所有閱讀模式。
- live refresh 使用輪詢；大文件或高頻修改時仍可能產生重複讀取。
- 8 MB 文件、32 MB 媒體與六層 include 是刻意的資源保護，也代表超大教材或影片不能直接由目前 preview API 提供。
- 遠端文件允許重新導向並設有逾時與大小檢查，但內容可用性仍受網路、遠端伺服器與 CORS 之外的服務狀態影響。
- manifest 目前宣告 2.1.1 只描述來源版本；沒有經簽署並發布的 artifact 時，不應把版本號解讀為已正式上架。

## 公開邊界

可公開：process 分層、loopback 模式、檔案格式、資源上限、sanitize 策略、測試範圍與封裝 target。

不公開：使用者實際選過的書庫路徑、Electron `userData` 實際內容、私人 Markdown、簽署憑證、公證憑證、環境變數實值與未發布 release artifact。技術文件中的路徑例子只應使用 repository 相對路徑或抽象名稱。

## Source of truth

- `README.md`
- `package.json`
- `docs/ARCHITECTURE.md`
- `docs/DEVELOPMENT.md`
- `docs/HANDOFF.md`
- `src/main.js`
- `src/preload.js`
- `src/local-server.js`
- `renderer/app.js`
- `renderer/index.html`
- `tests/local-server.test.js`

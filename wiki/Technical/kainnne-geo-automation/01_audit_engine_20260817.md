---
title: Kainnne GEO 稽核引擎技術文件
description: 說明唯讀 GEO 稽核器的設定模型、檢查流程、報告格式、測試方式與自動化邊界。
type: note
status: active
tags:
  - WikiNB
  - 技術文件
  - GEO
  - SEO
  - Node.js
  - 自動化稽核
date: 2026-08-17
---

# Kainnne GEO 稽核引擎技術文件

這一頁記錄 2026-08-17 可由 repository 驗證的實作。它描述的是「如何檢查」，不是某次線上稽核的結果，也不代表任何排程目前正在執行。

## 定位與對應功能頁

Kainnne GEO Automation 是一個設定驅動、預設唯讀的命令列稽核器，用來檢查公開網站與制度型網站的搜尋可發現性訊號。產品價值、使用情境與人工觸發原則見 [[Projects/Workflow/kainnne-geo-automation]]。

技術層的責任是：

- 讀取目標設定，而不是把每個網站的規則寫死在程式裡。
- 對正式網址發出 HTTP 請求，收集首頁、robots 與 sitemap 等證據。
- 依站點的索引政策與必要訊號產生分級 finding。
- 將結果輸出成可閱讀的 Markdown 或結構化 JSON。
- 保持 audit-only；不直接修改目標網站、DNS、外部帳號或部署狀態。

## 已確認技術

### 執行環境與模組

- Node.js 22 以上。
- 原生 ECMAScript modules。
- 執行階段沒有第三方套件依賴；HTTP、檔案讀取、URL、逾時與測試皆使用 Node.js 內建能力。
- `package.json` 將每日與每週模式包成不同指令，但兩者最後都進入同一個 CLI 與稽核核心。

### 設定模型

`config/targets.json` 將每個目標表示為一筆設定，核心欄位包括：

- `id`：報告與單站篩選使用的穩定識別。
- `url`：要檢查的 canonical 起點。
- `visibility` 與 `indexPolicy`：區分公開可索引站點及應維持 `noindex` 的制度型站點。
- `require`：該站點必須具備的訊號，例如 title、description、canonical、Open Graph image、JSON-LD、robots、sitemap 或 `noindex`。

載入時會確認 targets 非空、每筆具備必要識別與政策、ID 不重複，並以 URL parser 驗證網址格式。設定檔也保存自動化政策；目前政策禁止自動 production 寫入、外部帳號異動及內容改寫。

### HTTP 與訊號解析

每次抓取具備以下行為：

- 跟隨 redirect。
- 使用 `AbortController` 套用逾時。
- 帶有可辨識的稽核器 User-Agent。
- 保存原始 URL、最終 URL、HTTP status、content type、response body 與網路錯誤。

首頁訊號解析目前以小範圍字串規則完成，會讀取：

- `<title>`。
- meta description 與 robots 指令。
- Open Graph image。
- canonical link。
- `application/ld+json` script，並逐段確認是否為有效 JSON。

URL 比對會正規化根路徑的尾端斜線，但不會把不同 hostname 視為相同。robots 判斷會分辨一般 crawler 規則與 `OAI-SearchBot` 規則，避免把搜尋爬取與模型訓練權限混為一談。

### 檢查模式

| 模式 | 已實作範圍 |
|---|---|
| daily | 首頁可用性與 HTTPS 最終網址；對可索引站點再檢查 robots、sitemap 是否可取用 |
| weekly | 包含首頁 head 訊號、canonical、JSON-LD、Open Graph、`noindex` 政策，以及可索引站點的 robots／sitemap 內容檢查 |

模式名稱代表檢查深度，不代表 repository 自己會在每日或每週自動啟動。

### Finding 與報告

每筆 finding 含 target、severity、check、evidence 與 proposed change。嚴重度依序為 `info`、`low`、`medium`、`high`；整份報告的 overall status 由最高嚴重度推導成 `healthy`、`attention` 或 `failing`。

輸出行為包括：

- 預設把 Markdown 報告寫到標準輸出。
- `--json` 改輸出完整 JSON。
- 只有明確指定 `--write-report` 才在 `reports/` 建立 Markdown 檔。
- 只有明確指定 `--strict`，發現任何非 healthy 結果時才以非零狀態結束。
- 可用 `--target` 只檢查單一設定目標，並可調整 request timeout。

## 資料流

```text
CLI 參數
  ↓
讀取並驗證 config/targets.json
  ↓
依 target 逐站執行 auditTarget
  ↓
抓取首頁；失敗時直接建立 high finding
  ↓
依 daily／weekly 與 indexPolicy 決定後續檢查
  ↓
解析 head 訊號，按 require 產生 findings
  ↓
彙整最高嚴重度與 overall status
  ↓
Markdown／JSON 輸出
  └─ 僅在明確旗標下寫入 reports/ 或回傳 strict exit code
```

目前 targets 是依序處理；單一 target 內的 robots 與 sitemap 請求會平行進行。稽核結果只描述線上 response，不會自動回寫來源 repository。

## 關鍵決策

### 1. 索引政策屬於目標設定，不由稽核器猜測

公開產品站與制度型內容的正確狀態不同。公開站缺少 robots 或 sitemap 是問題；制度型站缺少 `noindex` 反而可能是更高風險。把政策放進設定可以共用引擎，又不把「所有網站都應被索引」當成預設。

### 2. 偵測與修正分離

稽核器只負責收集 evidence 與提出 proposed change。即使 finding 看似機械性問題，實際修改仍需回到目標 repository，經過該專案的建置、測試與授權流程。

### 3. 正常結果不製造變更

沒有 finding 時只輸出健康摘要，不改 metadata、日期或內容。這避免為了顯示「自動化有在工作」而製造沒有資訊價值的 commit。

### 4. 預設不讓監測結果中斷流程

一般執行即使發現問題也先產出報告；需要把稽核接到 CI gate 時，再明確啟用 strict mode。這讓人工調查與機器驗收能共用同一核心。

## 測試／驗證

repository 使用 Node.js 內建 test runner。現有單元測試涵蓋：

- canonical 根路徑尾端斜線的等價判斷。
- title、description、Open Graph、canonical 與合法 JSON-LD 的抽取。
- robots 對一般 crawler 與 `OAI-SearchBot` 根路徑阻擋的判斷。
- 制度型 target 缺少 `noindex` 時產生 high finding。

可用下列指令驗證程式與兩種模式：

```bash
npm test
npm run audit:daily
npm run audit:weekly
```

後兩個指令會連線到設定中的正式網址，因此結果受網路、站點狀態與執行時間影響；單元測試使用可控制的 fetch fixture，才是穩定的程式邏輯驗證。

## 部署或執行邊界

- 這是一個本機 Node.js CLI，不是常駐 Web service，也沒有自己的 production deployment。
- repository 內的 daily／weekly 指令只是可被人工或外部 scheduler 呼叫的入口。
- 維運準則包含建議時段、範例 prompt 與分階段自動化設計，但這些文件不能證明 Codex Scheduled task、cron 或 CI schedule 正在運作。
- 因此本技術頁不宣稱已啟用自動排程；目前可確認的是人工執行入口與 audit-only 程式邊界。
- 報告可含網站狀態與錯誤證據，是否保存或公開需依內容另行判斷。

## 已知限制

- head parsing 使用聚焦的字串規則，不是完整 HTML parser；非典型標記、動態 client rendering 或格式異常可能造成漏判。
- sitemap 目前只檢查可取用性及是否包含自身 canonical origin，沒有完整 XML schema、URL 集合或 last-modified 驗證。
- HTTPS 檢查以最終 URL protocol 為主，沒有獨立輸出完整憑證鏈、到期日或 TLS policy 分析。
- weekly 模式目前沒有實作來源 repository 與 production output 的逐欄比對；維運準則中的 source-to-output 一致性仍是後續能力。
- 沒有 Search Console、analytics、排名或 AI 引用資料整合，也不會從一般搜尋結果推導這些數字。
- 目前逐站執行，沒有重試、全域並行上限、歷史趨勢資料庫或告警去重。
- finding 的 proposed change 是方向性文字，不代表 patch 已建立或驗證完成。

## 公開邊界

這一頁可以公開稽核架構、檢查類型、風險分級與驗證方式；不公開：

- 來源設定中的本機絕對路徑。
- 未經審閱的完整 target 清單與制度型內部服務細節。
- 某次報告可能包含的暫時錯誤、內部來源 revision 或尚未公開站點。
- Search Console、analytics、帳號權限、token、DNS 管理資訊與外部服務憑證。
- 尚未由 source of truth 確認的個人介紹、作品狀態、排名或曝光成果。

## Source of truth

以下路徑皆相對於 `Kainnne-GEO-Automation` repository：

- `README.md`
- `AGENTS.md`
- `package.json`
- `config/targets.json`
- `lib/audit.mjs`
- `scripts/geo-audit.mjs`
- `test/audit.test.mjs`
- `docs/GEO_AI_MAINTENANCE_GUIDE.md`

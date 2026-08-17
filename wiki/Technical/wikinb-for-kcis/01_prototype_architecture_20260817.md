---
title: WikiNB for KCIS 原型架構
description: 以可公開的高階層次整理教學知識庫原型的靜態閱讀、授權服務、儲存與 AI 資料邊界。
type: note
status: active
tags:
  - WikiNB
  - 技術文件
  - KCIS
  - Astro
  - 知識庫
  - 教學科技
date: 2026-08-17
---

# WikiNB for KCIS 原型架構

這一頁只公開足以理解原型設計的技術層次。它不提供帳號、儲存空間識別、服務 endpoint、漏洞重現步驟或校內部署細節，也不把原型描述成已通過正式校園上線驗收的系統。

## 定位與對應功能頁

WikiNB for KCIS 將 Markdown 知識庫延伸到教學情境，探索教師／科目分類、內容搜尋、數學呈現、登入後管理與 AI 教材問答如何共同工作。產品價值與公開功能摘要見 [[Projects/Knowledge/wikinb-for-kcis]]。

本頁使用「原型」一詞，代表 repository 中存在可執行的前後端能力與測試，但正式身分治理、組織政策、營運監控、部署持續性與真實資料接入仍需另行驗收。

## 已確認技術

### 靜態閱讀層

- Astro 5 建置內容網站。
- Tailwind CSS 與專案樣式處理 KCIS 品牌介面。
- Markdown frontmatter 由 `gray-matter` 解析。
- Markdown body 由 `marked` 轉成 HTML。
- 數學內容使用 KaTeX，在 Markdown 轉換前處理行內與區塊公式。
- Wiki links 會轉成站內知識頁連結。
- 瀏覽器端有搜尋與 Markdown 閱讀相關 scripts。
- i18n 資源分開保存中文與英文介面文字。

內容依「教師／科目／筆記」層級整理。讀取器從 frontmatter 與資料夾位置取得 title、description、teacher、subject、keywords、status、audience、tags 與日期，再建立頁面資料與搜尋索引。

### 內容篩選

靜態讀取器具備下列保守行為：

- 預設不把 draft 當成正式頁面列出。
- 掃描時跳過名為 `private` 的內容樹。
- 依教師、科目與 keywords 建立可搜尋欄位。
- 教師與科目 metadata 可以控制顯示名稱、雙語名稱與 active／archived 狀態。

這些建置期篩選有助於降低誤公開，但不等同完整的 server-side authorization；真正需要個別授權的內容仍應由後端在每次讀取時判斷。

### 動態服務層

專案另有一個 Node.js／Express 服務，負責靜態站不適合直接執行的能力：

- 身分驗證與 session。
- 依角色判斷內容寫入範圍。
- 教師／科目 metadata 與筆記管理。
- 文件匯入與安全清理。
- 受保護內容及媒體的存取範圍。
- AI provider adapter 與工作中止控制。

前端與動態服務採分離架構，因此「公開內容可建置」與「登入後操作可用」是兩個不同的驗收面向。

### 儲存抽象

後端的 wiki service 把內容操作包成一致介面：

- 外部組織儲存設定完整時，可透過 storage adapter 讀寫教師與科目內容。
- 未設定外部儲存時，使用本機 wiki tree 作為開發後備。
- 寫入前會正規化 slug、檔名與 frontmatter，並依登入角色解析實際可寫入的教師範圍。
- 資產與 Markdown metadata 分開處理，匯入流程另負責文件轉換與內容清理。

公開文件只描述這個抽象，不列出任何真實 Drive ID、service account、資料夾名稱或校內內容。

### AI 問答層

AI adapter 支援雲端模型與本機 CLI 兩類 provider。高階流程為：

- 先由伺服器取得目前身分可讀的教材與附件。
- 組合系統指示、有限對話歷史、公開 wiki context 與已授權私有 context。
- 將請求交給選定 provider。
- 支援中止進行中的工作。

權限篩選必須發生在提供模型 context 之前。AI 回答能力不能用來繞過一般內容讀取限制，prompt 內容、模型設定與內部 corpus 組裝細節也不屬於本公開頁。

## 資料流

### 公開／建置期閱讀

```text
wiki Markdown + _meta.json
  ↓
src/lib/wiki.ts 解析 frontmatter、公式與 Wiki links
  ↓
排除 private tree 與非公開狀態
  ↓
Astro 產生內容頁、列表與搜尋索引
  ↓
靜態網站供一般閱讀
```

### 登入後操作

```text
瀏覽器發出登入後操作
  ↓
動態服務驗證 session 與角色
  ↓
wiki／import／private content service 套用授權範圍
  ↓
外部組織儲存 adapter 或本機開發後備
  ↓
只回傳目前身分可讀寫的結果
```

### AI 教材問答

```text
使用者問題
  ↓
伺服器確認 session 與可讀資料範圍
  ↓
載入授權教材、附件與有限對話 context
  ↓
LLM adapter 呼叫選定 provider
  ↓
回答回到目前 session
```

## 關鍵決策

### 1. Markdown 保持可攜，metadata 承擔內容結構

筆記仍是人可以直接閱讀與版本管理的 Markdown；教師、科目、關鍵字、受眾與發布狀態透過 frontmatter 和 `_meta.json` 表達，避免知識只能存在於資料庫或聊天紀錄。

### 2. 靜態閱讀與敏感操作拆開

內容閱讀可享受靜態建置的速度與可攜性；登入、寫入、私有檔案與 AI 則留在伺服器。這個拆分降低前端直接接觸 secret 的風險，但也增加跨層設定、版本一致性與部署維護成本。

### 3. 教材權限先於 AI 能力

模型只接收目前使用者已被授權的 context。若權限篩選與 AI 分開設計，模型再強也不能修補資料先被錯誤載入的問題。

### 4. 外部儲存與本機後備共用 service contract

開發環境不必依賴正式組織儲存才能測試基本內容流程；正式接入時則可切換 adapter。代價是必須持續測試兩種 backend 的語意一致，不能讓後備行為偷偷成為正式資料來源。

### 5. KCIS 專屬原型不直接等於通用企業產品

教師、學生、科目與組織品牌是這個原型的重要情境，但通用多租戶平台不能把這些名稱與政策硬寫進核心授權模型。

## 測試／驗證

repository 提供的基礎驗證入口包括：

```bash
npm run build
npm test --prefix auth
```

Astro build 驗證靜態內容能否解析與產生。後端 test suite 聚焦若干教學情境邊界，包括：

- 帳號與課堂關係。
- 私有上傳與 AI corpus 的課堂範圍。
- 匯入 HTML 的主動內容清理。
- PDF 數學分類規則。
- 私有圖片只在獲授權範圍提供給模型。
- 教師撤銷課堂關係的權限邊界。

這些測試證明特定程式規則可重複驗證，不代表外部身分服務、組織儲存、郵件、Tunnel、正式網域或長時間營運已通過端對端驗收。

## 部署或執行邊界

- 靜態網站與動態服務是兩個部署單元；只部署前者不會自動提供登入後寫入與 AI。
- 動態能力需要 runtime secrets、外部服務設定與持續可用的主機環境，這些不應存在公開 repository。
- repository 中同時存在歷史部署文件與遷移後的網址／平台規劃；任何正式 hostname 或可用狀態都必須另做當次驗證。
- 本頁不提供實際 endpoint、Tunnel 位址、callback、帳號、儲存 ID 或主機操作命令。
- 未經組織審查，不應把真實學生、教師、課堂或內部文件用於公開展示或外部模型測試。

## 已知限制

- 原型同時維持建置期 wiki tree 與動態 storage adapter，內容同步與 source-of-truth 漂移需要額外治理。
- 靜態搜尋索引不適合承載需要逐使用者授權的資料；受保護搜尋必須留在後端。
- 前後端分離需要正確處理 origin、session、服務可用性與設定同步，正式環境複雜度高於單一靜態站。
- 本機後備便於開發，但不能取代正式持久化、備份、稽核與災難復原。
- AI context 目前仍受截斷、檔案選取與 provider 限制影響，不能保證涵蓋所有教材。
- package scripts 沒有單一指令涵蓋靜態 build、後端測試及所有外部整合檢查。
- repository 仍含情境專屬假設；若發展成通用服務，需要重新設計租戶、身分與資料生命週期。

## 公開邊界

可以公開框架選擇、Markdown 模型、前後端分工、儲存抽象與 authorization-before-AI 原則；不得公開：

- 教師、學生、管理員帳號或可推導身分的資料。
- roster、Email、校內編號、課堂成員關係與真實教材。
- 外部儲存 ID、service account、secret、token、環境變數值。
- 正式／過渡主機位址、API endpoint、Tunnel、callback 與內部網路設定。
- 完整 system prompt、私人 corpus、漏洞重現方式或可繞過權限的操作細節。
- 未經授權的校方品牌資產、內部決策與部署紀錄。

## Source of truth

以下路徑皆相對於 `WikiNB_for_KCIS` repository：

- `README.md`
- `AGENTS.md`
- `package.json`
- `astro.config.mjs`
- `src/lib/wiki.ts`
- `src/pages/`
- `src/scripts/`
- `auth/package.json`
- `auth/server.js`
- `auth/lib/wiki.js`
- `auth/lib/drive.js`
- `auth/lib/document-import.js`
- `auth/lib/private-files.js`
- `auth/lib/llm.js`
- `auth/test/classroom.test.js`

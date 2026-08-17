---
title: WikiNB Enterprise V1 原型與 V2 架構計畫
description: 區分 V1 已實作的本機多租戶原型，以及 V2 已決定但尚待實作的登入、授權與資料隔離架構。
type: note
status: active
tags:
  - WikiNB
  - 技術文件
  - WikiNB Enterprise
  - 多租戶
  - RAG
  - 架構計畫
date: 2026-08-17
---

# WikiNB Enterprise V1 原型與 V2 架構計畫

這一頁刻意分開兩個狀態：

- **V1：已實作、可在本機驗證的產品原型。**
- **V2：2026-08-14 已決定的重建方向，尚待實作與逐項驗收。**

V1 不是 production-ready 服務；V2 也不能因為已有詳細設計文件，就被描述成已完成平台。

## 定位與對應功能頁

WikiNB Enterprise 探索如何把個人 Markdown 知識庫延伸成具備白標、多租戶、可見性與引用式問答的組織產品。功能定位與原型價值見 [[Projects/Knowledge/wikinb-enterprise]]。

技術上，V1 用最小本機前後端驗證產品假設；V2 計畫則針對 V1 無法承擔正式組織資料的部分，重新定義身分、授權、資料儲存、搜尋、AI 與營運安全基線。

## 已確認技術

### V1：已實作的本機原型

#### 前端與內容

- Astro 5 與 Tailwind CSS 建立可換品牌的知識庫介面。
- Markdown 以 `gray-matter` 解析 frontmatter，以 `marked` 呈現內容，數學內容使用 KaTeX。
- 每個 tenant 有獨立設定與內容根目錄。
- tenant 設定提供品牌、theme、內容維度與示範身分政策。
- wiki frontmatter 支援 `public`、`tenant`、`private` 三種 visibility；未填時預設 `tenant`，避免意外公開。

#### 本機 API

- Node.js／Express API 與 Astro 開發站分開執行。
- tenant loader 從 JSON 設定讀取品牌與原型使用者資料。
- theme override 寫入本機 JSON，讓管理角色可驗證換膚流程。
- 認證 challenge 與 session 保存在記憶體 Map。
- 筆記讀取會先依 tenant 定位內容，再依登入角色過濾 visibility。
- `private` 在原型中只允許較高權限角色讀取；這是簡化模型，不是完整文件級授權。

#### V1 的 Ask AI 實際行為

V1 名稱使用 Ask AI，但目前核心是**不需外部模型的關鍵字檢索原型**：

1. 先按 session 的 tenant 與角色取得可讀筆記。
2. 將問題與 title、description、owner、topic、tags、body 比對。
3. 英文採斷詞；中文另外加入單字與雙字組合以提高命中。
4. 依命中分數排序並限制來源數量。
5. 從筆記摘錄內容，連同 source slug 回傳。

因此 V1 已驗證的是「授權後的 corpus 篩選、簡易檢索與來源呈現」，不是向量資料庫或生成式 LLM 的正式 RAG 服務。

#### 公開 build 隔離

靜態建置只應包含 `public` 筆記。tenant 與 private 內容由登入後 API 流程提供，不應出現在公開產物；repository 有專門的 build privacy test 檢查這個 contract。

### V2：已決定、待實作的架構

V2 計畫已確立下列方向，但清單中的能力尚未因文件存在而自動完成：

- 全站 login wall；登入前不提供教材、搜尋索引或 AI 主介面。
- Authentication 與 authorization 分離：外部 IdP 證明身分，WikiNB 仍以自己的 membership、role、group 與狀態決定權限。
- Default deny；新帳號、新文件、新 API 與新租戶在沒有明確規則時預設拒絕。
- 核心模型改成可容納不同學校、機構或公司的 tenant，不把 KCIS 名稱、網域、角色文字或資料夾規則寫死。
- 使用真正的交易型資料庫保存 tenant、identity、membership、permission、session、login attempts 與 audit events。
- 受保護文件與 blob 分離保存，但每次讀取、搜尋、下載、AI 檢索與匯出都走同一套 server-side authorization。
- 搜尋與 RAG 必須在檢索前按 tenant、group、owner 與使用者能力過濾，不能先把完整索引送到前端或模型後再遮蔽。
- 使用可撤銷的 opaque session、持久化節流、稽核紀錄、資料保存與備份／還原流程。
- Google Workspace／OIDC 作為優先方向，同時保留其他企業身分提供者的接入邊界。
- KCIS 若日後採用，應以標準 tenant onboarding 與資料遷移流程接入，而不是直接複製原型私有資料。

## 資料流

### V1 已實作流程

```text
tenant JSON + tenant Markdown
  ├─ public 筆記 → Astro build → 公開頁面
  └─ tenant/private 筆記
         ↓
      本機 Express API
         ↓
  記憶體 session + role visibility filter
         ├─ 筆記列表／內容
         ├─ keyword retrieval + source excerpts
         └─ admin theme override → 本機 JSON
```

這是單機原型資料流。設定檔、內容目錄、記憶體 session 與本機 override 都假設受控示範環境，不能直接外推到正式多租戶服務。

### V2 目標流程（尚待實作）

```text
使用者進入 tenant 網域
  ↓
server-side login wall
  ↓
外部 IdP 驗證身分
  ↓
WikiNB 查詢 tenant membership／status／role／group
  ↓
建立可撤銷 session
  ↓
統一 authorization service
  ├─ 文件 metadata／blob
  ├─ 搜尋
  ├─ 下載與匯出
  └─ RAG pre-filter → 允許的 AI provider
  ↓
所有高風險事件寫入 audit log
```

上圖是決策後的目標狀態，不是目前 production 架構。

## 關鍵決策

### V1 決策

#### 1. 先用本機 vertical slice 驗證產品假設

V1 把品牌切換、visibility、登入後內容與來源式問答串成一條最小路徑，優先回答「這個產品互動是否成立」，而非提早投入雲端身分與資料平台。

#### 2. visibility 缺省為 tenant

對組織內容而言，漏填 metadata 時公開比無法公開更危險，因此預設採較保守語意。public 必須明確標示。

#### 3. 關鍵字檢索取代假裝存在的 LLM

沒有外部模型也能驗證 corpus 權限、命中與 source citation；技術文件應直接稱它為 keyword retrieval，不把摘錄組合包裝成已完成生成式 RAG。

### V2 決策

#### 1. 不在 V1／KCIS 架構上持續堆疊正式需求

V2 採重建而非局部修補，因為公開靜態內容、記憶體認證、JSON 帳號與完整多租戶授權的安全模型根本不同。

#### 2. 全站登入與 server-side 授權

介面隱藏不是資料保護。V2 要求頁面與資料 API 在回傳前驗證 session 及 capability，並讓搜尋、下載與 AI 使用同一套規則。

#### 3. 身分提供者不直接授予本站權限

登入成功只證明使用者身分有效；是否進入某 tenant、具備何種角色及能讀哪些資料，仍由 WikiNB membership 與 policy 決定。

#### 4. 受保護資料不進公開 build

受保護標題、索引與內容都不能先打包到 HTML／JavaScript 再由前端過濾。V2 的內容查詢與搜尋必須在授權後端執行。

#### 5. AI 繼承一般資料權限

模型不能取得使用者原本不能閱讀的資料。permission filter 必須發生在 retrieval 之前，並對跨租戶、跨群組與 owner-only 情境建立 negative tests。

## 測試／驗證

### V1 現有驗證

V1 `package.json` 定義：

```bash
npm test
npm run build
npm run test:build
npm run test:api
npm run check
```

其中：

- `npm test` 串接 visibility、tenant、keyword retrieval、frontmatter 與登入後可見性測試。
- `npm run build` 驗證 Astro 產物。
- `npm run test:build` 檢查非 public 內容不進公開 build。
- `npm run test:api` 是另行執行的本機 API smoke test。
- `npm run check` 包含核心 test、build 與 build privacy test，但不等同正式端對端安全測試。

### V2 待完成驗證

V2 計畫要求至少補齊下列 negative permission tests：

- 未登入不能讀受保護資料。
- tenant A 不能透過頁面、API、搜尋、下載、快取或 AI 取得 tenant B 資料。
- 一般成員不能執行管理操作。
- owner-only 文件不會被其他一般成員或 AI corpus 讀取。
- 停權與角色變更能撤銷既有 session。
- 受保護內容不出現在公開 build、source map、client log 或錯誤回應。

這些是 V2 Definition of Done 的一部分；目前不可標記為已通過。

## 部署或執行邊界

### V1

- 只確認本機 Astro UI 與本機 API 的示範流程。
- 登入 challenge、session、品牌 override 與部分示範身分資料使用原型級儲存。
- 沒有正式秘密管理、持久 session、集中稽核、備份還原、跨實例一致性或完整節流。
- 不應接入真實企業、學校、員工或學生資料。

### V2

- 正式部署平台、資料庫供應商、session timeout、第一批 IdP、保存政策與外部 LLM 規則仍有待決策。
- 目標需要可執行 server-side middleware 的 HTTPS 環境；GitHub Pages 只能承載不含受保護資料的公開說明面。
- 在租戶隔離、授權、持久 session、稽核、備份與 negative tests 完成前，不應稱為可上線企業平台。
- 本頁不宣稱獨立的 V2 實作、staging 或 production 已部署。

## 已知限制

### V1

- 認證 challenge 與 session 存於記憶體，服務重啟即失效，也無法跨實例共用。
- 原型身分與密碼資料由本機示範設定驅動，不是正式 identity store。
- 角色模型把 private 簡化成 admin／teacher 可讀，缺少 owner、group 與文件級 permission。
- keyword retrieval 沒有 embeddings、語意向量、生成模型或模型安全控制。
- 品牌 override 是本機 JSON，缺少交易、版本、稽核與多實例同步。
- tenant JSON 與檔案路徑模型適合 demo，不具備正式資料庫的唯一約束、外鍵與一致性保護。
- CORS、登入節流、session cookie、secret handling 與 observability 尚未達 production 基線。

### V2

- 目前是已決定的 master plan，phase checklist 尚未完成。
- 多租戶 schema、authorization service、IdP integration、object storage、audit log 與 migration pipeline 都需實作。
- 正式商業條款、資料處理區域、法遵與組織 onboarding 尚未定案。
- 從 KCIS 或 V1 遷移任何資料前，仍需獨立的資料盤點、授權與驗證流程。

## 公開邊界

可以公開 V1 的框架、可見性模型、keyword retrieval、測試 contract，以及 V2 的架構原則；不得公開：

- 示範或真實帳號、密碼、OTP、session token 與 tenant roster。
- tenant 設定中的 Email domain、例外名單與未公開組織資料。
- 私有筆記全文、內部品牌素材、客戶名稱與遷移資料。
- secret、環境變數值、資料庫連線、IdP client、callback 與部署控制資訊。
- 可用來繞過權限的 endpoint 組合、漏洞重現或未修補安全細節。
- 尚未驗證的 production、合規、備份、隔離或效能聲明。

## Source of truth

以下路徑皆相對於 `WikiNB_Enterprise` repository：

- `README.md`
- `package.json`
- `docs/01_mvp_tech_brief.md`
- `docs/02_enterprise_v2_rebuild_master_plan.md`
- `src/lib/tenant.ts`
- `src/lib/wiki.ts`
- `src/pages/`
- `api/package.json`
- `api/server.js`
- `api/lib/auth.js`
- `api/lib/tenants.js`
- `api/lib/notes.js`
- `api/lib/rag.js`
- `scripts/test-visibility.mjs`
- `scripts/test-tenants.mjs`
- `scripts/test-rag.mjs`
- `scripts/test-frontmatter.mjs`
- `scripts/test-auth-visibility.mjs`
- `scripts/test-build-privacy.mjs`
- `scripts/test-api-smoke.mjs`

# WikiNB 工程 Handoff

更新：2026-10-08（台北時間）

WikiNB 的公開內容以 `wiki/` 為來源。Astro／GitHub Pages 負責閱讀與搜尋，Cloudflare Worker／D1 負責訪客 AI，本機 Bridge 負責私人維護與 Codex。公開筆記不因管理者登入而變成私人資料。

## 接手基準與本輪核對

- 本輪整理起點為 GitHub `main` 的 `489b7d2`，2026-10-06 的 Pages 部署成功；正式首頁、搜尋、Gemini、OpenAI、登入頁回傳 HTTP 200。
- 常用本機 checkout 原停在 `c9d2be8`，落後 10 個 commit；已保存 12 個原有未提交草稿，再快轉至正式版本。草稿沒有混入本輪公開修改。
- 2026-10-08 唯讀下載並比對線上 Worker：Gemini 與 OpenAI 的 JavaScript 和 `489b7d2` 建置產物一致（比較排除 source map 註解）。沒有發現需從線上反向補回的程式差異。
- Gemini 核對時版本為 `1c04180e-8a8a-4b2b-b749-67be51565327`，部署於 2026-10-05 08:58；OpenAI 為 `370f4055-4e91-4f57-917a-3eef5d8e5707`，部署於 2026-10-05 01:13。
- 兩個 health 正常；Gemini 模型 `gemini-3.1-flash-lite`，OpenAI 模型 `gpt-5.6-luna`。本輪沒有呼叫付費聊天、寄 OTP 或做私人登入驗收；health 不代表完整生成品質驗收。
- 以上是核對時的快照。接手仍需先讀 `git status -sb`、最新 remote 與 deployment，不能把日期或 commit 當成永久現況。

## 目前功能

| 層 | 已有能力 | 存取條件 |
| --- | --- | --- |
| 公開站 | 首頁、最近更新、巢狀 Wiki、文章、全文搜尋、中英文、404 | 不需 Mac／登入 |
| 公開 Kain³e AI | 五個初始方向、抽題與追問；依公開筆記介紹 Kaine、作品及合作方向 | Gemini／OpenAI 分開服務 |
| Gemini | 免登入試問五則；Email OTP 後使用至每日 token 額度；限定相關問題、節流與檢索 | Cloudflare Worker + D1 |
| OpenAI | 共用聊天介面；獨立累計 US$10 保守預算與速率控制，沒有自動付費重試 | 獨立 Worker，與私人 Codex 不同 |
| 私人 Bridge | 帳密與 OTP、新增／覆蓋／更名／刪除／建夾、顯示 metadata、Git 同步 | Mac 與有效管理者 session |
| 私人 Codex | 可深入讀本機 Wiki 與專案資料、分析、出題、教學；CLI 固定 read-only | 私人登入與 Bridge |

公開入口使用 **Kain³e／Kain³e AI**；repository 和知識庫名稱仍是 WikiNB。不要把尚未採用的舊工作室文案草稿整份覆蓋回去。

2026-10 的變更已包含品牌與分享素材、手機搜尋狀態恢復、入口語言優先設定、聊天提示樣式。KCIS 專屬知識庫、AI 導航與架構頁已撤下；公開職業背景仍保留。維持 `scripts/test-kcis-public-boundary.mjs`，不要從舊索引或草稿補回撤下材料。

## Azure AI-901 學習入口

- 私人 Codex 新增「Azure AI-901：開始學習」預設提示，點選填入、送出才開始，不自動呼叫模型。
- 預設按 U01→U10，一次一個觀念、一個例子與一題；等使用者作答後才給來源答案、判題線索與補充解析。保留原題號、題型及作答規則，AI 新增例題必須標示。
- 教材來源共 584 個不重複題號、797 筆單元紀錄、315 頁文字。題目答案與原網站一致不等於 Microsoft 官方事實審查，U10 的 208 題不是全部題目。
- 教材正文、完整題目及答案保留在 Git ignore 保護的本機私人區域，以及 Gemini Worker 的私人 D1 表。公開 repository、Pages、搜尋索引只含 70 個文章標題，沒有原文或下載附件。
- `/private-study/` 是 Gemini 私人學習入口：先 Email OTP 驗證，再兌換管理者產生的六碼英數邀請碼；一碼綁定一個訪客身份，生成一小時後失效，也可提前撤銷。每次教學前後重新查權限，不沿用過期授權。
- 搜尋頁的私人標題預設不可點，邀請訪客也無法打開原文。只有 Bridge 管理者 session 可以啟用標題並從本機 `/api/private-study/document` 讀取原文；雲端沒有原文／附件讀取 API。
- 私人教學按單元原題序出題，答案提交後才給來源答案與講評。D1 以訪客身份雜湊記錄單元題序與最後作答；沒有完整對話紀錄或公開成績。
- `visibility: private` 或 `private: true` 的 Markdown 不能經公開上傳／覆蓋 API 寫入 wiki；建置也會阻擋落在公開路徑的私人 Markdown。新增其他私人教材需同樣先放私人儲存區，再更新僅有標題的 catalog 與 Agent 所需資料，不自動把公開文章「轉私人」或抹除 Git 歷史。
- `AZURE_STUDY_BANK_DIR` 可在未追蹤的 `bridge/.env` 指定私人題庫來源，供私人 Codex 在公開 Wiki 尚未發布時按需讀取；不得把實際路徑或私人學習紀錄寫進公開文件。
- 目前 Codex 頁面 history 只存在分頁記憶體，CLI 使用 ephemeral 模式。用每次講評的進度摘要接續，不宣稱跨分頁或跨聊天自動記憶。
- Gemini 主頁提供私人 Azure 學習連結；公開介紹聊天沿用原規則。私人 Azure 教學使用 Gemini，私人 Codex 使用本機題庫，OpenAI 公開展示不讀私人資料。
- 管理者在私人 Codex 頁產生／撤銷邀請碼。`PRIVATE_STUDY_ADMIN_SECRET` 僅存在 Cloudflare secret 與本機未追蹤 `.env`；不可放前端、catalog 或 repository。`PRIVATE_STUDY_WIKI_DIR` 指向本機私人文章區。

## 最小來源

| 任務 | 檔案 |
| --- | --- |
| 首頁／品牌／導覽 | `src/pages/index.astro`、`src/components/Header.astro`、`src/layouts/BaseLayout.astro` |
| Wiki／搜尋 | `src/lib/wiki.ts`、`src/lib/wiki-sections.js`、`src/pages/search.astro`、`src/scripts/wiki-search.js`、`wiki/` |
| 語言／入口 | `src/scripts/i18n.js`、`src/scripts/locale-preference.js`、兩份 locale |
| 公開 AI UI | `src/pages/gemini.astro`、`src/pages/openai.astro`、`src/scripts/guest-gemini-client.js`、`src/scripts/gemini-onboarding.js` |
| 公開 AI 規則與檢索 | `worker/index.js`、`worker/openai.js`、`worker/chat-policy.js`、`worker/visitor-policy.js`、`worker/wiki-excerpts.js`、`worker/discovery-topics.js` |
| 私人教材／邀請／教學 | `worker/private-study.js`、`worker/private-study-model.js`、`worker/migrations/0004_private_study.sql`、`bridge/private-study.js`、`src/pages/private-study.astro`、`config/private-study-catalog.json` |
| 私人 Codex／學習提示 | `src/pages/codex.astro`、`src/scripts/study-presets.js`、`bridge/codex-prompt.js`、`bridge/server.js` |
| 管理／登入 | `src/pages/login.astro`、`src/components/ManagementUploader.astro`、`src/scripts/bridge-client.js` |
| 部署 | `.github/workflows/deploy.yml`、`astro.config.mjs`、兩份 wrangler config |

## 本機啟動與埠

本機有其他 KCIS 專案占用 8787／4322；不能看到這些埠回傳 HTTP 200 就當成個人 WikiNB。

```bash
npm run dev                         # 預設 4321
npm run bridge                      # PORT 由 bridge/.env 決定
npm test
npm run wiki:check
npm run build
npm run preview -- --host localhost --port 4321
```

本機私人 `.env` 可設定 `PUBLIC_BRIDGE_URL`，使靜態頁面連到選定 Bridge 埠；Bridge 的 `PORT`、前端 URL 和 `CORS_ORIGINS` 需一致。此機本輪配置使用 8788，不停止其他專案服務。正式部署仍以 GitHub variable／公開 config 為準，不把本機來源路徑發布上去。

本輪發現舊 `node_modules` 的 Astro／Tailwind 等 import 逾時。依既有 lockfile 執行專案內 `npm ci --no-audit --no-fund` 後，測試與靜態建置成功；沒有修改全域 runtime。遇到同類問題先縮小到專案依賴，不清理系統或全域套件。

## 部署與驗證

```bash
npm run wiki:check
npm test
npm run build
git diff --check
# test-private-study 使用 SQLite 驗證到期、兌換、撤銷、拒讀原文及失敗不跳題
```

精準 stage 本輪檔案，確認沒有 private Agent 路徑、.env、其他草稿或未授權第三方材料，再 commit／push。`main` push 由 GitHub Actions 部署 Pages；成功推送不等於部署已完成。

Pages 不會部署 Worker。只有修改 Worker 時才各自驗證、部署，避免以舊本機程式覆蓋正常線上版本：

```bash
npx wrangler deploy --config wrangler.jsonc --dry-run
npx wrangler deploy --config wrangler.openai.jsonc --dry-run
```

Worker secrets 保留在平台；訪客驗證使用 Resend 與 `auth.kainnne.com` 寄件子網域，私人 Bridge 使用自己的 SMTP。訪客 session 不授予管理／Codex 權限，兩者不能混用。

## 已知限制

- WikiNB／GEO 沒有每日自動掃描、改寫或發布排程。
- Bridge 依賴 Mac；`productionUrl` 的 Tailscale placeholder 尚未配置，不宣稱遠端私人管理可用。
- 私人文章閱讀及邀請碼管理依賴 Mac Bridge；訪客持碼的 Gemini 教學在雲端運作，不需 Mac。
- Gemini／OpenAI 生成自然度、實際 OTP 與各裝置觸控仍需按具體改動驗收；單純 health、HTTP 200、規則測試不替代這些驗收。
- OpenAI health 顯示可用不是帳戶餘額證明；不自動擴增 US$10 累計預算。
- 新增筆記需維護 `wiki/index.md`；遇到教材權利、既有修改重疊或驗證失敗，保留可審閱結果並明確報告待辦。

## 本輪私人服務發布驗證

2026-10-08 已將 584 題與 10 單元匯入私人 D1，584 筆問題所有原始欄位與本機來源逐欄比對一致，單元題號共 797 筆。使用者明確同意 Cloudflare D1 私人儲存及 Google Gemini 每題教學處理。Gemini 私人功能版本：`917552ae-6717-46af-bf86-8ad84b85837e`。OpenAI 本輪未重新部署。

全套既有測試與新增私人權限 SQLite 測試通過；手機介面以模擬 session/API 檢查標題不可點、教學閘門、換單元、先答後講評及安全渲染。實際管理者 OTP、訪客 OTP 與真實模型教學仍待本人使用驗收，不把模擬通過寫成完整真人端到端驗收。

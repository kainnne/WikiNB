# WikiNB 工程 Handoff

更新：2026-08-17

狀態：公開站、訪客 Gemini、私人登入與 GitHub Pages 部署皆已可用。

## 一句話

WikiNB 是以 `wiki/` Markdown 為公開內容來源的個人知識網站；Astro／GitHub Pages 負責閱讀體驗，Cloudflare Worker／D1 負責訪客 Gemini，本機 Bridge 負責 Kaine 的私人維護與 Codex。

## 接手時先讀

依序只讀以下檔案，通常不需要先掃完整個 repository：

1. 根目錄 `AGENTS.md` 與目標路徑中更深層的 `AGENTS.md`。
2. `git status -sb`，先保留使用者現有修改與未追蹤檔案。
3. 本文件與 `README.md`。
4. 依任務選讀下表中的 source of truth。

| 任務 | 最小來源 |
|---|---|
| 公開導覽／品牌／首頁 | `src/pages/index.astro`、`src/components/Header.astro`、`src/components/PublicDreamBackdrop.astro` |
| 公開 Wiki／搜尋 | `src/pages/wiki/`、`src/pages/search.astro`、`src/scripts/wiki-search.js`、`wiki/` |
| 中英文 | `src/scripts/i18n.js`、`src/locales/zh-TW.json`、`src/locales/en.json` |
| 訪客 Gemini UI | `src/pages/gemini.astro`、`src/scripts/guest-gemini-client.js` |
| Gemini 後端／檢索／額度 | `worker/index.js`、`worker/chat-policy.js`、`wrangler.jsonc`、`worker/schema.sql`、`worker/migrations/` |
| 私人登入／Wiki 管理／Codex | `src/pages/login.astro`、`src/scripts/bridge-client.js`、`bridge/server.js` |
| Pages 部署 | `.github/workflows/deploy.yml`、`astro.config.mjs` |
| 公開專案選材 | `wiki/Projects/project-overview.md`、`config/project-knowledge-sources.json` |

## 已完成且有回歸測試的功能

### 公開體驗

- 公開首頁、搜尋、文章、404、Gemini 與私人登入共用粉紅夢幻視覺系統。
- 響應式導覽包含 Kainnne 首頁、WikiNB、語言切換與主選單。
- 首頁提供聚焦式 `Kainnne x Gemini` CTA、雙側輕量裝飾、巢狀 Q&A 與隨機色調的最近更新卡片。
- favicon 與 apple touch icon 使用圓形漸層 K 標誌。
- 登入後才顯示 `+ md.`、Codex 與管理功能；單純前往 `/login` 不會取得權限。

### 中英文

- `data-i18n` 系統處理文字、HTML、placeholder、title、ARIA 與關鍵字。
- Gemini OTP／API 錯誤會由 `describeGuestAiMessage()` 映射為語系 key。
- 私人登入的靜態內容、執行中狀態與 Bridge 錯誤都會跟著語言按鈕重新渲染。
- 後端新增或修改固定提示文字時，必須同步更新 client mapping、兩份 locale 與測試。

### 訪客 Gemini

- 訪客以名稱、Email、6 位數 OTP 解鎖；session 與管理者登入完全分離。
- Worker 使用簽章訪客 token；D1 保存 OTP、rate limit、每日對話次數與 token 使用量。
- 對外角色以第一人稱「Kaine」回答，不再自稱數位助理或分身；公開 WikiNB 是唯一事實邊界，不能生成未公開私人事實或真實承諾。
- 每個已驗證 Email 依台北日期先開放 5 則訊息；以 Email hash 的 D1 原子計數強制執行。第 5 則回答後前端要求訪客選擇是否續聊。
- 訪客明確選擇續聊時，Worker 先寄一封不含對話內容的通知信給 Kaine，同一 Email 每日只通知一次；成功後解除則數門檻，但每日 token 總上限仍有效。
- 明顯與 Kaine 公開內容無關的問題由 Worker 直接回覆固定說明，不載入 Wiki corpus、不呼叫 Gemini，但仍計入當日 5 則訊息。
- Worker 只使用 repository 內不含個人資料的通用回答風格；不提供私人 persona secret 入口，也不讀取或上傳私人 persona 原文／摘要。
- 目前模型由 `wrangler.jsonc` 的 `GEMINI_MODEL` 指定為 `gemini-3.1-flash-lite`。
- 每次只選最多 4 份相關 Wiki 內容，corpus 約 6,500 字元；送入模型的對話 history 只保留最近 4 則訊息。
- 使用 minimal thinking，沒有設定 `maxOutputTokens` 硬截斷；Prompt 要求短而完整。
- 429 額度／速率錯誤不自動重試；500／502／503／504 或網路失敗最多重試一次。
- 未指定單一代表專案時只介紹 LumaReader；主要專案清單以 `wiki/Projects/project-overview.md` 為準。
- 詳細請求會改成精簡重點、延伸閱讀與聯絡方式，不產生長篇回答。

### 私人維護

- 管理者登入使用帳密 + Email OTP；OTP 失敗次數會累積並觸發暫停。
- 可新增、覆蓋、改名、刪除、建巢狀資料夾與修改顯示中繼資料。
- Bridge 可啟動／停止 Codex，並支援串流問答。
- 明確管理操作可自動 commit／push；沒有背景每日排程。

## 部署

### Astro / GitHub Pages

```bash
npm test
npm run build
git diff --check
git push origin main
```

`main` push 會觸發 `.github/workflows/deploy.yml`。部署後檢查：

- `https://wikinb.kainnne.com/`
- `https://wikinb.kainnne.com/search/`
- `https://wikinb.kainnne.com/gemini/`
- `https://wikinb.kainnne.com/login/`

### Cloudflare Worker

Pages push 不會部署 Worker。修改 `worker/index.js` 或 `wrangler.jsonc` 後，先驗證再獨立部署：

```bash
npx wrangler deploy --dry-run
npx wrangler deploy
```

全新 D1 可載入完整 schema；既有 D1 只執行尚未套用的 migration：

```bash
npx wrangler d1 execute wikinb-guest-ai --remote --file=worker/schema.sql
npx wrangler d1 execute wikinb-guest-ai --remote --file=worker/migrations/0002_daily_token_usage.sql
```

Cloudflare secrets 必須留在平台，不得寫入 Markdown、Git 或前端：

- `GEMINI_API_KEY`
- `SMTP_PASSWORD`
- `TOKEN_SECRET`

## 驗證與完成條件

```bash
npm test
npm run build
npm run wiki:check
git diff --check
```

- `scripts/test-nav-auth-visibility.mjs`：公開首頁、權限可見性、品牌介面、登入 i18n。
- `scripts/test-gemini-budget.mjs`：模型、檢索預算、節流 Prompt、代表專案與錯誤翻譯。
- `scripts/test-kaine-chat-policy.mjs`：限定聊天 scope、雙語拒絕與 4–5 則設定邊界。
- `npm run build`：Astro 靜態頁面與 sitemap。
- `npm run wiki:check`：巢狀 Wiki link 是否有效。

完成部署前確認只 stage 本輪檔案，不要順手納入既有 dirty files。

## 已知限制與不要誤判的事項

- WikiNB 與 GEO 沒有自動排程，不會每日自行掃描、改寫或發布。
- 公開 Gemini 使用共享免費 API 額度，遇到額度限制只能稍後再試或更換由 Kaine 提供的有效 key／方案。
- 私人 Bridge 依賴 Kaine 的 Mac 與可達網路；Bridge 離線不影響公開閱讀與訪客 Gemini。
- Worker 與 Pages 是兩條部署線；只 push GitHub 不代表 Worker 已更新。
- 公開 Wiki 不是專案 repository 或 CodexRules 的鏡像，不要把私人規則、secret、未完成原型或完整執行紀錄發布上去。
- MusicMatch、房價預測、未完成硬體、結構工程與個別小說不是目前對外代表成果；不要讓 Gemini 主動用它們描述 Kaine。

## 下一次修改的安全路徑

1. 先判斷修改屬於 Pages、Worker、Bridge 或 `wiki/`。
2. 只讀上方對應的最小來源。
3. 修改固定後端訊息時，同步更新中英文 mapping 與測試。
4. 修改公開專案優先級時，同步檢查 Worker 規則、`project-overview.md` 與 Gemini 回歸測試。
5. 跑對應測試與 build；需要部署時分別處理 Pages 與 Worker。
6. 更新本文件的現況段落，不在底部無限追加工作日誌。

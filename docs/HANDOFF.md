# WikiNB 工程 Handoff

更新：2026-09-06

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

### 2026-09-06 Gemini 引導入口與回答規則

- 已測試登入後第 5、6、12 則仍可回答、舊續聊端點不寄信、重新載入不恢復門檻，以及每日額度、頻率限制、無效登入仍攔截。

- 後續調整以合作為主要目的：入口與追問先說 Kaine 可負責的規劃、實作、串接與試行，以及可討論的成果。AI 導入不再預設為自學或訓練。第一次合作／能力回答若模型漏寫聯絡方式，Worker 會補上信箱；後續歷史已有信箱時不重複補，明確詢問聯絡方式則仍提供。
- 介面保持精簡：移除底部與驗證畫面的獨立聯絡按鈕，以及「最新訊息」浮動按鈕；聯絡方式由對話提供。保留原有捲動閱讀與新訊息跟隨行為。
- `visitorIntent()` 增加明確操作提問的 teaching 路徑，Kuse 操作問題優先取課程資料。一般介紹優先取 AI、軟體實作與協作資料，避免總是變成課程；教學可補充實際工作導入的合作方向，不能以推銷取代回答。

- 已部署至 GitHub Pages 與 Cloudflare Worker；正式 `/gemini/` 已確認五個入口與中性開場正常顯示。移除親暱人設，介紹能力時使用「Kaine／他」，並在公開筆記後再次提醒第一人稱來源不是 AI 本人的身分。

- 開場收斂為五個方向：認識 Kaine 與他的專長（第一個）、行政作業、文件知識、AI 工作應用，以及請 Kaine 協助規劃個人或業務網站。移除抽象的「將想法做成可用的工具」。點選直接提問；回答後提供相關追問與切換方向，保留自由輸入。文案兼顧專業感與易讀性。
- 本輪定位為展示個人 AI、自動化、網站設計與 AI Agent 能力；工作室與業務尚在規劃，不應描述為已營運服務或保證成果。
- 前端連接 `config/sites.json` 中的既有 Gemini Worker。前端先以原始問題做範圍判斷，再為相關提問附加簡短的任務與語氣指引；完全無關的要求不加指引。新增 `originalMessage` 傳送原始問題，舊 Worker 忽略此欄位；新版 Worker 用它檢索、判斷範圍與生成，不把前端文案當系統規則。
- 新增 `worker/visitor-policy.js`：以規則區分能力介紹、合作情境、作品技術與明確操作教學，不增加模型分類或重寫呼叫。介紹先說用途與能力，明確問作品才說名稱；人資等其他領域以合作情境處理，不能捏造 Kaine 的專業資格或代做該領域的決策。Worker 系統提示與檢索同步套用這些規則。
- 檢索仍最多四份、6,500 字元；能力介紹不補入無關作品，總覽節錄縮短。檢索歷史只參考訪客訊息，避免模型先前推論反過來影響資料選擇。沿用 `gemini-3.1-flash-lite`、minimal thinking、每日額度及重試限制；未接入付費模型。
- `src/scripts/gemini-onboarding.js` 管理入口、追問與請求長度；雙語文案位於兩份 locale。`scripts/test-gemini-onboarding.mjs` 檢查語系完整性、範圍與 API 長度邊界。
- 已完成本機編譯、回歸測試、Worker dry-run，以及新版請求使用原始問題／阻擋無關問題／只呼叫一次模型的模擬整合測試。正式 API 已試問能力介紹與人資合作情境；介紹未列產品名稱，人資回答聚焦資料與流程。生成式回答仍可能偏離語氣規格，模擬測試不等同語意品質保證。尚未完成所有裝置與觸控的視覺驗收。
- 本機試用以 `npm run build` 後的 `npm run preview -- --host localhost --port 4321` 提供。曾在開發伺服器運行期間建置後，發生 Vite 預先打包的 `marked`／`katex` 資源回傳 504，導致聊天初始化失敗、只剩空框；改用靜態預覽後已在 Codex 右側分頁確認選項及中英文切換正常。後續修改須重新建置再重新整理預覽；不把單純 HTTP 200 當成介面已初始化的證明。

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
- 2026-08-20 起，訪客 OTP 改由 Resend 與已驗證的寄件子網域寄送，寄件者固定為 `Kainnne × Gemini <login@auth.kainnne.com>`，Reply-To 為 `ryanzhu@kainnne.com`。
- `auth.kainnne.com` 只是 Kainnne 旗下服務共用的自動驗證信寄件網域，與公開網站位於 `wikinb.kainnne.com` 並不衝突；不要因網站網域不同而改回 Gmail 或另外建立寄件網域。
- 這裡的流程是無密碼 Email OTP，不是「密碼之後再驗證一次」的傳統 2FA。Kaine 口語提到「兩步驟驗證」時，若在談訪客 Gemini，通常是指先填資料、再輸入 Email 驗證碼的兩階段流程。
- Worker 使用簽章訪客 token；D1 保存 OTP、rate limit、每日對話次數與 token 使用量。
- 對外角色是介紹 Kaine 的中性 AI 助理，不冒充本人或採用親暱人設；公開 WikiNB 是唯一事實邊界，不能生成未公開私人事實或真實承諾。
- 免登入試問維持 5 則後要求驗證信箱；登入後取消五則續聊門檻，直接使用至每日 token 額度用完。訊息數僅記錄，不設五則上限。
- 不再寄送續聊通知；訪客首次完成信箱驗證的既有解鎖通知保留。舊 `/continue` API 僅驗證身分並回傳可聊天狀態，不寄信、不讀寫續聊核准資料。回應保留固定 false 的 `continuationRequired`／`conversationEnded` 以相容舊分頁。
- 明顯與 Kaine 公開內容無關的問題由 Worker 直接回覆固定說明，不載入 Wiki corpus、不呼叫 Gemini，仍記錄使用次數。
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
- `RESEND_API_KEY`：使用 WikiNB 自己的 sending-only、僅限 `auth.kainnne.com` 的 Resend API key，不與 ScopeCut 共用 key。
- `TOKEN_SECRET`

舊的 `SMTP_PASSWORD` 已不再被程式使用；若 Cloudflare 後台仍保留，只是待 Kaine 明確確認後清除的歷史 secret，不得重新接回功能。

## 驗證與完成條件

```bash
npm test
npm run build
npm run wiki:check
git diff --check
```

- `scripts/test-nav-auth-visibility.mjs`：公開首頁、權限可見性、品牌介面、登入 i18n。
- `scripts/test-gemini-budget.mjs`：模型、檢索預算、節流 Prompt、代表專案與錯誤翻譯。
- `scripts/test-kaine-chat-policy.mjs`：限定聊天 scope、雙語拒絕與合作聯絡政策。
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

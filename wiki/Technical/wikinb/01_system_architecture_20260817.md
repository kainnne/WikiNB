---
title: WikiNB 系統技術架構
description: 公開 Markdown 網站、Kaine 限定聊天、Cloudflare Worker／D1 與本機 Bridge 的三層系統說明。
type: note
status: active
tags:
  - WikiNB
  - Astro
  - Cloudflare Worker
  - Gemini
  - Codex
date: 2026-08-17
---

# WikiNB 系統技術架構

## 定位與功能頁

產品功能、內容原則與公開使用方式請先讀 [[Projects/Knowledge/wikinb]]。

WikiNB 同時包含三個權限與部署完全不同的執行層：

1. **公開內容層**：Astro 將 `wiki/` Markdown 建成 GitHub Pages 靜態網站。
2. **訪客 AI 層**：Cloudflare Worker、D1、Email OTP 與 Gemini API 提供「Kaine」限定聊天。
3. **私人維護層**：Kaine 本機 Bridge 管理 Markdown、Git 同步與 Codex CLI。

訪客通過 Email 驗證只取得聊天權限，不會因此取得 Wiki 寫入、同步、管理者登入或本機 Codex 權限。

狀態標記：

- **已實作於來源**：目前程式碼可直接確認。
- **既有文件記錄／本輪未重跑**：工程文件有明確紀錄，本次沒有重做 live 驗證。
- **需要獨立部署**：source 已存在，但只有完成對應 Pages 或 Worker 發布後才會影響正式站。

## 已確認技術

### 公開 Markdown 與搜尋

- **Astro 5 + Tailwind**：輸出靜態首頁、巢狀 Wiki、搜尋、登入、聊天與管理入口。
- **Gray Matter + Marked**：讀取 frontmatter、轉換 Markdown，並以 repository Git 日期補足最近更新資訊。
- **巢狀 slug**：`wiki/<folders>/<name>.md` 對應 `/wiki/<folders>/<name>/`；slug 正規化會擋下 `.`、`..` 與空路徑。
- **Wiki link**：`[[folder/note]]` 在建置時轉成站內連結；圖片路徑、responsive class、lazy loading 與 URI encoding 也在 parser 層處理。
- **搜尋索引**：建置時把標題、description、tags、folder 與純文字內容形成 search data；瀏覽器端可重建巢狀樹、依關鍵字過濾並展開命中路徑。
- **Metadata 優先序**：顯示用 `_meta.json` 覆寫可優先於 frontmatter；沒有覆寫時才依 frontmatter、H1 與檔名回退。

### Kaine 限定聊天

- **第一人稱定位**：system prompt 明確把模型定位為「Kaine」，以「我」回答公開經歷、作品、專案、技能與合作方向；不自稱數位助理、分身或 Gemini。
- **私人人格壓縮**：原始 persona 不進 repository、Wiki 或前端。Worker 只在執行期接收一份公開安全、經壓縮的表達摘要，並限制注入長度；沒有該摘要時使用不含私人事實的 fallback。
- **非通用聊天**：Worker 在呼叫 Gemini 前先以固定規則判斷問題是否屬於 Kaine 公開內容。微積分教學、作業代寫等一般問答直接回覆額度說明，不把請求送到模型。
- **4–5 則上限**：程式允許設定 4 或 5，超出範圍會被 clamp；目前公開設定為每個已驗證 Email、每個台北日期最多 5 則訊息。
- **結束行為**：第 5 則仍會得到回答，回覆末端再加入免費 API 額度與對話結束說明；之後輸入欄停用。重新整理、重新寄 OTP 或重新驗證不會重置當日計數。
- **額外成本保護**：無關問題也計入對話則數，但不呼叫 Gemini；超過上限後由 Worker 回固定訊息。

### RAG 與模型請求

- Worker 從公開搜尋頁的內嵌索引載入 Wiki 資料，並在 edge cache 保存約十分鐘。
- 查詢會產生英文詞與中文二至四字片段；title、tag、description 與 body 採不同權重排序。
- 每次最多選四頁，總 corpus 約 6,500 字元；一般頁截取較短，專案總覽可保留較長內容。
- 「一個代表專案」有固定編輯順位；「全部專案」優先使用專案總覽，不由目錄順序隨機決定。
- 只傳最近四則 history，每則再限制長度；模型使用 minimal thinking，沒有設定 `maxOutputTokens` 硬截斷。
- 一般回答要求 1–5 句；詳細請求改成短條列、延伸閱讀與聯絡路徑，不生成無限制長篇內容。
- API 的 429 不重試；500、502、503、504 或網路失敗最多重試一次。

### 驗證、額度與資料保存

- OTP 有期限、錯誤次數、IP／Email／全域速率限制與重新寄送等待時間。
- 驗證成功後使用有期限的 HMAC 簽章 guest token；前端把 token 放在 `sessionStorage`，關閉分頁工作階段後不作長期保存。
- D1 保存 OTP request、rate limit 與每日使用統計；聊天則數使用不可直接還原 Email 的雜湊 rate key。
- 每日 token 記錄優先採 Gemini 回傳 usage metadata；缺少 metadata 時使用輸入與輸出字元估算。
- 同一 token 的聊天請求還有數秒 burst limit，避免快速重複送出。

### 私人 Bridge

- Express Bridge 在 Kaine 的裝置上執行，處理帳密 + Email OTP、短期管理者 session、Wiki tree、上傳、建夾、改名、覆蓋、刪除、metadata 與 Git 同步。
- Codex chat 透過已登入的 Codex CLI 執行，使用 read-only、ephemeral sandbox；模型只輸出回答，不直接改 Wiki。
- 真正的 Markdown 寫入與 Git 操作由 Bridge 的明確管理 API 負責，與訪客 Worker 完全分離。

## 系統與資料流

### 公開內容建置

```text
wiki/**/*.md + frontmatter + wiki/_meta.json
                    ↓ src/lib/wiki.ts
頁面資料、巢狀樹、search index、最近更新
                    ↓ Astro build
                         dist/
                    ↓ GitHub Actions
                     GitHub Pages
```

Markdown 是長期可攜的內容 source；Astro 只是呈現層。搜尋與 AI 檢索都讀同一批公開內容，但採不同的執行時間：搜尋索引在 build 生成，Worker 在執行期抓取並短暫 cache。

### 訪客 Email 驗證

```text
訪客輸入名稱 + Email
        ↓ Worker 速率檢查
產生 OTP → 雜湊後寫入 D1 → SMTP 寄送
        ↓ 訪客提交六位數驗證碼
比對期限／錯誤次數／雜湊
        ↓
簽發有期限 guest token → 前端 sessionStorage
```

管理者登入走本機 Bridge 的另一套 session。兩套 token 不能互用。

### 聊天請求

```text
message + 最近 history + guest token
                 ↓
Worker 驗證 token、burst、每日 token 與當日則數
                 ↓ 原子保留一則
          問題是否屬於 Kaine？
          ├─ 否 → 固定婉拒，不呼叫 Gemini
          └─ 是
              ↓ 載入／快取公開搜尋索引
            最多 4 頁、約 6,500 字元 corpus
              ↓ system prompt + 精簡 persona + 最近 history
            Gemini generateContent（minimal thinking）
              ↓
       記錄使用量 → 回傳 answer 與剩餘狀態
              ↓ 若為第 5 則
       附加結束說明並鎖定前端輸入
```

### 私人維護與發布

```text
管理者瀏覽器
   ↓ 帳密 + OTP
本機 Bridge
   ├─ Wiki 管理 API ──> wiki/、metadata、公開資產
   ├─ Codex API ──────> read-only Codex CLI 回答
   └─ 明確同步 ───────> Git commit／push
                              ↓
                      GitHub Pages workflow
```

## 關鍵決策

1. **三層權限分離**：公開閱讀、訪客 AI、私人維護不共用 session，也不因其中一層解鎖而放大其他權限。
2. **Markdown 是內容 source of truth**：公開網站與 RAG 都以同一批可人工審閱檔案為基礎，避免把資料鎖進專屬後端格式。
3. **先分類、再呼叫模型**：無關的一般問答在 Worker 終止，節省免費 API 額度，也讓產品定位保持聚焦。
4. **短對話而不是永久聊天紀錄**：伺服端只維護每日則數與 token 統計；模型 history 只取最近四則，不建立公開聊天內容資料庫。
5. **Kaine 身分與事實邊界同時存在**：模型以第一人稱表達，但只能依公開 Wiki 事實回答，不得代替本人作現實承諾。
6. **persona 與知識分離**：persona 只提供語氣與判斷風格；專案、經歷與能力事實仍必須由公開檢索內容支持。
7. **Pages 與 Worker 分開部署**：靜態內容變更不會誤觸 AI backend；相對地，Worker 修改也必須明確獨立發布。
8. **不以硬輸出長度截斷答案**：先縮小 corpus、history、thinking 與回答規則，避免核心句子因固定 token cap 被截斷。

## 測試與驗證

### Repository 閘門

```bash
npm test
npm run wiki:check
npm run build
```

`npm test` 目前串接三組檢查：

- **導覽與權限 smoke test**：以假的 DOM／sessionStorage 驗證登入前後可見性，並用 source assertions 固定公開頁、管理頁與聊天 UI 的責任邊界。
- **Gemini budget regression**：確認四頁／6,500 字元 corpus、四則 history、minimal thinking、重試策略、Kaine 定位、persona 注入、5 則限制與 UI 文字沒有回退。
- **聊天政策 unit test**：直接執行 scope classifier、語言判斷、4–5 clamp、無關婉拒與結束訊息。

`wiki:check` 檢查巢狀 Wiki links；`build` 實際產生 Astro 靜態頁與 sitemap。

### 驗證邊界

- 自動測試能防止程式碼與文案規則退回舊行為，但多數 Worker 檢查屬 unit／source regression，不是實際 SMTP、D1、Gemini 與正式網域的端對端測試。
- Worker 可以先做 deploy dry-run；正式可用性仍要在獨立部署後檢查 health、OTP、聊天與 D1 寫入。
- **本輪文件本身未宣稱重新完成 live 驗證**；最終發布紀錄應由實際執行測試與部署的工作回報補足。

## 部署與執行邊界

### GitHub Pages

- 主要分支 push 觸發 workflow，安裝依賴、執行 Astro build，並上傳 `dist/`。
- Pages 發布包含 `wiki/`、前端頁面與 client scripts，不包含 Cloudflare Worker 的新程式。

### Cloudflare Worker

- `worker/index.js`、聊天 policy、模型設定、D1 綁定與 runtime persona 的變更需要獨立 Worker deploy。
- 新資料表或欄位需要另外套用 D1 schema／migration；只發布 Worker 不會自動修正既有資料庫結構。
- API key、SMTP 密碼、token 簽章材料與 persona 摘要只存在執行平台，不放進 Git 或前端 bundle。

### 本機 Bridge

- Bridge 依賴 Kaine 的裝置、網路、Codex CLI 登入與本機 Git 權限；它不是 Pages 或 Worker 的一部分。
- Bridge 離線不影響公開 Wiki 與已部署的訪客聊天，但私人管理、Codex 與同步會不可用。
- `AUTO_GIT_PUSH` 只控制明確管理操作後是否同步，不代表每日背景排程。

## 已知限制

- scope classifier 是明確規則與正規表示式，不是完整語意分類器；邊界句可能被誤判。追問只根據最近少量 user history 判斷上下文。
- 每一則在檢索與 Gemini 呼叫前先原子保留；若後續遇到 Wiki 讀取或模型暫時錯誤，該則目前仍會計入當日上限。這是避免並行超額的取捨。
- 無關問題也會消耗一則，目的是阻止用反覆一般問答探測免費模型入口；它不消耗 Gemini generation token。
- 前端只在當前頁面記住四則 history；重新整理後對話文字不還原，但 D1 的每日則數仍保留。
- 搜尋索引有 edge cache，剛發布的 Wiki 內容可能需要等待 cache 更新才進入聊天檢索。
- 簽章 guest token 在期限內由 Worker自行驗證；目前沒有每次查詢伺服器 session row 的即時單一 token 撤銷流程。
- 公開 RAG 是簡單加權檢索，不是 embedding index；同義詞、拼寫變化或非常抽象的問題可能選不到最佳頁面。
- `wiki/` 是公開資料層，不適合放未公開 prototype、私密研究資料或完整 repository dump；RAG 也不應被當作私人檔案搜尋器。
- Worker、Pages 與 Bridge 三條線可能版本不同步；判斷正式站行為時要分別確認部署狀態。

## 公開邊界

可公開：三層架構、API 職責、Markdown parser、RAG 預算、對話上限原則、驗證模型、測試方法與部署分線。

不公開：Email、資料庫識別碼、API key、SMTP 密碼、token 簽章材料、私人 persona 原文或摘要全文、Bridge `.env`、本機絕對路徑、訪客身分／IP、私人 Agent 規則與未公開筆記。人格設定只能描述「如何隔離與壓縮」，不能把私人檔案複製到公開文件。

## Source of truth

- `README.md`
- `docs/HANDOFF.md`
- `docs/ecosystem.md`
- `docs/local-codex-bridge.md`
- `package.json`
- `astro.config.mjs`
- `src/lib/wiki.ts`
- `src/scripts/wiki-search.js`
- `src/scripts/guest-gemini-client.js`
- `src/pages/gemini.astro`
- `worker/index.js`
- `worker/chat-policy.js`
- `worker/schema.sql`
- `worker/migrations/0002_daily_token_usage.sql`
- `bridge/server.js`
- `scripts/test-nav-auth-visibility.mjs`
- `scripts/test-gemini-budget.mjs`
- `scripts/test-kaine-chat-policy.mjs`
- `.github/workflows/deploy.yml`

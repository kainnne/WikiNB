---
title: ScopeCut 管線技術架構
description: 從引導式選項、Codex read-only 規劃，到 WikiNB 寫入與同步的 Project Contract 產生管線。
type: note
status: active
tags:
  - ScopeCut
  - Codex
  - Project Contract
  - Express
  - WikiNB
date: 2026-08-17
---

# ScopeCut 管線技術架構

## 定位與功能頁

產品目的、主要流程與使用價值請先讀 [[Projects/Workflow/scopecut]]。

ScopeCut 把「我突然想做一個東西」拆成十二組可選的範圍訊號，再交給 Codex 產生一份可直接給下一個 coding agent 執行的 Project Contract。公開 Pages 只承載 wizard UI；登入、Codex CLI、WikiNB 寫入與 Git push 都在使用者自己的本機 Bridge 執行。

狀態標記：

- **已實作**：目前程式碼可直接確認。
- **文件記錄／本輪未重跑**：README 或測試已有描述，本次沒有重新啟動完整流程。
- **規劃／待修正**：程式碼仍有移轉、驗證或精準同步邊界需要處理。

## 已確認技術

### 公開 wizard

- 純 HTML、CSS 與 Vanilla JavaScript，沒有前端框架 build step。
- 公開站載入時，瀏覽器對本機 Bridge 使用固定 API base；在 Bridge 自己提供的頁面則使用 same-origin path。
- 使用者輸入一段 idea，依序選擇十二組條件：可投入時間、精神狀態、專案類型、成品形式、技術偏好、AI 使用方式、儲存、UI、成熟度、驗收強度、GitHub 交付與參考專案。
- 單選項可自動前進，多選項有最大數量與自訂文字；最後 review 畫面才會送出。
- idea、補充說明與選項暫存在 `localStorage`，方便同一瀏覽器回到上次設定。

### 本機 Express Bridge

- Node.js ESM + Express 提供靜態 UI 與 API；JSON request 大小限制為 1 MB。
- Nodemailer 負責 Email OTP；SMTP 優先嘗試一種 TLS 連線，失敗後再使用另一種標準連線方式。
- 登入採帳密後再驗證六位數 OTP。OTP、鎖定計數與 session 都保存在 Bridge process memory。
- OTP 有效十分鐘；連續錯誤達門檻後暫停登入；session 有固定期限。
- 受保護 API 使用 Bearer token；未登入不能取得完整選項或啟動生成。
- 同一時間只允許一個 `generate` 工作，避免兩個 Codex 與 Wiki 寫入流程互相覆蓋。

### Codex 規劃層

- Bridge 以 child process 啟動已安裝且已登入的 Codex CLI。
- 明確使用 `read-only`、`ephemeral` sandbox；Codex 的 cwd 是 ScopeCut repository，但無權直接寫入 WikiNB。
- 模型與 reasoning effort 可由環境設定覆寫；沒有覆寫時讀 Codex 本機設定，再使用程式 fallback。
- 執行有整體 timeout；stdout 與 stderr 分開收集，完成後回傳模型與耗時。
- 測試模式可跳過真實 Codex，回傳固定的 meta + Markdown payload，讓整合測試不消耗模型請求。

### Contract prompt 與解析

- `prompt-builder` 把 idea、十二組選項與 extra notes 轉成完整 prompt。
- 時間與精神狀態不是展示欄位，而是 prompt 中的硬性 scope 規則：時間越短、精神狀態越低，允許的功能與架構複雜度越少。
- Prompt 要求輸出 System Role、Intent、Constraints、Technical Options、UI、Functional Requirements、Non-goals、Testing、README、Git、Definition of Done 與 Final Response Format。
- 模型輸出以四個固定 marker 分隔 JSON metadata 與 Markdown body；parser 不依賴自然語言猜測段落。
- 若模型額外輸出 frontmatter，parser 會移除，再由後端統一產生 WikiNB frontmatter。

### WikiNB 寫入層

- 後端淨化 slug、限制檔名長度，並在撞名時加入遞增編號，不覆蓋既有 Contract。
- 寫入 `wiki/Projects/` 時加上 WikiNB 所需 title、description、type、status、tags 與 date。
- 同步更新 `_meta.json` 與 `index.md` 的筆記連結。
- 自動 push 開啟時，後端建立 commit、push 目前 HEAD，並回傳相對檔案、頁面網址與 commit 資訊。
- 前端以 NDJSON 讀取 status、每五秒 tick、done 或 error，讓長時間 Codex 工作仍有進度回饋。

## 系統與資料流

### 驗證流程

```text
公開 wizard／Bridge UI
        ↓ 帳號 + 密碼
/api/auth/send-code
        ↓ 憑證比對、產生 OTP、寄信
使用者輸入六位數 OTP
        ↓ /api/auth/verify
process memory session → Bearer token → localStorage
```

ScopeCut 的登入只保護本機生成與寫入操作，不是 WikiNB 的公開訪客 Gemini 驗證，也不是通用 GitHub OAuth。

### Contract 產生流程

```text
idea + selections + extraNotes
            ↓ /api/generate
buildCodexPrompt()
            ↓ stdin
Codex CLI（read-only + ephemeral）
            ↓ stdout markers
parseCodexOutput()
            ↓ title／slug／description／tags／body
saveAndSync()
            ↓
wiki/Projects/<unique-slug>.md
wiki/_meta.json + wiki/index.md
            ↓ optional commit + push
WikiNB GitHub Pages
```

這個分工刻意讓模型只負責文字規劃：Codex 無法寫檔；能寫檔的 Node 後端只接受 parser 收斂後的固定欄位。

### 串流回報

```text
Bridge: status → tick → status → done／error
               NDJSON response
                       ↓
Browser: 逐行解析 → 更新進度卡 → 顯示 Wiki 路徑與網址
```

## 關鍵決策

1. **先收斂再實作**：ScopeCut 的輸出是 Agent contract，不直接替使用者完成新專案；下一個執行 Agent 才依合約工作。
2. **把時間與精神狀態寫成 scope constraint**：這兩個訊號會改變功能數量與架構，而不只是保存成 metadata。
3. **Codex 永遠 read-only**：模型不能自行新增、修改或刪除本機檔案；寫入責任集中在可測試的後端函式。
4. **固定 marker 而不是自由格式 parser**：metadata 與正文有機器可辨識界線，降低長回答解析錯位。
5. **靜態公開 UI + 本機私有執行**：Pages 不保管 Codex 登入、SMTP 密碼或 WikiNB Git 權限。
6. **單工作鎖**：目前設計優先避免本機同時寫入衝突，而不是建立佇列或多人服務。
7. **WikiNB 作為 Contract 保存層**：生成結果不是一次性聊天內容，而是帶 frontmatter、可索引、可版本控制的 Markdown。

## 測試與驗證

### Repository 自動測試

```bash
npm test
```

測試腳本目前包含十七個案例：

- 五個單元案例：prompt 包含輸入與選項、meta/body 解析、移除多餘 frontmatter、缺 marker 錯誤、slug 淨化。
- 十二個整合案例：啟動臨時 Bridge 與假 WikiNB，驗證 health、停用舊登入、錯誤帳密、OTP、錯碼累計、權限、選項、空 idea、NDJSON 生成、Markdown 寫入、meta/index 更新與 logout。
- 整合測試使用 fake Codex 且關閉 Git push，不依賴真實模型或遠端 repository。

### 本輪證據強度

- **已確認**：prompt、parser、Codex spawn flags、Wiki 寫入與測試範圍由程式碼審閱確認。
- **本輪未重跑**：沒有在來源 repository 重新執行 `npm test`、真實 SMTP、真實 Codex 或 WikiNB push；本頁不把過去或預期結果寫成新的成功紀錄。
- **未涵蓋**：公開 Pages 到本機 Bridge 的跨瀏覽器連線、正式郵件投遞、dirty worktree 同步與 GitHub Pages 完成部署不是 fake integration test 的範圍。

## 部署與執行邊界

### GitHub Pages

- Pages workflow 不需要 Node build；它只把 `public/` 複製成 Pages artifact。
- 公開站只包含 UI。沒有本機 Bridge 時，使用者可以看到介面，但不能登入、呼叫 Codex、寫入 WikiNB 或 push。

### 本機 Bridge

- `npm start` 啟動 Node／Express 服務；必須能找到 Codex CLI、WikiNB repository 與 Git executable。
- 帳密、SMTP、允許來源、WikiNB root 與是否自動 push 都由未追蹤的環境設定提供。
- process memory 中的 OTP、session、鎖定與 generating flag 在服務重啟後會清空，適合單一使用者本機工具，不是多 instance production session store。
- 公開 HTTPS 頁面連回 loopback HTTP 仍受瀏覽器 mixed-content、private-network 與 CORS 政策影響；不同瀏覽器需要實際測試。

### WikiNB 發布

- ScopeCut 的 push 只代表 Contract 已送到 WikiNB repository；Pages 是否完成仍由 WikiNB workflow 決定。
- ScopeCut 自己的 Pages workflow與 WikiNB Pages workflow 是兩條部署線。
- Codex 只產出 Contract，不代表 Contract 描述的目標專案已經實作或部署。

## 已知限制

- 本機驗證與 session 全在單一 process memory，重啟即失效，也不支援多台 Bridge 共享狀態。
- 同一時間只允許一個生成工作，沒有排隊、取消或斷線續傳機制。
- `saveAndSync` 目前會 stage 整個 `wiki/` 範圍，而不是只 stage 本次三個精確檔案；若 WikiNB 有其他未提交變更，可能混入同一 commit。實際使用前應保持工作樹可審閱，長期應改成精準檔案清單。
- 寫入管線本身沒有在 push 前執行 Wiki link check、WikiNB tests 與完整 build；目前主要依 ScopeCut integration test、GitHub workflow 或人工驗證補足。
- 日期使用執行環境的 ISO 日期；在台北午夜附近可能和 WikiNB 的台北日期規則不同。
- 目前來源仍有舊 GitHub owner／舊 Pages URL 字串；使用者名稱遷移後，正式網址、CORS origin 與回傳 page URL 必須逐項校正，不能只依重新導向。
- 程式包含開發環境將 OTP 顯示在本機終端機的 fallback；正式使用必須確認 SMTP 已設定，且不能把終端 log 當成遠端登入機制。
- Contract 品質仍取決於使用者選項與模型輸出；固定 parser 能保證格式，不保證需求判斷一定正確，仍需要人工 review。
- 目前 WikiNB root 有環境變數以外的開發機 fallback；若要跨機器安裝，應要求明確設定而不是依賴開發者環境。

## 公開邊界

可公開：十二組範圍訊號、read-only Codex 設計、marker protocol、NDJSON 狀態流、Wiki frontmatter／slug 處理、測試結構與兩條部署線。

不公開：帳號、收件 Email、SMTP 密碼、任何 OTP 或 session token、Codex 本機登入資料、WikiNB 本機絕對路徑、Git credential、環境變數實值、尚未公開 Contract 與私人專案內容。開發 fallback 的存在可以說明，但不得公開實際值。

## Source of truth

- `README.md`
- `package.json`
- `public/index.html`
- `public/app.js`
- `server/server.js`
- `server/options.js`
- `server/prompt-builder.js`
- `server/codex.js`
- `server/wikinb.js`
- `test/run-tests.mjs`
- `.github/workflows/deploy-pages.yml`

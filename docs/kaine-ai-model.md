# Kain³e AI 模型與金鑰（2026-11-25 起）

## 目前的做法

- 主要的 Kain³e AI（`/gemini/` 頁面，Worker `kainnne-gemini`）改用 OpenAI `gpt-5.4-mini`（Worker 變數 `OPENAI_MODEL`），reasoning low、每次最多 1,600 輸出 token、`store: false`。
- 回答規則與人設完全沿用 `worker/visitor-policy.js` 與 `worker/chat-policy.js`，OpenAI 與 Gemini 共用同一份提示詞，沒有改寫。
- OpenAI 失敗（網路、5xx、金鑰或額度問題）時自動改由 Gemini `gemini-3.1-flash-lite` 回答，訪客不會看到中斷。刪除 `OPENAI_API_KEY` secret 就回到原本的純 Gemini。
- 私人 AI 教學（`/api/private-study/`）同樣先走 OpenAI，失敗再用 Gemini。
- 「Codex（臨時開放）」入口（Worker `kainnne-openai`）也換成同一把金鑰與 `gpt-5.4-mini`，細節見 `openai-demo.md`。
- 模型呼叫集中在 `worker/llm.js`。

## 金鑰

- kainnne.com 專用 OpenAI 金鑰只放在本機 `~/.config/kainnne/kainnne-openai.env`（chmod 600）與兩支 Worker 的 `OPENAI_API_KEY` secret。不進 git、前端或文件。
- 設定方式：`(set -a; . ~/.config/kainnne/kainnne-openai.env; printf '%s' "$OPENAI_API_KEY") | npx wrangler secret put OPENAI_API_KEY --config <wrangler 設定>`。
- 這把金鑰只給 kainnne.com 相關服務，規則見 `/Users/kaine/CodexRules/AGENTS_Intro/05-operations/api-keys.md`。

## 追溯與用量保護

- 每次回答產生追溯碼 `KAI-XXXXXX`，回傳在 JSON 的 `trace`，錯誤訊息也會附上。
- D1 `wikinb-guest-ai` 的 `ai_logs` 表（migration `0005_ai_logs.sql`）記錄追溯碼、匿名化使用者、供應商、模型、輸入／輸出／快取 token、耗時與狀態。
- 原有保護全部保留：每 4 秒一則、匿名每個網路每天 12 則、匿名全站每天 200 則、每人每日 token 上限（`DAILY_TOKEN_LIMIT`，改為 200,000）。
- 新增全站每日上限 `AI_SITE_DAY_TOKENS`（1,500,000 token，約 US$2–5）：超過時當天暫停所有回答，並寄一封通知到 `OWNER_EMAIL`，隔天自動恢復。
- 查最近紀錄：`npx wrangler d1 execute wikinb-guest-ai --remote --command "SELECT * FROM ai_logs ORDER BY time DESC LIMIT 20"`。

## 成本參考

實測一則回答約 4,300 輸入 token（其中約 1,900 命中快取）與 270 輸出 token，約 US$0.003。

# OpenAI 臨時聊天入口

2026-09-12 新增 `/openai/` 頁面與右上選單「Codex（臨時開放）」，供訪客在 Gemini 額度不足時自行選擇。使用者不需登入、不付費；由站主提供限額的 API 費用。沒有每日／每人訊息數上限，仍受防連點、供應商流量限制與整體預算約束。

## 共用介面

`src/pages/openai.astro` 直接以 `provider="openai"` 使用既有 Gemini 頁面；版面、五個初始提示、免費抽題、後續追問及手機滿版保持共用。顯示名稱為 Codex，字樣為黑色；兩個入口的「換個方向」皆為粉紅色。API 仍是既有 OpenAI Responses API，並非私人 Codex CLI。OpenAI 分支不讀取 Gemini session，也不套用第五則登入門檻；錯誤與預算維持獨立。

## 邊界與資料

- `worker/openai.js` 部署成獨立 `kainnne-openai` Worker；`wrangler.jsonc` 的 Gemini 部署設定不變。
- 呼叫 OpenAI Responses API，固定 `gpt-5.6-luna`、low reasoning、每次最多 4,096 輸出 token（含推理）、標準費率、`store: false`。不呼叫 CLI，不提供工具，不讀私人 persona。
- 從 Gemini 既有程式匯入公開筆記檢索與回答規則；角色仍是以第三人稱介紹 Kaine 的 AI。沒有新增人格設定。
- 知識仍取自公開 WikiNB；最多四篇、6,500 字元。歷史只接受最近四則 user／assistant 文字，各最多 1,200 字；客戶端不能傳入 system 指令、模型或額度設定。
- 問題及最近對話會送至 OpenAI。站方不把對話、名字或 Email 寫入資料庫；`store: false` 不等於供應商完全不保留任何資料。
- CORS 與後端 Origin 驗證限制正常網頁來源，不能視為身分驗證或防機器人機制。此入口依站主要求公開，真正的花費保護是後端預算。

## 預算與錯誤

新資料表 `openai_demo_budget`、`openai_demo_rate` 位於既有 D1，與 Gemini 的每日使用量、登入與驗證資料表分開。金鑰只有 OpenAI Worker 的 `OPENAI_API_KEY` Secret 可讀。

- 本入口累計上限為 US$10，`DEMO_BUDGET_MICROUSD` 可降低，程式不接受高於 US$10 的值；不每日補滿，也不建立自動續費。
- 每次先用原子條件更新保留費用，再呼叫模型；併發請求不能各自讀到相同餘額後同時放行。
- 依官方標準費率，input 每百萬 US$0.20、cache writes US$0.25、output US$1.20。預算以全部輸入按 US$0.25 計算，作為保守安全估算，因此不是帳單或帳戶餘額。參考：[OpenAI pricing](https://developers.openai.com/api/docs/pricing)、[GPT-5.6 Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna)。
- 預留時採請求 UTF-8 bytes 加 framing 緩衝估算輸入、完整輸出上限；成功後用 usage 結算安全估算。無 usage 或網路中斷則保留原預留，避免把未知成本當免費。
- 明確的 400／401／403／404／429 退回該次預留。`insufficient_quota` 另外將入口關閉；一般 429 只暫停該次，不誤判為餘額用完。沒有自動付費重試。
- 若帳戶剩餘額度少於 US$10，供應商可能先拒絕；ScopeCut 等其他 API 使用也可能消耗同帳戶餘額。這裡無法查到儲值餘額，不能宣稱另外獲得十美元。
- 每個網路每四秒最多一則，與 Gemini 分開計數。只存按 UTC 日期雜湊的網路識別和時間，不保存原始 IP。這是短期入口，退役時可另行評估清除其專用資料。

## 部署與驗證

```bash
npm run wiki:check
npm test
npm run build
npx wrangler deploy --config wrangler.openai.jsonc --dry-run
npx wrangler d1 execute wikinb-guest-ai --config wrangler.openai.jsonc --remote --file worker/migrations/0003_openai_demo.sql
npx wrangler deploy --config wrangler.openai.jsonc
npx wrangler secret put OPENAI_API_KEY --config wrangler.openai.jsonc
```

Secret 透過互動輸入或受保護的程序 stdin 傳入；不放命令參數、Git、前端、log 或對話。建議使用站主原儲值專案中的 WikiNB 專用 key；不從 ScopeCut Worker 讀回或公開轉送其 Secret。

`config/openai-demo.json` 的 URL 取自實際 Worker 部署輸出。Pages 與 Worker 分開部署，前端發布不會部署 Gemini 或 OpenAI Worker。

- Health：`GET /api/openai/health`，只顯示服務、模型與是否開放，不揭露 key 或金額。
- Chat：`POST /api/openai/chat`，body 是 `message` 與 `history`。錯誤使用穩定 code，前端提供中英文訊息。
- `scripts/test-openai-demo.mjs` 以 Python SQLite 執行真實 SQL，測試併發預留、額度停止、錯誤結算、不重試、規則共用、舊 Gemini health 及語系完整性。Python 僅供測試。
- 介面應核對桌面、平板、窄螢幕、觸控、中文輸入法、雙擊、防 XSS、英文及額度用完狀態。
- 沒有金鑰時 health 為不可用，不能把編譯成功當成 API 已接通。上線需另做一筆小額真實回答測試。

## 停用與恢復

將 `wrangler.openai.jsonc` 的 `DEMO_ENABLED` 改為 `false` 並只部署該設定，即可停用 OpenAI，Gemini 不受影響。也可在另一次授權變更中移除選單連結。

入口因供應商額度不足而關閉後不會自動恢復。確認新的費用授權與帳戶狀態後，才可將 `closed` 改回 0；保留 `charged_microusd`，不要重跑流程時重設已用金額。累計 US$10 用完時，需另外討論新一輪預算，不自動續開。

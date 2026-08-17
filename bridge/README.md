# WikiNB Bridge

本機 API：

- 登入（帳密 + 驗證碼，預設寄到主信箱）
- **新增 MD**：上傳到 `wiki/`（可選資料夾）並可自動 git push
- 建立資料夾、重新命名、刪除（可自動推送）
- 覆蓋既有 Markdown、更新顯示標題／簡述／關鍵字
- Codex 問答（讀 wiki，學習／提醒助理）

> Bridge 是 Kaine 私人維護入口。訪客 Email 驗證與 Gemini 問答由 Cloudflare Worker 處理；訪客 session 不能呼叫 Bridge 管理 API。

## 快速設定

```bash
npm run bridge:install
cp bridge/.env.example bridge/.env
npm run bridge
```

## 新增 MD

網站登入後按「新增 MD」：選／建資料夾 → 拖入 `.md` → 本機寫入 + `git add -A wiki/` + push。  
Pages 重新部署通常約 2–5 分鐘（含大圖時可能更久）。

## 自動同步

```env
AUTO_GIT_PUSH=true
# 可選：GITHUB_TOKEN=ghp_…
```

上傳／建夾／刪除／重新命名可帶 `autoSync: true`（網站預設如此）。

`AUTO_GIT_PUSH` 只在使用者明確執行管理操作時生效，不是背景排程，也不會自動掃描其他 Projects。

## bridge/.env 必填

| 變數 | 說明 |
|------|------|
| `WIKINB_AUTH_USER` / `WIKINB_AUTH_PASS` | 登入帳密 |
| `WIKINB_AUTH_EMAILS` | 驗證碼收件信箱（預設只寄 `chaos60649@gmail.com`） |
| `SMTP_USER` / `SMTP_PASS` | Gmail 應用程式密碼 |
| `CORS_ORIGINS` | 含 `https://wikinb.kainnne.com`；保留本機與新 GitHub Pages origin |
| `DEV_LOG_CODE` | 僅限本機開發；未設定 SMTP 時是否在終端顯示驗證碼 |

## Codex

```bash
codex /status   # ChatGPT Plus，勿用 API Key
```

## 驗證與交接

```bash
npm test
npm run build
```

完整 API、權限邊界與排查方式見
[docs/local-codex-bridge.md](../docs/local-codex-bridge.md)；整體工程現況見
[docs/HANDOFF.md](../docs/HANDOFF.md)。

## Tailscale（選用）

更新 `config/sites.json` 的 `bridge.productionUrl`。

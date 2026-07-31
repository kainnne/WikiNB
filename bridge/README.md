# WikiNB Bridge

本機 API：

- 登入（帳密 + 驗證碼，預設寄到主信箱）
- **新增 MD**：上傳到 `wiki/`（可選資料夾）並可自動 git push
- 建立資料夾、重新命名、刪除（可自動推送）
- Codex 問答（讀 wiki，學習／提醒助理）

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

## bridge/.env 必填

| 變數 | 說明 |
|------|------|
| `WIKINB_AUTH_USER` / `WIKINB_AUTH_PASS` | 登入帳密 |
| `WIKINB_AUTH_EMAILS` | 驗證碼收件信箱（預設只寄 `chaos60649@gmail.com`） |
| `SMTP_USER` / `SMTP_PASS` | Gmail 應用程式密碼 |
| `CORS_ORIGINS` | 含 `https://zx50416.github.io` |

## Codex

```bash
codex /status   # ChatGPT Plus，勿用 API Key
```

## Tailscale（選用）

更新 `config/sites.json` 的 `bridge.productionUrl`。

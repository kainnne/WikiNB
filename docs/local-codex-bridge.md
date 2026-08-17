# WikiNB 本機 Bridge 與 Codex

更新：2026-08-17

## 定位

Bridge 是 Kaine 私人維護 WikiNB 的本機 API。它負責管理者驗證、Markdown 寫入、Git 同步與 Codex CLI；公開訪客的 Gemini 驗證則由 Cloudflare Worker 負責，兩者的 session 與權限完全分離。

| 層 | 不需 Mac | 需要 Mac |
|---|---:|---:|
| 公開 Wiki、搜尋、首頁 | ✅ | — |
| 訪客 Gemini Email 驗證與問答 | ✅ | — |
| 私人登入、Wiki 寫入、Git 同步、Codex | — | ✅ |

## 啟動

```bash
npm run bridge:install
cp bridge/.env.example bridge/.env
npm run bridge
```

正式站若要連回 Bridge，`config/sites.json` 的 `bridge.productionUrl` 必須是瀏覽器可達且已允許 CORS 的網址。未設定遠端入口時，公開網站仍可閱讀與使用訪客 Gemini，但私人維護功能會顯示 Bridge 未連線。

## 管理者驗證

1. `/login` 送出帳號與密碼。
2. Bridge 驗證成功後寄送 Email OTP；開發模式可把驗證碼留在本機終端機。
3. OTP 通過後，session token 只保存在該瀏覽器的 `sessionStorage`。
4. 只有有效管理者 token 才會顯示 `+ md.`、Codex、管理與同步功能。
5. OTP 連續錯誤會累積並暫停登入；重新寄送不會清除失敗次數。

## API

| 路徑 | 說明 |
|---|---|
| `GET /api/health` | Bridge 狀態 |
| `POST /api/auth/send-code` | 驗證帳密並寄送 OTP |
| `POST /api/auth/verify` | 驗證 OTP、建立管理者 session |
| `POST /api/auth/logout` / `GET /api/auth/me` | 登出／確認 session |
| `POST /api/sync` | 同步已允許的 WikiNB 檔案並 push |
| `GET /api/wiki/list` / `GET /api/wiki/tree` | 取得筆記清單／巢狀樹 |
| `POST /api/wiki/upload` | 新增 Markdown；舊 `/api/ingest` 仍相容 |
| `POST /api/wiki/mkdir` | 建立巢狀資料夾 |
| `POST /api/wiki/rename` | 重新命名筆記並修正相關資料 |
| `POST /api/wiki/replace` | 以新 Markdown 覆蓋，舊檔備份到 `public/old_md` |
| `POST /api/wiki/update-title` | 更新顯示標題、簡述與關鍵字 |
| `POST /api/wiki/delete` | 刪除筆記或資料夾 |
| `GET /api/codex/models` | 取得可用 Codex 模型 |
| `POST /api/codex/chat` | Codex 問答；支援一般 JSON 與串流回應 |
| `POST /api/codex/stop` | 停止目前的 Codex 工作 |

## 寫入與發布流程

1. 網站送出管理操作與 `autoSync`。
2. Bridge 只在 repository 允許範圍內修改 `wiki/`、中繼資料或公開圖片。
3. 需要自動發布時，Bridge 建立 Git commit 並 push `main`。
4. GitHub Actions 建置 Astro、產生 sitemap，並發布 GitHub Pages。

`AUTO_GIT_PUSH=true` 只控制明確觸發的管理操作；它不是每日排程，也不會主動掃描其他 Projects。

## Codex

```bash
codex /status
```

Bridge 使用已登入的 Codex CLI，不應把 OpenAI API key 寫進前端或 repository。Codex 適合深入閱讀本機 `wiki/`、整理脈絡與規劃下一步；公開 Gemini 則只取得經檢索的少量公開內容。

## 常見排查

- **公開站可看、私人登入顯示離線**：檢查 Mac、Bridge 程序、`productionUrl`、Tailscale／網路與 `CORS_ORIGINS`。
- **帳密正確但收不到 OTP**：檢查 Gmail 應用程式密碼與 Bridge 終端輸出。
- **管理成功但網站沒更新**：檢查 `AUTO_GIT_PUSH`、本機 Git 權限與 GitHub Pages workflow。
- **GitHub 使用者名稱或網域錯誤**：搜尋是否仍寫死舊的 `zx50416` 或舊 Pages origin。

環境變數與操作細節見 [bridge/README.md](../bridge/README.md)，整體交接見 [HANDOFF.md](./HANDOFF.md)。

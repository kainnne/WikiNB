# Kainnne / WikiNB

WikiNB 是 Kaine 的公開 Markdown 知識庫、訪客限定聊天與私人維護工作台。

**正式網站：** [https://wikinb.kainnne.com/](https://wikinb.kainnne.com/)

## 目前可以做什麼

### 公開訪客

- 從首頁、最近更新、巢狀 Wiki 與搜尋閱讀公開筆記。
- 使用繁體中文／英文介面；登入、Gemini 驗證與錯誤提示也會跟著語言切換。
- 以 Email 驗證解鎖 **Kainnne x Gemini**，由 Kaine 的第一人稱角度詢問公開專案、能力、工作方式與合作方向。
- 每個已驗證 Email 每天最多 5 則訊息；無關的一般問答由 Worker 直接婉拒，不呼叫 Gemini。

### Kaine 私人維護

- 以帳密與 Email 驗證碼登入本機 Bridge。
- 新增、覆蓋、重新命名、刪除 Markdown，並維護顯示標題、簡述與關鍵字。
- 使用 Codex 讀取本機 `wiki/`，進行較深入的回想、整理與下一步規劃。
- 明確觸發 Git 同步與 GitHub Pages 部署。

## 系統組成

| 元件 | 用途 | 是否依賴 Kaine 的 Mac |
|---|---|---|
| Astro + GitHub Pages | 公開首頁、Wiki、搜尋與登入介面 | 否 |
| Cloudflare Worker + D1 | 訪客驗證、Gemini 檢索問答、速率與額度控制 | 否 |
| 本機 Bridge | 私人登入、Wiki 寫入、Git 同步與 Codex | 是 |
| `wiki/` | 公開內容的主要來源 | — |

訪客 Gemini 與私人登入是兩套獨立權限：通過訪客驗證不會取得筆記管理、同步或 Codex 權限。

## 本地開發

```bash
npm install
npm run dev          # Astro：http://localhost:4321/
npm run bridge       # 私人登入／Wiki 管理／Codex
npm test             # 公開介面、權限與 Gemini 額度回歸測試
npm run build        # 正式靜態建置 + sitemap
```

Bridge 初次使用前先執行 `npm run bridge:install`，並依
[bridge/README.md](./bridge/README.md) 建立未追蹤的 `bridge/.env`。

## 部署邊界

- `main` push 會觸發 `.github/workflows/deploy.yml`，只部署 Astro 靜態網站到 GitHub Pages。
- `worker/index.js` 或 `wrangler.jsonc` 的修改不會隨 Pages 自動上線；需另行執行 `npx wrangler deploy`。
- WikiNB 與其他專案目前沒有每日自動掃描或自動改寫排程；公開內容由 Kaine 明確觸發並審閱。

## 文件入口

| 文件 | 用途 |
|---|---|
| [docs/HANDOFF.md](./docs/HANDOFF.md) | 下一位 Agent 的最小工程交接入口 |
| [docs/ecosystem.md](./docs/ecosystem.md) | 公開站、Worker、Bridge 與 Me 的關係 |
| [docs/local-codex-bridge.md](./docs/local-codex-bridge.md) | 私人 Bridge 架構與 API |
| [bridge/README.md](./bridge/README.md) | Bridge 安裝、環境變數與操作 |
| [AGENTS.md](./AGENTS.md) | 本專案 AI 協作與內容規則 |

姊妹站：[Kainnne.com](https://kainnne.com/)

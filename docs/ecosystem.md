# Kainnne 生態系與權限邊界

更新：2026-08-17

## 對外網站

| 產品 | 主要用途 | Source of truth |
|---|---|---|
| [Kainnne.com](https://kainnne.com/) | 履歷、作品與對外能力證明 | Me repository 的網站資料 |
| [WikiNB](https://wikinb.kainnne.com/) | 公開筆記、專案說明與 Kaine 限定聊天 | 本 repository 的 `wiki/` |

Kainnne.com 負責「快速認識 Kaine」，WikiNB 負責「閱讀可追溯的脈絡並繼續提問」。兩站共用粉紅夢幻、輕量互動的視覺語言，但內容責任不同，不應互相複製整份資料。

## WikiNB 三個執行層

| 層 | 元件 | 職責 | 權限 |
|---|---|---|---|
| 公開內容層 | Astro + GitHub Pages | 首頁、巢狀 Wiki、搜尋、最近更新、中英文介面 | 公開唯讀 |
| 訪客 AI 層 | Cloudflare Worker + D1 + Gemini API | Email OTP、訪客 session、RAG、速率與 token 額度控制 | 只能問答 |
| 私人維護層 | Kaine 的本機 Bridge + Codex CLI | 管理 `wiki/`、同步 Git、Codex 對話 | Kaine 專用 |

## 公開介面現況

- 首頁以 WikiNB 品牌與 `Kainnne x Gemini` 為主要焦點。
- `How to use WikiNB` 使用巢狀收合 Q&A，說明瀏覽、Gemini 與私人登入的差異。
- 最近更新卡片會在每次載入時重新排列三種柔和色調。
- 首頁、搜尋、文章、404、訪客 AI 與私人登入共用公開視覺系統、品牌 favicon 與響應式導覽。
- 語言按鈕支援靜態介面與動態驗證／錯誤訊息；新增後端提示時，必須同步補齊語系映射。

## Kaine 限定聊天定位

`Kainnne x Gemini` 是由公開 WikiNB 與 Gemini 驅動、以第一人稱 Kaine 回答的限定聊天。介面與模型不使用「數位助理」或「分身」自稱，也不提供通用問答；公開筆記事實仍是回答邊界，不能代替 Kaine 在真實世界承諾或創造未公開立場。

- 只依公開 WikiNB 索引選取少量相關內容，不把完整知識庫送入單次請求。
- 每個已驗證 Email 依台北日期先開放 5 則訊息；第 5 則回覆後詢問是否續聊。訪客確認後，Worker 寄一封不含對話內容的通知信給 Kaine，再解除則數門檻；每日 token 總上限仍有效。
- 明顯無關的一般教學、作業或通用問答由 Worker 固定婉拒，不送入 Gemini。
- 只採用 repository 內不含個人資料的通用回答風格；私人 persona 原文或摘要不會送入 repository、Wiki、前端、Gemini 或其他第三方服務。
- 未指定代表專案時優先介紹 LumaReader；多專案總覽以 `wiki/Projects/project-overview.md` 為準。
- 回答預設言簡意賅，但不設定硬性的輸出截斷長度；完整回答核心問題優先。
- 訪客要求長篇細節時，仍提供精簡重點、相關 WikiNB 文件與聯絡方式。
- 免費 API 的 429 不自動重試；暫時性 5xx／網路錯誤最多重試一次。
- MusicMatch、房價預測、未完成硬體、個別小說與不符合目前主軸的內容不主動推薦。

## 資料與更新原則

- `wiki/` 是公開、人類可讀的展示與檢索層，不是 repository 的完整鏡像。
- 專案程式、README、測試與 handoff 才是工程 source of truth。
- CodexRules／AGENTS 資料是私人跨專案協作規則，不應整包發布到公開 Wiki。
- WikiNB 與 GEO 目前沒有每日自動更新排程。任何掃描、改寫、commit、push 與部署都需要 Kaine 明確觸發。

## 延伸文件

- [工程 Handoff](./HANDOFF.md)
- [本機 Bridge 與 Codex](./local-codex-bridge.md)
- [Bridge 操作說明](../bridge/README.md)

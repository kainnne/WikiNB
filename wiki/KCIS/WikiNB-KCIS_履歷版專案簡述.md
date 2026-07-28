# WikiNB · KCIS

## 技術摘要

- **Frontend**：Astro、Tailwind CSS、JavaScript、Markdown、KaTeX
- **Backend**：Node.js、Express、REST API
- **Authentication**：Email OTP、JWT／Bearer Token、Role-based Access Control
- **AI Integration**：Gemini API、Vertex AI、Codex CLI、可替換 LLM Adapter
- **Cloud & Storage**：Google Drive API、Google Service Account、Cloudflare Tunnel
- **Deployment**：GitHub Pages、GitHub Actions、CI/CD
- **Version Control**：Git、GitHub
- **Future Production Stack**：Docker、Google Cloud Run、Artifact Registry、Secret Manager、Cloud Logging

---

## 專案簡述

**WikiNB · KCIS** 是為康橋國際學校設計的教學筆記知識庫與 AI 複習平台。

專案目標是讓教師能以較低門檻建立、整理與發布教學筆記，並讓學生登入後依照老師、科目與教材內容進行搜尋、閱讀及 AI 問答。

目前已完成可操作的測試版本，並經主管確認方向，後續將依教師實際使用意願與回饋，評估長期導入。

---

## 主要功能

- 教師、學生與管理員角色權限
- Email 驗證碼登入
- 教師個人教材空間
- Markdown 筆記新增、編輯、上傳、重新命名與刪除
- 圖片與數學公式顯示
- 依教師、科目與關鍵字搜尋教材
- Google Drive 教材儲存與同步
- AI 教材問答、重點整理、延伸說明與練習題生成
- Gemini、Vertex AI 與 Codex CLI 模型切換
- GitHub Actions 自動建置與部署

---

## 我的工作內容

- 從校內需求出發，規劃產品功能、使用流程與權限架構
- 設計教師、科目與教材的資料結構
- 使用 coding agent 協助完成前後端開發
- 整合登入、API、Google Drive、AI 模型與部署服務
- 處理 CORS、HTTPS、Token、跨網域登入與權限問題
- 進行功能測試、除錯、迭代與版本管理
- 撰寫部署、維運與交接文件
- 向主管展示成果並取得測試導入確認

---

## 能力定位

此專案證明我能夠：

- 將模糊需求轉換為可測試的 AI 產品
- 使用 coding agent 主導完整開發流程
- 整合 frontend、backend、authentication、cloud API 與 LLM
- 將本機專案部署成可供他人實際測試的網站
- 處理真實使用情境中的登入、權限、部署與資料同步問題
- 建立適合教育場域的 AI application prototype

適合的職務方向：

- AI Application Developer
- AI Product Engineer
- Agent-assisted Full-stack Developer
- AI Solution Prototyper
- Digital Learning Solutions Engineer

---

## 下一階段

目前版本屬於校內測試用 prototype。

若進入正式長期使用，預計遷移至 GCP：

- 使用 Docker 封裝後端服務
- 部署至 Google Cloud Run
- 使用 Artifact Registry 管理 image
- 使用 Secret Manager 管理密鑰
- 加入 Cloud Logging、監控與錯誤追蹤
- 補上自動化測試、rate limiting、正式 database 與備份機制
- 建立更完整的 CI/CD 流程

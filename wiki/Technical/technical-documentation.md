---
title: Kainnne 專案技術文件
description: 將產品功能說明與可公開的工程架構分開保存，集中連結十二個專案來源的技術文件。
type: note
status: active
tags:
  - Kainnne
  - 技術文件
  - 系統架構
  - 專案索引
date: 2026-08-17
updated: 2026-08-24
---

# Kainnne 專案技術文件

## 定位與功能頁

這個資料夾是 WikiNB 的公開技術層。`Projects/` 保留產品定位、功能與價值；`Technical/` 記錄程式實際如何組成、資料如何流動、哪些部分已驗證，以及部署與安全邊界。

技術文件不是 repository 的替代品，也不把 README 或程式碼整份複製進 WikiNB。每頁只整理理解與維護系統所需、且適合公開的工程事實；遇到差異時仍以對應 repository 的 source of truth 為準。

### 產品與網站

- [[Technical/kainnne-personal-portal/01_architecture_20260817|Kainnne 個人入口網站：前端與 GEO／SEO 架構]]
- [[Technical/kainnne-lumareader/02_architecture_and_release_20260824|Kainnne LumaReader：本機檔案權限、編輯與跨平台發行]]（[[Technical/kainnne-lumareader/01_architecture_20260817|發行前架構快照]]）
- [[Technical/kainnne-forms-landing/01_site_architecture_20260817|Kainnne Forms Landing：靜態網站架構]]

### 知識系統與教育應用

- [[Technical/wikinb/01_system_architecture_20260817|WikiNB：公開內容、訪客 AI 與私人 Bridge 架構]]
- [[Technical/wikinb-for-kcis/01_prototype_architecture_20260817|WikiNB for KCIS：原型架構]]
- [[Technical/wikinb-enterprise/01_v1_prototype_and_v2_plan_20260817|WikiNB Enterprise：第一版原型與第二版規劃邊界]]

### Agent 與工作流程

- [[Technical/scopecut/01_pipeline_architecture_20260817|ScopeCut：Project Contract 產生管線]]
- [[Technical/kainnne-geo-automation/01_audit_engine_20260817|Kainnne GEO Automation：稽核引擎]]
- [[Technical/ai-document-workflow-workshop/01_workflow_and_viewer_20260817|AI 文件工作坊：文件流程與 Viewer]]
- [[Technical/visual-novel-production-system/01_pipeline_and_qa_20260817|視覺小說製作系統：模組化管線與 QA]]

### 實驗與學習實作

- [[Technical/customer-message-classification/01_experiment_design_20260817|客服訊息分類：實驗設計與比較方法]]
- [[Technical/python-foundations/01_exercise_implementation_notes_20260817|Python Foundations：練習實作筆記]]

### 目前不建立詳細技術頁

- **KCIS AI Navigation**：尚未納入正式跨專案 source 白名單，因此先維持 [[KCIS/kcis-ai-navigation|既有公開功能頁]]，不依零散檔案推測架構。
- **CodexRules／agents CLI**：[[Systems/codexrules-agent-system|既有 Systems 公開摘要]] 已到安全邊界。系統價值與公開使用方式可以說明，但中央私人規則、個人協作設定與本機導覽資料不建立公開技術鏡像。
- **BMS Point Classification**：目前缺少可安全引用的公開 source，且可能涉及合作方與設備點位資料；在資料權利與公開邊界確認前，不建立技術頁。

MusicMatch、房價預測、ambient-ai 與 moonbase 已從正式知識同步 baseline 移除。本次不因掃描到舊目錄、歷史筆記或程式片段而自行重新納入，也不把它們列回目前代表專案。

## 已確認技術

- 十二個入口對應 `config/project-knowledge-sources.json` 的十二個策展來源；「列入來源」只代表可追蹤，不代表來源中的所有內容都適合公開。
- 每份技術文件會把狀態分成「已實作」、「既有文件記錄但本輪未重跑」與「規劃／尚未驗證」，避免把願景寫成現況。
- 文件採 WikiNB 的巢狀 slug、繁體中文 frontmatter 與時間軸命名，方便後續新增下一版而不覆蓋架構歷史。

## 系統與資料流

```text
專案 repository 的 README／handoff／必要程式碼與測試
                        ↓ 人工比對與公開性判斷
              Technical/<project>/<version>.md
                        ↓ WikiNB 靜態建置
                  公開技術閱讀頁
```

功能頁回答「做了什麼、為誰解決問題」；技術頁回答「如何做到、如何驗證、在哪裡執行」。兩者用 Wiki link 互相連結，但不建立第二份程式碼 source of truth。

## 關鍵決策

1. **功能與實作分層**：避免產品頁被大量工程細節淹沒，也讓技術沿革可以獨立版本化。
2. **依專案建立子資料夾**：同一專案後續有重大架構變更時，新增 `02_...`，保留第一版判斷背景。
3. **只公開可維護的抽象層**：公開元件責任、資料流、驗證方法與限制；不公開憑證、個資、私人規則或可識別本機環境的資料。
4. **證據強度直接寫入文件**：程式碼可確認、文件聲稱與未來規劃不混用相同語氣。

## 測試與驗證

- 每份技術頁列出來源專案既有的測試或品質閘門，並標示本次文件同步是否實際重跑。
- WikiNB 發布前的共同閘門是 Wiki link 檢查、repository 測試、靜態建置與 Markdown diff 檢查。
- 文件可證明「來源在何處、預期如何驗證」，不能取代平台上的部署狀態或跨平台實機測試。

## 部署與執行邊界

- `Technical/` 與其他 `wiki/` 筆記一樣屬於公開靜態內容；本身不會啟動後端、排程或重新部署來源專案。
- WikiNB 的 Pages 發布只代表這批 Markdown 已成為網站內容，不代表十二個來源專案都在同一時間重新建置或重新部署。
- 各專案若有獨立 Worker、本機服務、桌面封裝或其他部署線，必須依各自技術頁的邊界判讀。

## 已知限制

- 技術文件是 2026-08-17 的時間點快照；來源專案後續修改不會自動回寫。
- 部分來源是原型、課程成果或練習，不應因為有技術頁就被解讀為正式產品或線上服務。
- 跨專案掃描只能指出策展檔案的變化；未列入來源清單的程式碼仍可能影響實際行為，因此重大判斷要回到 repository 查證。

## 公開邊界

這個索引與其子頁可以公開：技術棧、元件分工、資料流、可重現的測試命令、部署形態與已知限制。以下內容不進入公開 WikiNB：Email、資料庫識別碼、密碼或 token、環境變數實值、私人 persona 原文、私人 Agent 規則、本機絕對路徑、未公開客戶／學校資料與第三方未授權素材。

## Source of truth

- `config/project-knowledge-sources.json`
- `wiki/AGENTS.md`
- `wiki/Projects/project-overview.md`
- `wiki/Technical/`

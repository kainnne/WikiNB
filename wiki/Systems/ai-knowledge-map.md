---
title: "AI 知識分類與閱讀地圖"
description: "整合模型、資料、Agent、工程、創作與教育應用，保留既有完整系列並補上知識缺口。"
type: note
status: active
tags: [AI, 知識管理, 閱讀地圖]
date: 2026-10-30
---

# AI 知識分類與閱讀地圖

> 本文由 AI 輔助自動化流程產製與更新。

這份地圖將既有文章按問題分類。先找目前需要理解的主題，再進入完整單元，不必把所有課程重新讀一次。它涵蓋目前知識庫的重要方向，沒有宣稱收錄所有 AI 概念。舊文的來源日期與實作狀態仍以各篇為準，本頁更新不代表全部內容都已重新查證。

## 分類與主要入口

| 分類 | 主要問題 | 完整內容 |
| --- | --- | --- |
| 模型與多模態 | 模型如何接收文字、圖像與聲音 | [[Learning/ai-systems-engineering/b05-llm-interface]]、[[Learning/ai-systems-engineering/az04-text-and-speech]]、[[Learning/ai-systems-engineering/az05-vision-and-extraction]] |
| Prompt、Context、Token | 這次任務到底拿到哪些資料 | [[Systems/context-and-evidence-design]]、[[Learning/ai-systems-engineering/n01-requests-and-history]] |
| 檢索與資料 | 如何找到來源、保存狀態並回答問題 | [[Learning/ai-systems-engineering/n11-retrieval-and-rag]]、[[Learning/ai-systems-engineering/b06-data-and-state]]、[[Systems/knowledge-persona-agent]] |
| Agent、Tool、MCP、Skills | 工作規則與執行能力如何分工 | [[Systems/skills-and-tool-boundaries]]、[[Learning/ai-systems-engineering/n02-tool-loop]]、[[Learning/ai-systems-engineering/n03-tool-contract-and-mcp]] |
| CLI 與桌面工作 | 如何在專案中持續執行並控制範圍 | [[Systems/codexrules-agent-system]]、[[Learning/ai-systems-engineering/n09-hermes-and-cli]]、[[Systems/safe-system-operations-with-agents]] |
| API、Schema 與自動化 | 如何讓資料與動作有可驗證契約 | [[Learning/ai-systems-engineering/b04-http-json-api]]、[[Learning/ai-systems-engineering/n04-workflow-and-parallelism]]、[[Learning/ai-systems-engineering/n08-persistent-agent]] |
| Git、Docker 與部署 | 如何保存版本、啟動服務與驗收交付 | [[Learning/ai-systems-engineering/b03-environment-and-git]]、[[Learning/ai-systems-engineering/n10-api-and-container]]、[[Learning/ai-systems-engineering/p04-deployment-and-gpu]] |
| 評估、資安與隱私 | 如何判斷結果及權限是否正確 | [[Learning/ai-systems-engineering/n13-evaluation-and-traces]]、[[Learning/ai-systems-engineering/n06-identity-and-approval]]、[[Learning/ai-systems-engineering/p07-security-and-operations]] |
| AI 影音與音樂 | 如何從生成素材走到可交付作品 | [[Projects/Creative/video-production-workflow]]、[[Learning/suno-studio-album-production]] |
| 教育與文件應用 | 如何把概念變成可嘗試、可驗收的工作 | [[Learning/kuse-ai-practical-course]]、[[Learning/ai-document-workflow-workshop]]、[[Systems/writing-style-quality-control]] |

## 閱讀路徑

從日常應用開始，可以先讀文稿驗收、Context 與 Skills 三篇。這條路線適合已經用過聊天工具，想理解為何同一個要求有時成功、有時失敗的讀者。讀完後應能分辨資料不足、規則模糊、工具不可用與驗收缺漏。

想自己做產品，接著讀 API、工具迴圈、RAG、權限與部署。[[Learning/ai-systems-engineering]] 保留 38 單元的完整順序。若要深入模型與實驗設計，改走 [[Learning/llm-research-course]]，不要把會使用產品等同於已理解模型研究。

創作工作則從作品目標往回選工具。影片系列處理腳本、分鏡、聲音及成品檢查。音樂系列處理版本選擇、編曲、混音與輸出。生成出一段素材只是中間成果，交付還要看整體一致性與來源使用條件。

## 本次新增與後續缺口

2026-10-30 新增三篇完整文章：Skills、工具與 MCP 的分工，AI 文稿的風格控制與事實驗收，Context 設計與長任務的證據管理。既有課程保持原位，不建立另一份同義內容庫。

後續優先補強三項專題。第一是 Schema 驗證與業務規則的差別，用完整輸入、錯誤案例及修正結果說明。第二是多模態讀取的失敗案例，分開圖表讀值、圖片定位與語音辨識。第三是排程寫入的可靠性，以去重、限額、斷線與重跑測試建立完整實作文章。這些是待補主題，不當成已完成內容。

## 維護方式

每次新增前，先查本地索引與文章標題。相同問題優先更新原頁，只有形成獨立問題才新增文章。涉及產品方案、API 或版本的說明，更新時回到官方文件核對，保留查證日期。實作範例清楚區分設計、模擬測試與真實環境結果。

個人知識庫只保留適合公開的方法、原創例子與公開來源。機構文件、學生資料和內部操作資訊不納入此地圖。

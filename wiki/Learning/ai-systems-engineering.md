---
title: AI 系統與產品工程：38 單元學習筆記
description: 從程式、API 與 Agent，學到 Azure、地端模型、部署和可驗收的系統交付。
type: learning
status: active
tags:
  - AI 系統工程
  - Agent
  - Azure
  - NVIDIA
  - 地端與部署
date: 2026-10-09
---

# AI 系統與產品工程：38 單元學習筆記

我想補的是把系統接起來的能力。看到 AI 應用時，能說明問題從哪裡進來、資料在哪裡、模型與工具各做什麼，以及誰有權執行。接著自己改一小段程式，測正常與失敗的情況，最後把它做成別人能使用的小產品。

這裡依目前的 38 單元課綱整理成可複習的筆記：B 系列 8 篇、N 系列 14 篇、Azure 6 篇、P 系列 10 篇。每篇有概念、例子和練習，課綱中的部署內容收在 N10 與 P04，不另加主單元。

筆記完成不代表課程已通過。例子使用虛構設備和測試資料；實際練習時，另外記錄是否獨立完成、使用了哪些提示，以及有哪些尚未驗證的地方。私人題庫仍在原本的私人學習入口，這組筆記不收錄題目或教材原文。

## 閱讀順序

先從 B01–B04 建立系統、程式、環境與 API 基礎；B08 的排錯與證據會一路用到後面。接著用 B05、N01–N03 練模型與工具，再補 B06–B07 的資料與網路。

之後接 Azure 六篇，將相同概念放到 Foundry 的輕量應用與 AI-901 學習範圍。再讀 N04–N06、N11，練流程、狀態、權限與檢索；從 N08–N10、N12–N14 整合成可啟動與測試的小系統。

地端部分從 P01–P05 起步，理解位置、硬體、執行堆疊、部署與量測。最後接 P08、N07、P07、P06、P09、P10，核對技術角色、隔離、事件和交付。每篇的前後連結沿用這條順序，單元編號則保持原課綱，沒有重新編號。

## 怎麼拿來上課

可以直接請 AI：「從 B02 開始教我。先連貫說明整個單元，再給兩到四題情境練習，先不要給答案。我作答後請針對缺口補講，再判斷能不能接下一篇。」

新名詞先附英文原名，讀程式時追一次完整輸入與回傳，不每講一小點就中斷測驗。需要外部操作時，再指定官方頁面、閱讀範圍、環境與預期結果。沒有真實服務或硬體，就先做概念與合成資料練習，不把 mock 寫成實測。

## B 系列：工程基礎

- [[Learning/ai-systems-engineering/b01-system-map]] — B01 AI 應用全貌與系統分工
- [[Learning/ai-systems-engineering/b02-python-reading]] — B02 Python 程式閱讀與修改
- [[Learning/ai-systems-engineering/b03-environment-and-git]] — B03 專案環境與版本
- [[Learning/ai-systems-engineering/b04-http-json-api]] — B04 HTTP、JSON、API、SDK、CLI
- [[Learning/ai-systems-engineering/b05-llm-interface]] — B05 LLM 應用介面
- [[Learning/ai-systems-engineering/b06-data-and-state]] — B06 資料儲存與狀態
- [[Learning/ai-systems-engineering/b07-network-and-process]] — B07 網路與程序
- [[Learning/ai-systems-engineering/b08-debug-and-evidence]] — B08 Debug、測試與證據

## N 系列：Agent 與服務

- [[Learning/ai-systems-engineering/n01-requests-and-history]] — N01 模型請求與歷史
- [[Learning/ai-systems-engineering/n02-tool-loop]] — N02 工具呼叫與執行迴圈
- [[Learning/ai-systems-engineering/n03-tool-contract-and-mcp]] — N03 工具契約與 MCP
- [[Learning/ai-systems-engineering/n04-workflow-and-parallelism]] — N04 工作流、相依與並行
- [[Learning/ai-systems-engineering/n05-endpoint-harness-session]] — N05 Endpoint、Harness、Gateway、Session
- [[Learning/ai-systems-engineering/n06-identity-and-approval]] — N06 身分、授權、護欄與核准
- [[Learning/ai-systems-engineering/n07-sandbox-boundary]] — N07 Sandbox 的實際邊界
- [[Learning/ai-systems-engineering/n08-persistent-agent]] — N08 常駐 Agent 與可靠性
- [[Learning/ai-systems-engineering/n09-hermes-and-cli]] — N09 Hermes、Harness 與 CLI
- [[Learning/ai-systems-engineering/n10-api-and-container]] — N10 API 服務與容器初步部署
- [[Learning/ai-systems-engineering/n11-retrieval-and-rag]] — N11 檢索與 Index Agent
- [[Learning/ai-systems-engineering/n12-task-branches]] — N12 Deep Agents 與多分支任務
- [[Learning/ai-systems-engineering/n13-evaluation-and-traces]] — N13 Agent 評估與可觀察性
- [[Learning/ai-systems-engineering/n14-integrated-agent]] — N14 自己建立完整 Agent

## Azure：平台、能力與 AI-901

- [[Learning/ai-systems-engineering/az01-azure-foundations]] — AZ01 平台與 Python 起步
- [[Learning/ai-systems-engineering/az02-foundry-chat-and-agent]] — AZ02 Foundry 聊天與單一 Agent
- [[Learning/ai-systems-engineering/az03-responsible-ai]] — AZ03 負責任 AI 與能力選擇
- [[Learning/ai-systems-engineering/az04-text-and-speech]] — AZ04 文字與語音
- [[Learning/ai-systems-engineering/az05-vision-and-extraction]] — AZ05 視覺、生成與資訊擷取
- [[Learning/ai-systems-engineering/az06-exam-and-practice-review]] — AZ06 考綱覆蓋與模擬驗收

## P 系列：地端、部署與整合

- [[Learning/ai-systems-engineering/p01-edge-local-cloud]] — P01 邊緣、地端、雲端與目的
- [[Learning/ai-systems-engineering/p02-hardware-and-memory]] — P02 硬體與模型載入
- [[Learning/ai-systems-engineering/p03-execution-stack]] — P03 軟體至裝置的執行堆疊
- [[Learning/ai-systems-engineering/p04-deployment-and-gpu]] — P04 部署、容器與網路深化
- [[Learning/ai-systems-engineering/p05-inference-performance]] — P05 推論加速與量測
- [[Learning/ai-systems-engineering/p06-vision-events]] — P06 影像與事件系統設計
- [[Learning/ai-systems-engineering/p07-security-and-operations]] — P07 資安與操作權限
- [[Learning/ai-systems-engineering/p08-nvidia-roles]] — P08 NVIDIA 技術與競賽整合
- [[Learning/ai-systems-engineering/p09-reliability-and-metrics]] — P09 效能、離線與可靠性
- [[Learning/ai-systems-engineering/p10-report-and-contribution]] — P10 完整報告與貢獻任務

## 一輪學習怎麼算完成

我需要能追一次完整資料流，修改並說明一處關鍵程式，從新的啟動步驟重現結果，再用正常與失敗案例支持自己的主張。最後交一個有實際用途的小任務，說明改善、限制與回復方式。

這份公開筆記整理的是我的學習範圍，不是第三方官方課程的逐字稿，也不是證照通過紀錄。框架、產品能力與考綱會變，實作前依各篇官方連結核對目前版本；遇到舊路徑轉址，以官方現行頁面為準。

## 相關筆記

- [[Learning/llm-research-course]] — 文字分類、LLM 方法與研究設計
- [[Learning/ai-first-frontend-foundations]] — 前端與產品介面的學習系列
- [Azure AI-901 私人學習](/private-study/) — 既有邀請制題庫入口

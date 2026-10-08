---
title: "N10 API 服務與容器初步部署"
description: "把小型 Agent 封裝成可呼叫的服務，完成 CPU 容器的基本部署。"
type: note
status: active
tags:
  - AI 系統工程
  - Agent
date: 2026-10-09
---

# N10 API 服務與容器初步部署

把 Python 函式包成 API，是讓其他程式依明確契約使用它。輸入驗證、身分與授權、錯誤回傳、逾時和日誌，都要放在服務流程裡，不是多加一個網址就完成部署。

先做 CPU 可運行的小服務。模型可以是受限測試替身或遠端端點；容器能啟動，不表示這台機器能載入大型地端模型。

## D01–D05 的實作順序

1. **API 封裝：**為查詢定義 route、輸入與回傳，測正常 ID 和無效輸入。長任務需另有任務狀態，不能無限占著同步請求。
2. **打包：**Dockerfile 描述建置，Image 是打包產物，Container 是依產物啟動的程序環境。[Docker 的 image 說明](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/)可先確認這組關係。
3. **設定與資料：**密鑰在啟動時注入，資料放在約定的持久位置。說明主機端口如何對應容器服務，以及重建後保留什麼。
4. **多服務：**API 與資料服務分開時，用 [Compose 的應用模型](https://docs.docker.com/compose/intro/compose-application-model/)理解服務、網路和 volume。開始啟動不等於已就緒。
5. **運作與回復：**查看 health、日誌和資源，測一次故障，再示範更新及回到已知可用版本。若資料 schema 改動，程式回復也必須配合資料策略。

## 練習

從新的啟動流程開始，由另一個用戶端呼叫 API，保留一次成功、一次錯輸入和一次拒絕的結果。停止再啟動後，確認必要資料仍在。

自我檢查：能說明 image、設定、模型和業務資料各放在哪裡，並從日誌追到請求真正執行的函式。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/n09-hermes-and-cli]] — 上一篇：N09
- [[Learning/ai-systems-engineering/n12-task-branches]] — 下一篇：N12

---
title: "B07 網路與程序"
description: "用 IP、port、DNS 與程序的位置解释服務之間如何連線。"
type: note
status: active
tags:
  - AI 系統工程
  - 工程基礎
date: 2026-10-09
---

# B07 網路與程序

「localhost 連不上」要先問：這句話是在哪個程序、哪個網路環境裡說的？筆電、遠端主機和容器看見的 localhost 不一定是同一個地方。

IP 指出網路位置，Port 用來找到該位置上的服務入口，DNS 把名稱解析成位址。Process 是運行中的程式；服務則是持續提供能力的角色。網址裡的名稱能解析，不代表端口有程序在監聽，也不代表程序能完成業務工作。

## 畫一條跨服務的連線

假設瀏覽器向本機 API 提問，API 再呼叫遠端模型。瀏覽器能打開頁面，只證明前端這一段可用；後端到模型的 DNS、身分與連線仍需另外檢查。

把 API 放進容器後，容器裡的 localhost 指向容器自己的網路環境。若資料庫是另一個容器，通常應依配置好的服務名稱與網路連線，而不是沿用主機的 localhost。實際可用名稱要看部署設定。

## 練習

畫出瀏覽器、API、資料庫、模型四個位置，在每條箭頭寫發起連線的程序、目標位址與端口。接著假設 API 活著但模型服務停了，說明應該查看哪一段紀錄。

自我檢查：分得出名稱解析失敗、沒有程序監聽、連線被拒絕和服務回傳錯誤。不為了排錯直接停止不相關的服務。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/b06-data-and-state]] — 上一篇：B06
- [[Learning/ai-systems-engineering/az01-azure-foundations]] — 下一篇：AZ01

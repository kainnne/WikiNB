---
title: "N03 工具契約與 MCP"
description: "把工具輸入、輸出、錯誤與副作用寫成契約，再理解 MCP 的角色。"
type: note
status: active
tags:
  - AI 系統工程
  - Agent
date: 2026-10-09
---

# N03 工具契約與 MCP

兩個工具都叫 get_device_status，不代表可以互換。回傳的溫度是攝氏還是華氏？找不到設備怎麼表示？它會不會順便更新資料？這些語意也要寫進契約。

Schema 描述格式，契約還包括範圍、單位、錯誤、資料時間、副作用和授權。直接函式呼叫適合一個程式內的能力；API 讓不同服務連線；MCP 則提供 AI 應用交換工具及上下文的共同介面。

MCP 裡的 Host 是使用能力的 AI 應用，Client 維持與 Server 的連線，Server 提供工具或其他能力。Server 可以呼叫自己的函式，也可以再呼叫既有 API，不必就是資料庫本身。[官方架構](https://modelcontextprotocol.io/docs/learn/architecture)說明了這些角色。

## 換資料來源，保留哪些東西

先讓工具讀固定 dict，再換成 JSON 檔，最後換成測試 API。若輸出契約一致，呼叫端可以少改一些程式；但檔案和 API 的失敗原因不同，要分別處理。

MCP 讓工具更容易被相容應用使用，不代表任何訪客都有權使用。應用或服務端仍要依可信身分執行授權檢查。

## 練習

為設備查詢寫出 ID 格式、溫度單位、查無資料、逾時與資料時間。再說明資料來源換掉後，哪些測試要保留，哪些需要增加。

自我檢查：能區分格式相容與語意相容，也能追出 Host、Client、Server 到真正資料來源的路徑。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/n02-tool-loop]] — 上一篇：N02
- [[Learning/ai-systems-engineering/b06-data-and-state]] — 下一篇：B06

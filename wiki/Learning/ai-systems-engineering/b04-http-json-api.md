---
title: "B04 HTTP、JSON、API、SDK、CLI"
description: "追出 HTTP 請求、JSON 資料與 SDK 的分工，區分常見失敗。"
type: note
status: active
tags:
  - AI 系統工程
  - 工程基礎
date: 2026-10-09
---

# B04 HTTP、JSON、API、SDK、CLI

API 是程式之間約定的介面。用戶端向哪個 URL 送資料、資料格式是什麼、成功與失敗怎麼回，都是契約的一部分。HTTP 提供請求與回應的交換方式，JSON 則是一種表達資料的文字格式。

Request 包含方法、位址、標頭與必要的本文。Response 包含狀態碼與回傳內容。SDK 把部分組合請求、序列化、讀取回應的工作包成函式；CLI 則讓人從命令列使用功能。包裝不同，後面的服務仍可能是同一個。

## 不要把所有失敗叫成 AI 出錯

設備查詢可約定這樣回傳：

```json
{"device_id": "A-17", "found": true, "temperature_c": 82}
```

解析失敗代表內容不是預期的 JSON；缺欄位代表格式可讀，但不符合應用契約；Timeout 代表在限定時間內沒拿到完整回應。收到成功狀態碼也仍要檢查必要欄位，不能只看 HTTP 200。

HTTP 404 可以表示路由不存在，也可能被應用用來表示設備不存在，要依 API 契約判斷。若程式以成功回應配上 `found: false` 表達查無紀錄，也可以成立；同一套服務要保持一致。

## 練習

準備正常、缺溫度、壞 JSON 三份合成回應，逐一說明解析與判斷在哪一層失敗。再把一次 SDK 呼叫畫回「建立請求→驗證身分→送出→讀取回應」的過程。

自我檢查：能指出重試可能解決哪種問題，也知道格式錯誤、權限拒絕與查無資料不該全部盲目重試。

## 官方閱讀

- [MDN：HTTP overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/b03-environment-and-git]] — 上一篇：B03
- [[Learning/ai-systems-engineering/b08-debug-and-evidence]] — 下一篇：B08

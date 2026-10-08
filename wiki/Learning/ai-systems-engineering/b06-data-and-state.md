---
title: "B06 資料儲存與狀態"
description: "分清暫存狀態、聊天上下文與需要永久保存的業務紀錄。"
type: note
status: active
tags:
  - AI 系統工程
  - 工程基礎
date: 2026-10-09
---

# B06 資料儲存與狀態

重啟程式後，哪些資料應該還在？這是選儲存方式時的第一個問題。記憶體適合短暫狀態，檔案或資料庫負責需要留下來的內容，兩者不會自動同步。

Database 保存可查詢的紀錄。Primary key 用來識別一筆資料；關聯讓不同表的紀錄對上；Transaction 把必須一起成功的修改包成一次操作。Index 幫助某些查詢，但也有維護成本，不是加得越多越好。

聊天上下文通常只挑一部分內容送給模型；業務紀錄則需要以明確欄位保存。使用者說「剛才已核准」，不能直接覆蓋資料庫的待核准狀態。權威來源和方便對話的內容要分開。

## 從 SQLite 起步

可先做 `devices` 和 `proposals` 兩張表：前者保存設備與量測，後者保存修改提議、提出時間及目前狀態。SQLite 可以在不另開資料庫服務的情況下練習這些概念。執行修改後確認交易已提交，再關閉、重開並查回。

查詢參數使用參數綁定，不把使用者輸入直接接進 SQL。資料表改版時，Migration 要交代既有紀錄如何保留，而不是刪表後假裝完成更新。

## 練習

先存一筆假設備狀態，重新啟動後查回。再讓提議從 pending 轉為 approved，說明哪個欄位識別原提議、誰可以改，以及兩人同時核准時如何避免重複執行。

自我檢查：能指出資料在哪裡、何時保存、哪份資料有權決定後續動作，以及重啟會失去哪些暫存內容。

## 官方閱讀

- [Python：sqlite3](https://docs.python.org/3/library/sqlite3.html)

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/n03-tool-contract-and-mcp]] — 上一篇：N03
- [[Learning/ai-systems-engineering/b07-network-and-process]] — 下一篇：B07

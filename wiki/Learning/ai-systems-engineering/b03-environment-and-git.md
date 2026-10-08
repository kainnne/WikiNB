---
title: "B03 專案環境與版本"
description: "把程式、依賴、設定與版本分開，讓小專案能重現。"
type: note
status: active
tags:
  - AI 系統工程
  - 工程基礎
date: 2026-10-09
---

# B03 專案環境與版本

同一份程式在另一台電腦不能跑，常常不是演算法壞了，而是少了套件、版本不同或啟動位置不對。專案環境就是把這些條件說清楚。

Source code 是自己寫的程式，Dependency 是它需要的外部套件，SDK 是某項服務提供的開發介面。Virtual environment 把 Python 套件限制在專案自己的環境裡，減少不同專案互相干擾。模組則是程式的組織方式，不等於另一個服務。

設定值也要分開。可公開的範例設定可以跟程式一起保存；密鑰與真實帳號資料由環境或秘密管理機制注入。把密鑰搬到 `.env` 只改了保存位置，仍要確認它不會進入 Git 或輸出紀錄。

## 做一個能重現的練習資料夾

把設備查詢程式放進自己的資料夾，記錄 Python 版本、啟動指令和輸入範例。標準函式庫已足夠時，不需要為了看起來完整而新增套件。

接著改一個門檻，查看 `git diff`：應該只有預期的一行變化。如果同時冒出大量格式修改或私人檔案，先處理原因。Diff 能證明「改了哪些文字」，不能證明改動正確；執行結果與測試是另一份證據。

## 練習

從新開的終端啟動程式，說明目前目錄與執行檔的關係。再用 diff 找出自己的修改，將那一處恢復後重跑。練習到這裡即可，不需要自動 commit 或 push。

自我檢查：另一個人能依你的版本、依賴與啟動說明得到同樣的結果，不必猜測你電腦上的隱藏設定。

## 官方閱讀

- [Python：Virtual Environments](https://docs.python.org/3/tutorial/venv.html)

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/b02-python-reading]] — 上一篇：B02
- [[Learning/ai-systems-engineering/b04-http-json-api]] — 下一篇：B04

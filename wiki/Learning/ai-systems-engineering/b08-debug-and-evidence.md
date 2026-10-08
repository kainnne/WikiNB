---
title: "B08 Debug、測試與證據"
description: "從重現條件與 traceback 找出原因，用測試證明修正。"
type: note
status: active
tags:
  - AI 系統工程
  - 工程基礎
date: 2026-10-09
---

# B08 Debug、測試與證據

Debug 的目的不是讓錯誤訊息消失，而是找出哪個假設不成立。先留下輸入、環境、預期結果與實際結果，才能知道改動是否修到同一個問題。

Traceback 告訴你呼叫經過哪些地方，最後在哪裡出錯。最底下的例外名稱是線索，但原因可能來自更早的輸入或設定。Log 則應記重要事件與識別碼，不需要把密鑰、完整文件和每個變數都印出來。

Unit test 檢查小範圍邏輯，Integration test 檢查元件之間能否配合。單元測試全通過，仍可能因端點或授權配置錯誤而無法提供服務。

## 從缺欄位案例開始

設備查詢在缺少 `temperature_c` 時出現 KeyError。先用固定假資料重現，再決定缺欄位應回明確錯誤，還是允許某個有來源的預設值。不能為了避免例外直接填 0，讓後面判斷設備正常。

修正後，原本的失敗輸入應得到約定回應；正常輸入也應維持正確。這兩筆測試比一張成功執行的截圖更能說明改動。

## 練習

寫下「給定輸入→預期結果→實際結果→原因→修改→重新確認」。再選一個相近但不同的失敗案例，檢查修正有沒有把它混進正常分支。

自我檢查：能把證據連回具體主張。Mock 可證明某段程式邏輯，不等於已驗證真實 API、資料庫或 GPU。

## 官方閱讀

- [Python：Errors and Exceptions](https://docs.python.org/3/tutorial/errors.html)

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/b04-http-json-api]] — 上一篇：B04
- [[Learning/ai-systems-engineering/b05-llm-interface]] — 下一篇：B05

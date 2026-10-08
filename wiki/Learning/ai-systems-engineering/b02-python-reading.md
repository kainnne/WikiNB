---
title: "B02 Python 程式閱讀與修改"
description: "用一個設備查詢函式練習 dict、分支、參數與 return。"
type: note
status: active
tags:
  - AI 系統工程
  - 工程基礎
date: 2026-10-09
---

# B02 Python 程式閱讀與修改

讀程式時先追資料，不先逐行背語法。輸入是什麼？它經過哪些判斷？最後交回哪個結果？這三件事清楚後，再看函式怎麼拆。

Python 的 `dict` 用鍵對應值，`list` 保存一串項目。函式參數讓同一段邏輯接收不同資料；`return` 把結果交回呼叫處，`print` 只是顯示文字。兩者不能互相代替。

## 一段可直接閱讀的範例

下列資料是虛構的，只在記憶體裡，沒有模型、API 或資料庫。

```python
records = {
    "A-17": {"temperature_c": 82},
    "A-18": {"temperature_c": 70},
}

def get_status(device_id, warning_limit=80):
    if device_id not in records:
        return {"found": False, "reason": "device_not_found"}
    record = records[device_id]
    if "temperature_c" not in record:
        return {"found": True, "reason": "missing_temperature"}
    temperature = record["temperature_c"]
    return {
        "found": True,
        "temperature_c": temperature,
        "warning": temperature >= warning_limit,
    }

for device_id in ["A-17", "A-18", "A-99"]:
    print(device_id, get_status(device_id))
```

`if` 決定這一次走哪條路。`return` 結束目前這次函式呼叫，不會因此停止後面的 `for` 迴圈。主程式仍會拿下一個 ID 再呼叫函式。縮排則決定程式屬於哪個區塊，不是裝飾。

查無設備與缺少溫度欄位分開回傳，是為了讓後續程式知道問題在哪裡。若全部只回 `None`，呼叫端就得猜是哪種情況。

## 練習

先不執行，寫出三次呼叫會走的分支。再把門檻改成 85，預測哪個結果會變；最後刪除 A-18 的溫度欄位，說明它為什麼不是查無設備。

自我檢查：能預測結果、只改必要的一處，並說明改動如何影響資料流。請 AI 幫忙時，也要自己確認這三件事。

## 官方閱讀

- [Python：Control Flow](https://docs.python.org/3/tutorial/controlflow.html)

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/b01-system-map]] — 上一篇：B01
- [[Learning/ai-systems-engineering/b03-environment-and-git]] — 下一篇：B03

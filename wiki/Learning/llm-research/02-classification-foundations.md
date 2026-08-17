---
title: 單元二：分類與機器學習基本語言
description: 建立 sample、feature、label、training、inference、loss 與 generalization 的共同概念。
type: note
status: active
tags:
  - Machine Learning
  - Classification
  - Supervised Learning
date: 2026-08-17
updated: 2026-08-17
---

# 單元二：分類與機器學習基本語言

## 模型在學什麼？

監督式學習從「輸入與正確答案」範例中學習規則。以虛構客服分類為例：

| 名稱 | 意義 |
| --- | --- |
| sample | 一則訊息 |
| feature | 原始文字或由文字產生的數值表示 |
| label | 該訊息的正確類別 |
| class | 所有可能答案中的一個選項 |
| model | 從 feature 預測 class 的函數 |

```text
有標籤資料 → fit／training → 已訓練模型
新資料     → predict／inference → 預測標籤
```

## Parameter 與 Hyperparameter

Parameter 是模型從資料學到的數值，例如每個文字特徵的權重或神經網路 weights。

Hyperparameter 是研究者設定或搜尋的選項，例如 n-gram 範圍、regularization、learning rate、batch size 與 epochs。

調 hyperparameter 也在使用資料，因此只能依 training／validation 決定，不能依 test answers 調整。

## Multiclass、Multi-label 與 Multi-task

- **Multiclass**：多個互斥類別中選一個。
- **Multi-label**：同一筆資料可以同時有多個標籤。
- **Multi-task**：shared model 同時學習多個相關任務，再由不同 heads 輸出。

Multi-task 的假設是任務共享資訊，但若任務難度與資料量差異很大，也可能互相干擾。

## Loss 與 Metric 不同

Loss 是訓練時更新參數的訊號，例如 cross-entropy。Metric 是研究者判斷結果的標準，例如 Macro-F1。

Training loss 下降不代表指定 metric 一定上升，也不代表新資料表現改善。

## Underfitting、Overfitting、Generalization

- **Underfitting**：模型連訓練資料的重要規律都沒學好。
- **Overfitting**：模型記住雜訊或偶然模式，換新資料便失敗。
- **Generalization**：模型學到能套用到未見資料的規律。

研究關心的是 generalization，不是 training set 記憶力。

## 模型不是查表

查表只會問「完全相同的輸入出現過嗎？」分類模型則嘗試學習「哪些模式使輸入更像某個類別」。不同模型只是以不同方式定義與學習相似性。

## Teach-back

1. Parameter 與 hyperparameter 各舉一例。
2. Training 與 inference 的資料角色有何不同？
3. Multiclass 和 multi-label 有何不同？
4. 為什麼 loss 下降不能直接證明模型更好？
5. 用虛構例子說明 overfitting。

## 導覽

- 上一篇：[[Learning/llm-research/01-research-problem-and-value]]
- 回到：[[Learning/llm-research-course]]
- 下一篇：[[Learning/llm-research/03-text-representation]]

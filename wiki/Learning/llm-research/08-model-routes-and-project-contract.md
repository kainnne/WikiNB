---
title: 單元八：模型路線選擇與 Project Contract
description: 比較效率模型、encoder、生成式 LLM 與 hybrid 路線，收斂成可執行的研究設計。
type: note
status: active
tags:
  - Model Selection
  - LLM
  - Project Contract
  - Experiment Design
date: 2026-08-17
updated: 2026-08-17
---

# 單元八：模型路線選擇與 Project Contract

模型選擇不是找最響亮的名字，而是選出最能回答 research question、且資料、成本與重現性都合理的方法。

## 路線 A：效率 Baseline

```text
raw／normalized text
    → word + character TF-IDF
    → LinearSVC／Logistic Regression
    → class prediction
```

優勢是 CPU 可執行、快速、容易解釋與 ablation；風險是語意泛化有限。它是必要基準，不是低階備案。

## 路線 B：Pretrained Encoder

```text
text → tokenizer → pretrained encoder → classification head
```

它能測試 learned representation 是否超過 explicit text fragments。優勢是直接適配分類；風險是 GPU、tuning、tokenizer mismatch 與 pretrained weights 的規則問題。

候選家族應透過小型 pilot 選擇，不能只靠模型名氣。

## 路線 C：Generative LLM

可能包含 zero-shot、few-shot、open-weight fine-tuning、Train-only retrieval 與 constrained generation。

它適合研究通用語言知識與 label reasoning，但有格式、成本、延遲、資料治理與重現性風險。因此可作比較題，不因熱門便預設為主線。

## 路線 D：Hybrid

可組合 sparse model、encoder、規則、retrieval 或 confidence-aware fallback。Hybrid 的價值來自錯誤互補；開始前應先證明單一路線具有不同錯誤型態，再逐項 ablation。

## 建議證據順序

1. 建立固定、leakage-safe validation。
2. 完成 Route A，得到可信 baseline。
3. 用 error analysis 找出具體失敗模式。
4. 規則允許後，用 Route B 測試 pretrained representation。
5. 比較分數、穩定性、成本與錯誤型態。
6. 只有證據支持時才加入 Route C 或 D。

## 決策維度

| 維度 | 問題 |
| --- | --- |
| Validity | 是否遵守資料與模型規則？ |
| Performance | Primary metric 與 per-class 表現如何？ |
| Stability | 換 folds／seeds 是否仍成立？ |
| Rare classes | 改善是否只來自常見類別？ |
| Cost | 訓練、推論、記憶體與模型大小？ |
| Reproducibility | 他人能否取得 weights、code 與設定？ |
| Explainability | Ablation 能否說明提升來源？ |
| Research value | 是否回答可反駁且有意義的問題？ |

## Project Contract

正式實作前，先完成：

```text
Problem:
Primary research question:
Hypotheses:
Allowed data and tools:
Forbidden data and tools:
Primary metric:
Validation protocol:
Baseline:
Main model route:
Comparison route:
Ablations:
Error analyses:
Reproducibility records:
Test-use policy:
Success criteria:
Stop or pivot criteria:
Open questions requiring approval:
```

## 開工前自我檢查

1. 為什麼這是 classification，而不必然是 generation？
2. 為什麼 Route A 必須先做？
3. 什麼證據會讓你選 Route B？
4. 哪些情況下 Route C 值得加入？
5. 哪些操作只能 fit 在 training folds？
6. 如何判斷提升不是 seed、split 或 leaderboard 偶然？
7. 如果 LLM 沒有贏，研究還能得到什麼結論？
8. Primary question 是什麼，哪些事情明確不做？

## Teach-back

選出一條主線與一條比較線，說明選擇理由、失敗機制、公平比較方式、成功條件、停止條件，以及它如何形成論文證據。

## 導覽

- 上一篇：[[Learning/llm-research/07-research-design-and-paper-literacy]]
- 回到：[[Learning/llm-research-course]]

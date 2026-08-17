---
title: 單元七：研究設計、Ablation 與論文常識
description: 從研究問題、baseline 與公平比較，建立可重現、可反駁並能寫入論文的實驗流程。
type: note
status: active
tags:
  - Research Design
  - Baseline
  - Ablation
  - Reproducibility
date: 2026-08-17
updated: 2026-08-17
---

# 單元七：研究設計、Ablation 與論文常識

跑出一個分數是工程事件；設計一組能回答問題的比較，才是研究。

## Baseline

Baseline 回答：「如果不使用新方法，合理的簡單方法能做到什麼？」它應符合任務、可重現、使用相同資料與 metric，而且不能故意調得很差。

## Control 與 Fair Comparison

除了研究變因，其他條件應盡量相同：

- 相同 split／folds
- 相同 input information
- 相同 metric
- 相同 seeds 或合理重複
- 相同資料邊界
- 透明的 tuning budget

若方法 A 使用額外資料與 ensemble，方法 B 只用原始文字，分數差不能只歸因於模型架構。

## Ablation Study

Ablation 逐一移除或替換元件，確認改善來自哪裡：

```text
Full system
- normalization
- word features
- class weighting
- post-processing
```

一次加入所有元件，只能知道整包有沒有變好，不能知道原因。

## Random Seed 與 Uncertainty

Neural training、sampling 與 split 都可能受 seed 影響。應保存每個 run／fold、平均表現與變異，並區分 best run 和 expected performance。

分數差還要看 practical significance：大型方法若只提升一點，但成本增加很多，是否值得取決於研究與部署目的。

## Reproducibility

至少保存：

- data version／hash
- preprocessing code
- split indices
- model identifier
- hyperparameters
- random seeds
- package versions
- hardware
- commands、metrics 與 artifacts

## Negative Result

以下都可能有價值：

- 大型 encoder 沒有穩定超過 sparse baseline。
- Normalization 移除有用訊號，反而下降。
- Multi-task 只幫助某個任務，卻傷害另一個任務。
- LLM zero-shot 能解釋概念，但 rare-class 表現不佳。

前提是比較公平、調整合理、分析充分。

## LLM 應用論文的常見結構

1. Introduction：問題、缺口、貢獻。
2. Related Work：既有方法與未解決處。
3. Task／Data：來源、標籤、split、倫理與限制。
4. Method：representation、模型、training 與 inference。
5. Experiments：baselines、metrics、設定與資源。
6. Results：主要表格與統計。
7. Ablations／Analysis：元件、稀有類別與錯誤案例。
8. Limitations：不能宣稱的部分與部署風險。
9. Conclusion：回答 research question。

## 貢獻類型

- Method contribution
- Evaluation contribution
- Empirical contribution
- System contribution
- Domain contribution

不必每篇都同時具備，但必須清楚自己貢獻在哪裡。

## Threats to Validity

主動檢查資料代表性、label noise、split 合理性、tuning 公平性、外部模型重現性與結論推廣範圍。揭露限制不是削弱論文，而是界定可信範圍。

## Teach-back

1. Baseline、control 與 ablation 有何不同？
2. 為什麼 best run 不能取代多次實驗？
3. 大型模型只高一點時，還要比較哪些資訊？
4. 簡單模型勝出時，如何寫成研究結果？
5. 提出一個 research question、hypothesis 與對應實驗。

## 導覽

- 上一篇：[[Learning/llm-research/06-evaluation-and-leakage]]
- 回到：[[Learning/llm-research-course]]
- 下一篇：[[Learning/llm-research/08-model-routes-and-project-contract]]

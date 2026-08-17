---
title: 單元六：評估、Macro-F1 與 Data Leakage
description: 學會資料切分、群組泛化、稀有類別評估，以及 preprocessing 與 leaderboard leakage。
type: note
status: active
tags:
  - Evaluation
  - Macro-F1
  - Data Leakage
  - Cross-validation
date: 2026-08-17
updated: 2026-08-17
---

# 單元六：評估、Macro-F1 與 Data Leakage

研究最危險的錯誤常不是程式跑不動，而是評估流程讓模型提前接觸不該知道的資訊。錯誤 split 能讓普通方法看起來像突破。

## Train、Validation、Test

- **Training set**：fit 模型參數與 preprocessing。
- **Validation set**：選 hyperparameters、比較方法、決定停止時機。
- **Test set**：方法凍結後才做最終評估。

如果看完 test 結果又繼續改模型，test 就逐漸被當成 validation。

## Holdout、Cross-validation、Group Split

Holdout 只切一次，簡單但可能受偶然分配影響。K-fold cross-validation 輪流驗證不同 folds，可觀察分數變異。

若資料有群組結構，例如同一使用者、來源組織或內容模板，group split 能避免同群模式同時出現在 training 與 validation。

## Accuracy、Precision、Recall、F1

當類別不平衡時，永遠猜常見類別也可能得到高 accuracy。

- Precision：預測成某類的樣本中，有多少是真的？
- Recall：真正屬於某類的樣本中，有多少被找到？
- F1：precision 與 recall 的 harmonic mean。
- Macro-F1：先對每個 class 算 F1，再平均，讓稀有類別也有相同權重。

## Preprocessing 也會 Leakage

錯誤做法：用全部資料 fit TF-IDF vocabulary，再做 cross-validation。

即使未使用 labels，validation 的文字分布已影響 vocabulary 或 document frequency。正確方式是：

```text
training fold → fit vectorizer → fit classifier
validation fold → transform only → predict
```

同樣原則適用 tokenizer adaptation、feature selection、resampling、imputation 與 dimensionality reduction。

## 常見 Leakage

- 全資料 fit vectorizer／tokenizer。
- Split 前做 oversampling。
- 近重複樣本跨 folds。
- 使用 test distribution 決定 preprocessing。
- 把 test predictions 當 pseudo-label 回訓。
- 根據 leaderboard 回饋大量調參。
- 使用含答案的 lookup table。

## Leaderboard Overfitting

每次 submission 回傳一個分數訊號。反覆嘗試足夠多次後，研究者可能逐漸適應公開評估子集的偶然特性。Leaderboard 應作低頻 sanity check，而不是 hyperparameter optimizer。

## Group ID 不可得時

不能為了得到理想 split 而使用不合法來源補回 IDs。合理做法是使用可重現的 Train-only split、多個 seeds／folds、近重複檢查，並誠實說明 local validation 無法支持哪些泛化宣稱。

## Error Analysis

總分只說「多少」，error analysis 才問「為什麼」。可觀察：

- per-class precision／recall／F1
- confusion pairs
- rare-class support
- 缺值與不同文字形式
- 高信心錯誤
- 不同群組或資料來源的表現

## Teach-back

1. Validation 與 test 的角色為何不同？
2. Macro-F1 為什麼重視 rare classes？
3. TF-IDF 沒使用 labels，為何仍可能 leakage？
4. Leaderboard score 上升為何不保證泛化變好？
5. 缺少 group IDs 時，哪些結論不能宣稱？

## 導覽

- 上一篇：[[Learning/llm-research/05-llm-application-patterns]]
- 回到：[[Learning/llm-research-course]]
- 下一篇：[[Learning/llm-research/07-research-design-and-paper-literacy]]

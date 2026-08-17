---
title: 單元三：文字表示——從 N-gram、TF-IDF 到 Embedding
description: 理解電腦如何把文字轉成 sparse features、tokens 與 dense vectors。
type: note
status: active
tags:
  - NLP
  - TF-IDF
  - Tokenization
  - Embedding
date: 2026-08-17
updated: 2026-08-17
---

# 單元三：文字表示——從 N-gram、TF-IDF 到 Embedding

模型不能直接使用人類語意，必須先把文字轉成數值。表示方法決定哪些訊號容易被模型看見。

以下使用虛構字串：

```text
ORDER_REFUND_PENDING
```

## Normalization

常見處理包括統一大小寫、處理分隔符、拆開連寫文字與補上缺值。但「清得越多越好」是錯的；數字、標點與位置有時是分類訊號。每種處理都應視為待驗證假設。

## Word N-gram

先切出詞，再使用單詞或相鄰詞組：

```text
order | refund | pending
```

它容易對應人類可理解的詞，但拼字變形、縮寫或不穩定分隔會影響 tokenization。

## Character N-gram

直接取連續字元片段，例如 `refund` 周圍的 3 至 5 字元組合。它不必先知道正確詞界，因此常能處理拼字差異、縮寫、連字號或底線。

## TF-IDF

TF-IDF 結合兩個直覺：

1. 某片段是否在這筆文字中出現？
2. 它在整個 corpus 中是否太常見，因而缺乏區別力？

TF-IDF 產生高維 sparse vector，大部分位置為零。LinearSVC、Logistic Regression 等線性模型很適合這種 representation。

## Token 與 Tokenizer

Transformer tokenizer 會把文字切成 token IDs。Subword tokenizer 能把少見詞拆成較小片段，但通用 tokenizer 不一定適合每個專業領域。

Tokenizer 不是中性步驟；它決定模型看到的基本單位，也可能造成 domain mismatch。

## Embedding

Embedding 是 dense vector，希望把使用情境或語意相近的文字放在向量空間的相近位置。它可用於相似度、clustering、retrieval 或接 shallow classifier。

但 embedding 相近只表示模型認為它們相似，不代表相似原因符合研究需求，也不保證專業縮寫被正確理解。

## Sparse 與 Dense

| 面向 | TF-IDF Sparse | Encoder Embedding |
| --- | --- | --- |
| 主要訊號 | 明確字元／詞片段 | learned representation |
| 成本 | 低 | 中至高 |
| 可解釋性 | 較高 | 較低 |
| 語意泛化 | 有限 | 潛力較高 |
| 領域適配 | 可直接從任務資料建立 vocabulary | 取決於 tokenizer 與 pretraining |

誰比較好不能只靠表格決定，必須使用相同 validation protocol 實驗。

## Teach-back

1. Character n-gram 為何不需要正確詞界？
2. TF-IDF 為什麼是 sparse representation？
3. Tokenizer 如何影響 encoder？
4. Embedding 相近代表什麼，又不代表什麼？
5. 提出一個 normalization ablation。

## 導覽

- 上一篇：[[Learning/llm-research/02-classification-foundations]]
- 回到：[[Learning/llm-research-course]]
- 下一篇：[[Learning/llm-research/04-language-model-ecosystem]]

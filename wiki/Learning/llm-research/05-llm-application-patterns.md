---
title: 單元五：LLM 應用方法——Prompting、Fine-tuning、LoRA、RAG
description: 釐清使用 LLM 的不同方式、資料流、學習範圍與適用研究問題。
type: note
status: active
tags:
  - LLM
  - Prompting
  - Fine-tuning
  - LoRA
  - RAG
date: 2026-08-17
updated: 2026-08-17
---

# 單元五：LLM 應用方法——Prompting、Fine-tuning、LoRA、RAG

「使用 LLM」不是單一做法。研究者必須說清楚：模型看了哪些資料、哪些參數被更新、推論時需要什麼，以及答案如何被限制。

## Zero-shot Prompting

只提供任務與 label definitions，不提供示範。它測試通用知識與 instruction following，適合快速 baseline，但對 prompt wording 與模型版本敏感。

## Few-shot／In-context Learning

在 prompt 放少量輸入與答案範例。Weights 沒有更新，學習只發生在當次 context。研究時要記錄範例如何選、順序是否影響結果，以及各類別是否公平出現。

## Embedding + Classifier

先用 frozen embedding model 產生向量，再用任務 training data 訓練 shallow classifier：

```text
text → embedding model → vector → classifier → label
```

它把 representation 與 decision boundary 分開，通常比逐筆生成便宜。

## Full Fine-tuning

使用任務資料更新基礎模型的大部分或全部 weights。任務適應力高，但需要更多記憶體、訓練管理與 overfitting 控制。

## LoRA

LoRA 加入低秩可訓練 adapters，基礎 weights 保持固定。它能降低記憶體需求並保存較小的任務 adapter，但不會自動解決資料品質、錯誤切分或不適合的 metric。

## RAG

Retrieval-Augmented Generation 先檢索相關資料，再把結果放入 prompt：

```text
query → retrieve → compose context → LLM → answer
```

研究者必須確認 retrieval corpus 是否合法、相似度模型如何驗證，以及提升來自 retrieval 還是 generation。

## Constrained Output

固定標籤任務可使用 candidate list、JSON schema、grammar-constrained decoding 或合法標籤映射。後處理也是方法的一部分，必須記錄並做 ablation。

## Agent Workflow

Agent 讓模型分步使用檢索、規則、計算器或驗證器。系統可能更可靠，也更難歸因。若每一步都由黑箱 LLM 判斷，就不能把另一個 LLM 當成唯一獨立驗證。

## 方法比較

| 方法 | 更新 weights | 主要優點 | 主要風險 |
| --- | --- | --- | --- |
| Zero-shot | 否 | 快速 | prompt 與格式敏感 |
| Few-shot | 否 | 提供任務示範 | 範例選擇偏差 |
| Embedding + classifier | 只更新 classifier | 便宜、穩定 | representation 可能不合 domain |
| Full fine-tuning | 是 | 任務適應力高 | 資源與 overfitting |
| LoRA | 更新 adapters | 訓練較省 | 工程仍較複雜 |
| RAG | 通常否 | 可提供外部 context | retrieval leakage／延遲 |
| Agent | 視設計而定 | 結合工具與規則 | 難歸因、難重現 |

## Teach-back

1. Fine-tuning 和 few-shot 的學習發生在哪裡？
2. LoRA 節省了什麼，又沒有解決什麼？
3. RAG 為什麼不是 training？它仍可能如何 leakage？
4. 一個 LLM agent 的提升要怎麼做 ablation？
5. 任選一種方法，說明資料流與主要風險。

## 導覽

- 上一篇：[[Learning/llm-research/04-language-model-ecosystem]]
- 回到：[[Learning/llm-research-course]]
- 下一篇：[[Learning/llm-research/06-evaluation-and-leakage]]

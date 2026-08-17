---
title: 文字分類與 LLM 應用研究：由基礎到研究設計
description: 循序理解文字表示、語言模型、評估方法與可重現研究設計的學習合輯。
type: learning
status: active
tags:
  - LLM
  - Machine Learning
  - 文字分類
  - 研究方法
date: 2026-08-17
updated: 2026-08-17
---

# 文字分類與 LLM 應用研究：由基礎到研究設計

這套合輯寫給對研究有興趣、但還沒有完整模型生態概念的學習者。它不要求先熟悉深度學習，也不把熱門模型名稱當成答案；目標是建立足以閱讀研究、判斷方法與設計實驗的共同語言。

課程以客服訊息、文件路由與內容標記等**虛構或公開通用案例**說明。案例不對應任何進行中研究的資料、欄位、標籤、規模或切分方式。

## 怎麼使用這套合輯

這是進度制教材。每篇末尾都有 teach-back；當你能用自己的話說明，而不是只認得名詞時，再進入下一篇。

閱讀時可以向 AI 提出：

- 「換成生活化的例子。」
- 「不要比喻，改用技術語言。」
- 「考我這一單元，先不要公布答案。」
- 「我來 teach-back，請指出錯誤。」
- 「比較兩條方法的研究價值。」

## 課程地圖

1. [[Learning/llm-research/01-research-problem-and-value]] — 從應用需求建立可驗證的研究問題。
2. [[Learning/llm-research/02-classification-foundations]] — 建立分類、訓練與泛化的基本語言。
3. [[Learning/llm-research/03-text-representation]] — 理解 n-gram、TF-IDF、token 與 embedding。
4. [[Learning/llm-research/04-language-model-ecosystem]] — 分清 encoder、decoder 與 ChatGPT 的角色。
5. [[Learning/llm-research/05-llm-application-patterns]] — 比較 prompting、fine-tuning、LoRA、RAG 與 agent。
6. [[Learning/llm-research/06-evaluation-and-leakage]] — 學會資料切分、Macro-F1 與 data leakage。
7. [[Learning/llm-research/07-research-design-and-paper-literacy]] — 建立 baseline、ablation 與論文常識。
8. [[Learning/llm-research/08-model-routes-and-project-contract]] — 比較模型路線並完成研究契約。

## 完成後應具備的能力

- 說明一項文字分類研究的輸入、輸出、評估與限制。
- 不再把所有 language model 都等同於 ChatGPT。
- 判斷 preprocessing、training 與 validation 是否發生 leakage。
- 看懂 baseline、control、ablation、random seed 與 error analysis。
- 分辨排行榜高分、工程成果與論文貢獻。
- 根據證據選出主模型、比較模型與停止條件。

## 學習原則

1. **先問問題，再選模型。**
2. **先做可信 baseline，再增加複雜度。**
3. **評估設計優先於單次高分。**
4. **負面結果也可能是重要結果。**
5. **公開教材與私人研究資料必須分離。**

## 公開延伸閱讀

- [scikit-learn：文字文件的 sparse feature classification](https://scikit-learn.org/stable/auto_examples/text/plot_document_classification_20newsgroups.html)
- [BERT: Pre-training of Deep Bidirectional Transformers](https://arxiv.org/abs/1810.04805)
- [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)

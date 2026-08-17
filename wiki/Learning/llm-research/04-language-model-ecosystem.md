---
title: 單元四：語言模型生態與 ChatGPT 的位置
description: 分辨 encoder、encoder-decoder、decoder-only LLM，理解 ChatGPT 能做分類卻未必是最佳主模型。
type: note
status: active
tags:
  - LLM
  - Encoder
  - Decoder
  - ChatGPT
date: 2026-08-17
updated: 2026-08-17
---

# 單元四：語言模型生態與 ChatGPT 的位置

語言模型不是單一產品。ChatGPT 是面向對話與生成的系統；分類研究還常使用不同架構與訓練目標。

## Pretraining

Pretraining 先在大量公開或授權文字上學習一般語言規律，得到可轉移 weights。Downstream task 再利用這些 weights 做分類、檢索或生成。

使用 pretrained model 不等於偷看 test answers，但仍要確認資料規範、模型授權與研究可重現性。

## Encoder-only Model

BERT、RoBERTa、DeBERTa、ModernBERT 等 encoder 讀取整段輸入，產生 contextual representation，再接 classification head。它很適合固定標籤分類，因為輸出層能直接對每個 class 計分。

## Encoder-decoder Model

T5 等模型讀取輸入後生成另一段輸出，可把不同任務統一寫成 text-to-text。彈性高，但固定類別任務仍需處理生成格式與非法答案。

## Decoder-only LLM

GPT、Llama、Qwen 等模型逐 token 生成後續文字。經 instruction tuning 後，它們能遵循 prompt、回答問題並輸出結構化內容。

ChatGPT 可以收到分類指令並生成標籤，所以「不能分類」是錯的；真正問題是它是否適合當主要分類器。

## 為何 ChatGPT 未必是最佳主模型

- 生成目標不等於直接最佳化固定類別邊界。
- 可能輸出同義詞、額外解釋或不存在的類別。
- 大量逐筆 API inference 有成本、延遲與 rate limits。
- 封閉服務可能更新版本，較難完全重現。
- 把私人資料傳給第三方 API 涉及資料治理。
- 通用能力不保證適應每個專業領域的短字串。

可使用 JSON schema、candidate restriction 或 constrained decoding 降低格式問題，但這些元件也必須被記錄與評估。

## ChatGPT 適合的角色

在規則允許時，它可作為：

- zero-shot／few-shot 比較組
- label definition reasoning
- error analysis 助手
- 低信心案例的第二意見
- 研究與程式協作工具

要清楚區分「協助研究」和「成為被評估的 prediction model」。

## 模型大小不是排名表

更大模型可能更有通用能力，也可能對短而結構化的文字沒有額外優勢、成本增加過多或更難解釋。模型選擇是 task-model fit，而不是沿參數量單向升級。

## Teach-back

1. Encoder classifier 與 decoder-only LLM 如何產生分類答案？
2. 為何 ChatGPT 需要 label constraints？
3. Pretraining 與 data leakage 有何不同？
4. Hosted API 與 local open weights 有哪些研究差異？
5. 什麼證據會使你選 ChatGPT，而不是 encoder？

## 導覽

- 上一篇：[[Learning/llm-research/03-text-representation]]
- 回到：[[Learning/llm-research-course]]
- 下一篇：[[Learning/llm-research/05-llm-application-patterns]]

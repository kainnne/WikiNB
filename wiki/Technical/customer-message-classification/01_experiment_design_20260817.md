---
title: 客服訊息分類實驗：實作、評估與目前結果
description: 記錄小型語言模型客服分類實驗的資料切分、候選標籤評分、已執行零樣本結果與尚未完成的 LoRA 邊界。
type: note
status: active
tags:
  - 技術文件
  - LLM
  - Text Classification
  - Evaluation
  - LoRA
date: 2026-08-17
---

# 客服訊息分類實驗：實作、評估與目前結果

## 定位／對應既有頁

本頁是 [[Projects/Machine-Learning/customer-message-classification]] 的技術實作補充。既有頁說明實驗目的與學習價值；本頁只記錄目前程式真正做了什麼、跑出了什麼，以及哪些步驟仍停留在規劃或資料準備階段。

目前狀態可簡化為：**零樣本基線已完整跑完；LoRA 只完成訓練資料格式，尚未實作或執行訓練。**

## 已確認技術

### 執行形式與主要套件

- 實驗以單一 Jupyter Notebook 組織。
- `pandas` 負責讀取與整理表格資料。
- `scikit-learn` 負責分層切分，以及 Accuracy、classification report、Macro-F1 與 confusion matrix。
- Hugging Face `transformers` 負責 tokenizer 與 causal language model。
- Hugging Face `datasets.Dataset` 負責建立後續訓練資料物件。
- PyTorch 負責裝置選擇、模型推論、log-softmax 與候選分數的 softmax。

### 資料與標籤

每筆資料至少要有：

- `text`：中文客服訊息。
- `label`：正確類別。

合法類別固定為：

- `refund`：退款、退貨、取消重複訂單或瑕疵退回。
- `shipping`：出貨、物流、配送或包裹位置。
- `product_question`：尺寸、顏色、規格、功能、保固或相容性。

目前已執行的資料狀態：

| 集合 | 筆數 | 各類別分布 | 用途 |
|---|---:|---:|---|
| 原始訓練資料 | 180 | 各 60 | 再切成 training 與 validation |
| Training | 144 | 各 48 | 預定供 LoRA 更新參數 |
| Validation | 36 | 各 12 | 預定觀察微調表現 |
| Test | 9 | 各 3 | 零樣本與未來微調後的共同評估集 |

180 筆資料以 `test_size=0.2`、`random_state=42` 與 `stratify=label` 分成 144／36。獨立 test set 沒有參與這次切分。

### 模型與裝置

- 基礎模型：`HuggingFaceTB/SmolLM2-135M-Instruct`。
- Notebook 記錄的參數量為 134,515,008，tokenizer vocabulary size 為 49,152。
- 裝置選擇順序為 Apple Silicon MPS、NVIDIA CUDA、CPU。
- 已保存的執行輸出使用 MPS。
- tokenizer 沒有 pad token 時，以 EOS token 代替。
- 零樣本推論前會切到 evaluation mode，並在 `torch.no_grad()` 中計算。

## 資料流／演算法

### 1. 讀取與資料閘門

1. 讀取訓練與測試 CSV。
2. 確認兩者至少包含 `text`、`label`；目前程式檢查的是必要欄位存在，並未限制「只能」有這兩欄。
3. 確認沒有超出三個合法類別的 label。
4. 比較完整訓練資料與 test set 的文字集合，檢查完全相同字串。
5. 對完整訓練資料做分層切分，並重設索引。

已保存輸出顯示訓練資料有 180 個唯一文字、測試資料有 9 個唯一文字，兩者完全重複數為 0。

### 2. 共用任務定義

程式先建立固定的 chat messages：

- system message 定義三類與「只能輸出一個 label」的限制。
- user message 放入待分類的客服文字。

零樣本與訓練資料格式共用同一份任務定義，避免比較前後時偷偷改變 prompt。差別是訓練格式會再加上 assistant 的正確 label。

### 3. 候選標籤分數

零樣本分類沒有讓模型自由生成答案，而是逐一評估三個合法 label：

1. 以模型 chat template 把 system 與 user messages 轉成 prompt。
2. 將候選 label 分別 tokenize。
3. 把 prompt tokens 與候選 label tokens 串接。
4. 依 causal LM 的位移關係，取每個 label token 前一位置的 logits。
5. 對 logits 做 log-softmax，取正確候選 token 的 log probability。
6. 將同一候選 label 的 token log probabilities 取平均，得到 mean token log-probability。
7. 將三個 label 分數做 softmax，取得只在這三個候選間比較的 relative confidence。
8. 排出 Top-1 與 Top-2，並以兩者 confidence 相減取得 margin。
9. Top-1 relative confidence 低於 `0.50` 時輸出 `uncertain`，否則輸出 Top-1 label。

取 token 平均能避免較長 label 單純因 token 數較多而累積更多負 log probability，但結果仍會受 tokenizer、label 字串與 prompt template 影響。

### 4. 全測試集評估

每筆測試資料保留真實 label、Top-1／Top-2、兩者 confidence、margin、最終 prediction 與是否正確，再統一計算指標。

這次已跑完的零樣本結果是：

| 指標 | 結果 |
|---|---:|
| Accuracy | 0.3333 |
| Macro-F1 | 0.1667 |
| 測試筆數 | 9 |
| `uncertain` 筆數 | 0 |

**9 筆資料全部被預測成 `product_question`。**因此三筆商品問題正確，三筆退款與三筆物流全部錯分；這是類別塌縮式的低基線，不應描述成可用分類器。

### 5. LoRA 目前只到格式準備

已完成的部分只有：

- 把 144 筆 training 與 36 筆 validation 轉成 `Dataset`。
- 每筆轉成 system／user／assistant 完整對話。
- 套用 chat template，產生 `formatted_text`。

Notebook 後續儲存格仍是空白；沒有 PEFT／LoRA adapter 設定、target modules、rank、alpha、dropout、trainer、optimizer、epoch、checkpoint、訓練曲線、微調後推論或前後指標比較。**因此 LoRA 尚未實作訓練，更沒有微調改善結果。**

## 測試驗證

目前有證據的驗證包括：

- 必要欄位存在檢查。
- 未知 label 檢查。
- 類別分布輸出。
- 完整訓練集與 test set 的 exact string overlap 檢查，結果為 0。
- 單筆候選標籤評分 smoke test。
- 9 筆 test set 的完整推論表。
- Accuracy、Macro-F1、classification report 與 confusion matrix。

尚未具備：

- 可從乾淨環境一鍵重跑的自動測試。
- 多個隨機種子的結果分布。
- prompt／threshold／label wording 的敏感度測試。
- confidence calibration。
- 微調後的獨立 test 結果。
- 更大測試集與人工錯誤分類分析。

## 部署／執行邊界

- 目前是本機研究 Notebook，不是 API、後端服務或已部署產品。
- 首次載入模型通常需要連線到 Hugging Face Hub；已有本機快取時可重用快取。
- Notebook 已留下 MPS 執行結果，但程式也提供 CUDA 與 CPU fallback；這不等於三種裝置都已驗證。
- test set 必須保持獨立，不得在調 prompt、threshold 或超參數時反覆用來挑方案。
- 未建立模型版本鎖定、依賴鎖檔、輸出 artifact 或部署監控。

## 限制

- 測試集只有 9 筆，每類 3 筆，指標變動粒度很大。
- 訓練資料由程式生成，測試資料另行手寫；能降低完全重複，但不能證明涵蓋真實客服語言分布。
- relative confidence 只是三個候選分數的相對 softmax，不是校準後的正確率機率。
- `0.50` 是手動設定的拒絕門檻，尚未用 validation data 校準。
- 候選 label 的英文拼法與 tokenization 可能影響分數。
- 目前結果顯示模型偏向單一類別；不能只用 Accuracy 解讀，必須同看 Macro-F1 與 confusion matrix。
- LoRA 階段未開始，不能推論微調一定會改善，也不能比較成本或泛化能力。

## 公開邊界

可公開：任務定義、三個通用類別、資料筆數與平衡方式、候選分數演算法、彙總指標、失敗結果與尚未完成事項。

不公開：任何真實客戶訊息、可識別個資、憑證、模型服務 token、本機快取與環境路徑。若未來換成實際客服資料，必須先完成去識別化、資料使用權確認與重新設計公開摘要。

## Source of truth

- `../Eazy_LLMv1/customer_llm_experiment.ipynb`
- `../Eazy_LLMv1/customer_messages.csv`
- `../Eazy_LLMv1/customer_test.csv`

Notebook 與資料檔是實驗現況的 source of truth；本頁只保留可公開、可快速理解的技術摘要。

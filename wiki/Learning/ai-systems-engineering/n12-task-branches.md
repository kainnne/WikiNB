---
title: "N12 Deep Agents 與多分支任務"
description: "評估任務拆分和多 Agent 是否帶來實際價值。"
type: note
status: active
tags:
  - AI 系統工程
  - Agent
date: 2026-10-09
---

# N12 Deep Agents 與多分支任務

把任務分給兩個 Agent，首先增加的是兩份上下文和一次協調工作。是否值得，要看它們能不能獨立工作，以及最後如何把結果合起來。

Task decomposition 拆解任務，獨立上下文減少不相干內容互相干擾，共享狀態則保存需要共同使用的結果。共享不表示可以同時任意修改；要定義每個角色能讀寫哪些欄位。

## 比較兩種設備報告做法

單一 Agent 先查設備，再讀規則，最後寫建議。分工方案則讓一個處理設備狀態，另一個整理規則，由主流程核對兩邊證據後彙整。

只有當兩條支線確實可以獨立處理、各有明確交付時，才可能有收益。若第二個 Agent 必須等第一個判定型號，仍存在相依。少一份結果時，彙整端要說明缺失，不能只靠語氣寫出完整報告。

多 Agent 的文字彼此一致，也不等於事實已被獨立驗證；它們可能使用同一份錯資料。成本、延遲與失敗模式都要一起比較。

## 練習

為兩個角色各寫輸入、輸出與可用工具。用同一組案例比較單一與分工方案，記錄新增協調成本和實際收益。

自我檢查：能說明為什麼要分工、共享什麼，以及哪一種條件下會回到更簡單的方案。

## 接著讀

- [[Learning/ai-systems-engineering]] — 系列入口
- [[Learning/ai-systems-engineering/n10-api-and-container]] — 上一篇：N10
- [[Learning/ai-systems-engineering/n13-evaluation-and-traces]] — 下一篇：N13

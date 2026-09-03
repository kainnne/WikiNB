---
title: 單元 3：生成、版本管理與選曲判斷
description: 把 Suno 從抽卡變成可追溯實驗，學會何時重生、延伸、替換、使用 take、Voice／Persona 或停止投入。
type: learning
status: active
tags:
  - Suno
  - Versioning
  - Music Production
  - Creative Direction
date: 2026-09-03
updated: 2026-09-03
---

# 單元 3：生成、版本管理與選曲判斷

> 課程首頁：[[Learning/suno-studio-album-production]]

生成速度越快，越容易留下數十個「好像都可以」的版本。專業判斷不是生成更多，而是先定義選擇條件、保留可追溯紀錄，並在改善幅度開始下降時停止。

## 本單元完成條件

你要能為一首歌建立版本樹，使用同一張 scorecard 盲聽至少四個候選，選出主版本、備選與淘汰理由，並明確決定下一步是局部修正或停止生成。

## 先選工作模式

- **Simple**：適合探索概念與陌生方向，讓模型提出較大範圍的解法。
- **Custom**：適合已有歌詞、曲風方向、排除條件與專輯規格的作品。
- **Instrumental**：適合先測配器、groove、片頭、過門與聲音世界。
- **Studio**：適合將候選放到時間軸，選 take、替換區段、加入 audio／MIDI、混音與輸出。

若歌曲核心還沒成立，不必太早進 Studio 做細節；若只剩一處咬字或接縫問題，也不必把整首重生。

## 版本樹，不用「final-final-2」

```text
S01 song brief
├─ G01A / G01B：固定歌詞，測主唱距離
│  └─ G02A / G02B：保留 G01B，測鼓與 bass groove
│     └─ E01：替換 1:12–1:26 的歌詞
└─ G03A / G03B：替代方向，較稀疏編曲
```

每個節點只要記：來源版本、改了什麼、保留什麼、結果、下一步。不要用時間順序假裝是決策紀錄。

建議命名：

```text
track-slug_G03B_close-vocal_sparse-verse
track-slug_E02_replace-chorus-line2
track-slug_M01_studio-mix
```

Suno 的 Workspaces 可將同一首歌的生成與延伸集中；Studio 2.0 的 Take Lanes 會保留生成的候選。它們能整理素材，但仍需自己的決策紀錄。

## 先寫淘汰條件

每輪開始前決定不可妥協項目，例如：

- 核心 hook 必須在第一次副歌可辨認。
- 自寫歌詞不可被改成不同意思。
- 主唱不得出現明顯身份漂移或語言咬字崩壞。
- 鼓與 bass 的拍點要能支持後續編輯。
- 不能有跨越整首、無法局部修復的數位瑕疵。

如果候選違反硬條件，即使某個瞬間很驚艷，也不適合成為主版本。可以把好片段留作 reference，但不要讓沉沒成本綁架整首歌。

## 盲聽 Scorecard

先把版本改成 A、B、C、D，不看縮圖與生成順序。每項用 1–5 分即可：

| 指標 | 問題 |
| --- | --- |
| 核心辨識度 | hook、主唱或聲音世界是否一聽就認得？ |
| 歌詞與 prosody | 重音、咬字、換氣與意思是否自然？ |
| 段落功能 | Verse、Chorus、Bridge 是否各有作用？ |
| 演出可信度 | 主唱與樂器是否像在同一首歌中互相回應？ |
| 可編輯性 | 問題是否集中、拍點是否可修、stem 是否值得抽？ |
| 專輯適配 | 是否符合 sonic bible 與曲目角色？ |

分數不是客觀真理，而是防止每次改變標準。硬條件另列 Pass／Fail，不要用平均分掩蓋致命問題。

## 何時用哪一種修正

| 狀況 | 優先動作 |
| --- | --- |
| 整體旋律、主唱與編曲方向都不對 | 改 brief 後重新生成 |
| 只有中段歌詞、咬字或一小段配器失敗 | Replace Section／Studio 局部生成 |
| 結尾太短或缺少收束 | Extend，再重建 Whole Song 或進 Studio 編輯 |
| 同一生成有兩個可用候選 | 在 Take Lanes 比較並 commit 較佳 take |
| 想延續既有聲線／風格 | 依官方當前功能評估 Voice／Persona，並確認隱私設定 |
| 舊版本音質落後但表演很好 | 小心測 Remaster，與原版 level-match 比較 |
| 問題只是音量、空間或接縫 | 不重生，進編輯與混音 |

Voice、Persona、Custom Model 與模型版本都會更新。它們是維持一致性的候選工具，不是保證；專輯一致性仍要靠固定 brief、選擇標準與人工聆聽。

## 停止規則

設定一輪上限，例如四組生成或 30 分鐘評估。以下任一成立就停止：

- 已有一個通過硬條件、局部可修的主版本。
- 最近兩輪沒有提高 scorecard 的關鍵項目。
- 新版本只是變得不同，沒有更符合歌曲角色。
- 問題已明確屬於歌詞、編曲或混音，繼續生成不會回答它。

停止不是放棄，而是把工作交給下一個更適合的製作層。

## 非官方 API／CLI 的位置

專輯主流程以 Suno 官方網頁與 Studio 為 source of truth。非官方 CLI 常依賴未公開端點、瀏覽器憑證或第三方點數，可能失效，也可能增加帳號、條款與權利風險。它可以是隔離的技術實驗，但不應成為唯一版本庫，也不要把主要帳號憑證交給不信任的服務。

最值得自動化的是外圍工作：brief、歌詞、檔名、版本表、下載整理、時間碼與 metadata，而不是繞過官方介面大量呼叫。

## 練習：四候選決策

1. 固定歌詞與大方向，只測一個變因。
2. 生成四個候選並匿名化。
3. 先做 Pass／Fail，再填 scorecard。
4. 選一個主版本、一個備選；每個各寫三句證據。
5. 為主版本列出最多三個局部修正；超過三個就重新考慮是否選錯底稿。

能在生成更多之前先做出「下一個最小動作」，就完成本單元。

## 延伸閱讀

- [Suno：Workspaces](https://help.suno.com/en/articles/4326849)
- [Suno：Replace Section](https://help.suno.com/en/articles/3271873)
- [Suno：Voices 與 Personas](https://help.suno.com/en/articles/11362433)

上一篇：[[Learning/suno-studio-album-production/02-song-form-and-lyric-prosody]]

下一篇：[[Learning/suno-studio-album-production/04-studio-timeline-clips-and-midi]]

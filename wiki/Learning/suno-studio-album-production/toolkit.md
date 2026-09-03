---
title: Suno Studio 專輯製作工具包
description: 可重複使用的歌曲 brief、prompt、版本樹、盲聽評分、Studio 修復、混音、曲目地圖、輸出與權利紀錄模板。
type: learning
status: active
tags:
  - Suno
  - Music Production
  - Templates
  - Album Workflow
date: 2026-09-03
updated: 2026-09-03
---

# Suno Studio 專輯製作工具包

> 課程首頁：[[Learning/suno-studio-album-production]]

這些模板用來減少憑感覺反覆生成。可直接複製到每首歌的本機 Markdown；不要在公開筆記中貼入私人連結、帳號憑證、未公開歌詞或第三方受保護素材。

## 1. 歌曲 Brief

```text
歌曲代號／工作名：
專輯中的功能：
敘事視角與核心句：
聽完希望留下的記憶：

Tempo／拍感：
調性／和聲色彩：
主唱聲線、距離、語言：
核心樂器：
段落順序：
高潮位置與方法：

必須保留：
1.
2.
3.

可以變化：
1.
2.
3.

排除：
1.
2.
3.

本輪唯一要回答的問題：
停止條件：
```

## 2. 八維 Reference 拆解

| 維度 | 觀察 | 要保留的抽象特徵 | 不要複製的作品特徵 |
| --- | --- | --- | --- |
| 形式 |  |  |  |
| 速度／groove |  |  |  |
| 和聲 |  |  |  |
| 配器 |  |  |  |
| 演奏 |  |  |  |
| 人聲 |  |  |  |
| 製作質地 |  |  |  |
| 空間／混音 |  |  |  |

## 3. Prompt 版本

```text
Prompt ID：P01
Identity：
Arrangement：
Production：
Exclude：
Lyrics version：
與上一版唯一差異：
預測會聽到的改變：
實際結果：
下一步：保留／修改／淘汰
```

## 4. Lyric Map

| 段落 | 功能 | 行／字數或音節 | 重音字 | 換氣 | Hook／變化 |
| --- | --- | --- | --- | --- | --- |
| Intro |  |  |  |  |  |
| Verse 1 |  |  |  |  |  |
| Chorus 1 |  |  |  |  |  |
| Verse 2 |  |  |  |  |  |
| Chorus 2 |  |  |  |  |  |
| Bridge |  |  |  |  |  |
| Final Chorus |  |  |  |  |  |
| Outro |  |  |  |  |  |

## 5. 版本樹與生成紀錄

```text
版本 ID：G03B
父版本：G02A
Suno song／project ID：
生成日期與方案：
模型／Voice／Persona：
Prompt ID／Lyrics ID：
唯一變因：
保留的優點：
時間碼問題：
硬條件：Pass／Fail
決策：主版本／備選／淘汰
下一步：
```

## 6. 盲聽 Scorecard

| 項目 | A | B | C | D | 證據／時間碼 |
| --- | ---: | ---: | ---: | ---: | --- |
| 核心辨識度 |  |  |  |  |  |
| 歌詞與 prosody |  |  |  |  |  |
| 段落功能 |  |  |  |  |  |
| 演出可信度 |  |  |  |  |  |
| 可編輯性 |  |  |  |  |  |
| 專輯適配 |  |  |  |  |  |
| 硬條件 |  |  |  |  | Pass／Fail 原因 |

比較前把音量調到接近；先填硬條件，再看分數。

## 7. 問題分類與修復單

| 時間碼 | 症狀 | 層級 | 最小修正 | 驗收方式 | 結果 |
| --- | --- | --- | --- | --- | --- |
|  |  | 詞曲／編曲／演出／編輯／混音／母帶 |  | solo＋full mix／metronome／A-B |  |

## 8. Layer 與 Energy Map

| 段落 | Energy 1–5 | Lead | Groove | Bass | Harmony | Response | Space | 本段要拿掉什麼 |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| Intro |  |  |  |  |  |  |  |  |
| Verse |  |  |  |  |  |  |  |  |
| Pre |  |  |  |  |  |  |  |  |
| Chorus |  |  |  |  |  |  |  |  |
| Bridge |  |  |  |  |  |  |  |  |
| Final |  |  |  |  |  |  |  |  |

## 9. Mixing Decision Log

```text
Static mix 版本：
監聽方式：耳機／喇叭／mono／小音量

問題：
推測原因：
處理前 signal flow：
使用的工具與目的：
Bypass 是否 level-match：
Full mix 結果：
是否增加新的 artifact：
保留／退回：
```

### 混音快速檢查

- [ ] 小音量仍聽得到主唱、hook 與核心 groove。
- [ ] Kick／bass 角色分工清楚。
- [ ] 主唱不因 reverb 或中頻遮蔽而退後。
- [ ] Chorus 的提升不只來自整體變響。
- [ ] Automation 沒有意外跳值。
- [ ] Mono 沒有重要元素明顯消失。
- [ ] Stem 殘留與 AI artifacts 未被 EQ／distortion 放大。
- [ ] Main 保留可控制的 headroom，沒有未解釋 clipping。

## 10. Sonic Bible

```text
專輯一句話世界觀：
主唱身份、距離與語言：
核心樂器與演奏方式：
鼓與 bass 性格：
共同空間：
動態原則：
代表性 motif／聲音手勢：
允許變化：
禁止元素：
```

## 11. 曲目地圖

| # | 曲名／代號 | 專輯功能 | BPM／拍感 | Key／色彩 | Energy arc | 核心聲音 | 主要差異 | 狀態 |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 |  |  |  |  |  |  |  |  |

## 12. Export Manifest

```text
Track／Mix ID：
來源 Studio project／version：
匯出日期：
Full mix／selected range／multitrack／individual stem：
格式：WAV／MP3
Sample rate：
Bit depth：
起點／長度：
是否包含 track automation：
是否包含 Main processing：
檔名：
檔案大小／checksum：
重新匯入完整播放：Pass／Fail
備註：
```

## 13. 權利與來源紀錄

```text
生成日期與當時方案：
Suno song／project／version：
原創歌詞作者：
人類創作的旋律／MIDI／錄音／演奏：
AI 生成或轉換的部分：
Voice／Persona／Custom Model 來源與隱私：
第三方 sample／歌詞／表演／reference 與授權：
預定用途：個人／商業／發行／影像／現場
使用當日已核對的 Suno 條款／方案：
發行商額外要求：
仍需專業法律確認的項目：
```

這份紀錄不能取代法律意見，但能避免發行前才發現素材、日期或版本不可追溯。

## 最終 Gate

只使用三種結論：

- **通過**：硬條件、音樂、音訊、檔案與來源皆可交付。
- **有條件通過**：限制不阻擋本次用途，且已記錄處理者與期限。
- **不通過**：列出時間碼、失敗層級與下一個最小修正，不以繼續生成代替判斷。

回到課程首頁：[[Learning/suno-studio-album-production]]

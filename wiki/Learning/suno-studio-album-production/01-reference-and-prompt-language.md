---
title: 單元 1：把聽感變成 Reference 與 Prompt 語言
description: 用八個聲音維度拆解參考曲，寫出可比較、可排除、能支援迭代的 Suno 生成 brief。
type: learning
status: active
tags:
  - Suno
  - Prompt Design
  - Reference Track
  - Sound Vocabulary
date: 2026-09-03
updated: 2026-09-03
---

# 單元 1：把聽感變成 Reference 與 Prompt 語言

> 課程首頁：[[Learning/suno-studio-album-production]]

「做得夢幻一點」「像電影一樣」「更有質感」都是真實感受，但不是好的製作規格。Prompt 的任務不是寫文學，而是把想聽到的結果分成可辨認、可調整的條件。

## 本單元完成條件

你要能不用藝人姓名，將一首參考曲拆成八個維度，並寫出：

- 三個必須保留的特徵。
- 三個可自由變化的特徵。
- 三個明確不要的元素。
- 一個每次只改一項的 A/B 測試。

## Reference 不是「照著做」

參考曲的用途是建立共同語言，不是複製旋律、歌詞、主唱身分或標誌性錄音。拆解時問「我真正喜歡哪個可觀察特徵」，例如：

- 喜歡的不是某位歌手，而是貼近麥克風、氣聲、低動態的主唱。
- 喜歡的不是某首 City Pop，而是 96 BPM、切分 bass、chorus guitar、明亮和弦延伸與乾淨鼓組。
- 喜歡的不是某部電影，而是低音弦樂持續音、近距鋼琴、後段才展開的寬廣殘響。

這樣的語言可遷移，也比較不會把創作綁在單一作品上。

## 八個拆解維度

| 維度 | 要回答的問題 | 可用詞彙例子 |
| --- | --- | --- |
| 形式 | 段落如何排列與變化？ | short intro、verse-led、late climax、instrumental bridge |
| 速度與 groove | 身體怎麼感受拍子？ | 96 BPM、laid-back、straight 8ths、syncopated、half-time |
| 和聲 | 色彩與方向是什麼？ | minor tonic、major-7 color、modal、descending bass |
| 配器 | 哪些角色在演奏？ | Rhodes、muted guitar、round bass、tight acoustic drums |
| 演奏 | 每個聲部怎麼演？ | soft attack、staccato、legato strings、restrained fills |
| 人聲 | 聲線、距離與表情？ | intimate alto、clear diction、breathy verse、open chorus |
| 製作質地 | 聲音像哪個年代與媒介？ | clean digital、tape warmth、lo-fi edges、80s polish |
| 空間與混音 | 前後左右如何分布？ | dry lead、wide backing vocals、short room、deep plate tail |

不要一次把每格都塞滿。先決定最能辨識這首歌的四到六項，再讓模型保留創造空間。

## Prompt 的三層結構

### 1. Identity：這首歌是什麼

包含類型、時代、速度感、主唱與核心情緒。例如：

```text
80s-inspired retro R&B / city pop, around 96 BPM,
intimate bilingual lead vocal, romantic but determined
```

### 2. Arrangement：它如何展開

描述角色、段落與能量，不必寫成完整配器總譜：

```text
Rhodes and muted guitar open the verse; round syncopated bass;
tight drums enter gradually; chorus widens with backing vocals;
brief sax response only after the second chorus
```

### 3. Production：它如何被聽見

```text
warm but clear low end, close dry lead vocal,
short gated room on drums, moderate stereo width,
polished transients without aggressive loudness
```

Advanced Options 的 Exclude 應寫可辨識元素，例如 `trap hi-hats, distorted rock guitar, festival EDM drop, excessive vocal runs`，不要寫抽象的「不要俗」。Suno 官方提供 Exclude，但生成模型不是精確規則引擎；最後仍以實際聆聽判斷。

## 把 Prompt 當假設，不當咒語

同一句 prompt 會產生不同結果。好的流程是：

1. 固定歌詞、模型與主要結構。
2. 第一輪只測主唱或 groove。
3. 第二輪只測配器密度。
4. 第三輪才調空間與製作語言。

若每次同時改 BPM、曲風、主唱、段落和歌詞，就不知道哪個變因造成改善。Prompt 版本要能被記錄，例如 `P03 = P02 + dry vocal - sax`。

## 形容詞要能被驗收

| 模糊詞 | 改成可聽見的條件 |
| --- | --- |
| 高級 | restrained arrangement、controlled sibilance、clear low end、few signature sounds |
| 電影感 | long dynamic arc、low string sustain、wide late climax、large hall tail |
| 夢幻 | soft transients、chorused keys、breathy doubles、long filtered reverb |
| 有力量 | strong downbeat、octave reinforcement、open vocal vowels、wider chorus |
| 復古 | 指定年代、樂器、鼓聲、飽和與空間，而不是只寫 vintage |

## 一個完整 brief 範例

```text
目的：專輯中段的告白曲；不是大結局。
速度／groove：96 BPM，laid-back 4/4，bass 有切分，鼓不要太滿。
核心配器：Rhodes、muted guitar、round electric bass、tight acoustic drums。
人聲：貼近、清楚、主歌克制；副歌才展開和聲。
結構：4-bar intro / verse / chorus / verse / chorus / short instrumental / final chorus.
製作：warm and polished，主唱偏乾，鼓短空間，副歌加寬。
必須：中英歌詞可聽清楚、hook 第一遍就辨認、第二段有新細節。
排除：trap hi-hats、EDM drop、過量轉音、重失真吉他、長 sax solo。
```

## 常見誤判

- Prompt 越長越準：條件太多可能互相衝突，先找辨識度最高的少數條件。
- 樂理詞越多越專業：模型未必精確遵循複雜和聲標記，耳朵驗收仍是最後判準。
- 使用藝人姓名最有效：即使短期有用，也不利於建立自己的聲音語言與公開製作紀錄。
- 生成失敗只是 prompt 不夠好：模型能力、歌詞密度、音訊條件與隨機性都可能是原因。

## 練習：同一首歌做四格測試

只選兩個變因，例如「乾／濕人聲」與「稀疏／飽滿編曲」，生成四格：

|  | 稀疏 | 飽滿 |
| --- | --- | --- |
| 乾人聲 | A | B |
| 濕人聲 | C | D |

盲聽後記錄哪一格最符合歌曲功能，以及為什麼。能說出選擇依據，而不是只說「A 最有感」，才算完成。

## 延伸閱讀

- [Suno：排除不想要的元素](https://help.suno.com/en/articles/3161921)
- [Suno Music Glossary](https://help.suno.com/en/categories/550017)

上一篇：[[Learning/suno-studio-album-production/00-production-map]]

下一篇：[[Learning/suno-studio-album-production/02-song-form-and-lyric-prosody]]

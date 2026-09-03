---
title: 單元 5：減法編曲、Stem 與 AI 音訊修復
description: 用角色、音域、密度與能量設計編曲，正確理解 AI stem 分離限制，處理拍點、殘留、接縫與局部瑕疵。
type: learning
status: active
tags:
  - Arrangement
  - Stems
  - Audio Repair
  - Suno Studio
date: 2026-09-03
updated: 2026-09-03
---

# 單元 5：減法編曲、Stem 與 AI 音訊修復

> 課程首頁：[[Learning/suno-studio-album-production]]

編曲不是把作品填滿，而是安排注意力。一首歌即使每個聲部都好聽，只要同時要求聽者注意，就會失去主角。對習慣長篇器樂寫作的人，最重要的新能力通常是減法：知道何時讓誰不演奏。

## 本單元完成條件

你要能為一首歌畫出 layer map 與 energy map，刪除或靜音至少一個不必要元素，使用 stem 或局部替換修好一個可定位問題，並在 solo 與全混音兩種狀態下驗收。

## 六種編曲角色

| 角色 | 作用 | 常見素材 |
| --- | --- | --- |
| Pulse | 提供時間與細分 | hi-hat、shaker、picking、arpeggio |
| Groove | 定義身體感與重拍 | kick、snare、bass、rhythmic guitar |
| Harmony | 提供和聲色彩與支撐 | keys、pads、guitar、strings |
| Lead | 當下主要注意力 | 主唱、solo、主旋律樂器 |
| Response | 回答主角、填補空隙 | backing vocal、短 riff、counterline |
| Space／Texture | 建立距離、環境與轉場 | ambience、noise、reverb tail、riser |

同一件樂器可以換角色，但同一時間最好有明確主角。若主唱正在唱密集歌詞，response 就不要持續說另一段完整旋律。

## 先畫 Energy Map

用 1–5 表示每段相對能量，不必追求精確音量：

```text
Intro 1 → Verse 2 → Pre 3 → Chorus 4
Verse 2 → Chorus 4 → Bridge 1 → Final Chorus 5 → Outro 1
```

接著寫每次上升靠什麼：加入 kick、bass 改節奏、主唱升八度、和聲加寬、殘響變長，或反而先抽空一拍。若每次只靠「全部變大聲」，編曲仍沒有真正成長。

## 密度、音域與頻率不是同一件事

- **密度**：同一時間發生多少事件。
- **音域**：聲部落在低、中、高哪個 register。
- **頻率**：聲音實際佔據的頻譜，受音色與錄音影響。

兩件樂器音名不同，仍可能在相同頻率互相遮蔽；兩個聲部音域接近，也可以因節奏錯開而清楚。先用編曲分開，再用 EQ 微調。

## Stem 的正確心智模型

AI stem separation 是從完成混音中「估計」各來源，不是拿回生成時的原始錄音軌。可能出現：

- 人聲殘留在樂器 stem。
- cymbal、reverb 或 distortion 被分到多個 stem。
- attack 被削弱，或聲音邊緣有水波、顫動與金屬感。
- 多個 stem 相加不完全等於原 mix。
- 標籤判斷錯誤。

Suno 目前提供自動多軌、指定從混音抽出單一來源，以及 Premier 的進階指定分離。功能與點數會變動；不要因選單可選某件樂器，就假設它一定能得到乾淨結果。

## Stem 工作流程

1. 先保存原 mix，標記要解決的具體問題。
2. 只抽需要編輯的 stem；若只是人聲太大，不一定要拆十二軌。
3. Solo stem 找殘留與 artifacts，再放回 full mix 判斷是否真的可聽。
4. 使用整組 stems 重建時，先 mute 原 mix；不要盲目疊加同一內容。
5. 對齊 downbeat、尾音與延遲；必要時用短 fade 修剪邊緣。
6. A/B 比較原 mix 與 stem mix，盡量接近同音量。

## AI 音訊問題的最小修復

| 問題 | 先嘗試 | 何時放棄局部修復 |
| --- | --- | --- |
| 單句咬字錯 | 改短歌詞、Replace Section、換 take | 聲線在整段持續漂移 |
| 一個鼓點錯位 | 移動／切 clip、短 crossfade | 全曲 groove 不一致 |
| 結尾被切 | Extend 或重做 outro | 核心和聲方向也錯 |
| 一件樂器太吵 | 抽該 stem、volume automation、EQ | stem 殘留比原問題更嚴重 |
| 過多 baked-in reverb | 測試 Remove FX／較乾版本 | 去除後產生明顯金屬 artifacts |
| 段落轉場突兀 | 從前後各保留上下文生成、調 boundary | 兩段 tempo、key 或主唱身份不同 |

修復時從最小範圍開始，但生成區段要包含足夠上下文。只生成一個字，模型可能無法延續語氣；整段重生又可能失去原本喜歡的表演。

## 減法編曲檢查

逐軌 mute，問三題：

1. 拿掉後，段落功能有沒有消失？
2. 拿掉後，主唱或 hook 是否反而更清楚？
3. 這條軌是否只是在重複另一條已經完成的工作？

如果拿掉後更好，就不必因為它本身好聽而保留。可以把它移到第二次副歌或 bridge，讓好素材成為發展而不是負擔。

## 常見誤判

- 每條 stem solo 都要完美：真正目標是放回 mix 後完成任務，但嚴重殘留仍會限制處理。
- EQ 能解決所有遮蔽：節奏、音域與樂器進出通常更根本。
- 高潮就是更多軌：音域上升、節奏改變或高潮前留白可能更有效。
- Crossfade 越長越自然：跨到不同音高或拍點時，長 fade 會製造雙重聲音。
- 修復版本一定比原版好：每次都要保留原版並做 level-matched A/B。

## 練習：一段副歌的重編

選一段副歌與前四小節：

1. 寫出每一層角色與音域。
2. 逐軌 mute，刪掉一個沒有獨立功能的元素。
3. 只在副歌第二半加入一個 response 或 texture。
4. 找一個 AI 瑕疵，記時間碼與症狀。
5. 用 take、局部替換、stem 或剪輯中的一種修復。
6. 在 solo、full mix、耳機與小音量各驗收一次。

若修改後主角更清楚、高潮仍成立，而且能說明為什麼不是靠音量作弊，就完成本單元。

## 延伸閱讀

- [Suno：Advanced Stem Separation](https://help.suno.com/en/articles/12702337)
- [Suno Studio 2.0 官方介紹](https://help.suno.com/en/articles/13670529)
- [Ableton：Arrangement 中的 fades 與 crossfades](https://www.ableton.com/en/manual/arrangement-view/)

上一篇：[[Learning/suno-studio-album-production/04-studio-timeline-clips-and-midi]]

下一篇：[[Learning/suno-studio-album-production/06-mixing-automation-and-effects]]

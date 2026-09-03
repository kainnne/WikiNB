---
title: 單元 6：混音、Automation 與效果器基本功
description: 從 gain staging、EQ、compression、空間與聲像開始，在 Suno Studio 建立有目的、可 A/B、隨歌曲推進的混音。
type: learning
status: active
tags:
  - Mixing
  - Automation
  - Audio Effects
  - Suno Studio
date: 2026-09-03
updated: 2026-09-03
---

# 單元 6：混音、Automation 與效果器基本功

> 課程首頁：[[Learning/suno-studio-album-production]]

混音的目標不是讓每條 track 單獨都巨大漂亮，而是讓整首歌在時間、頻率、音量、前後與左右五個維度有清楚的注意力。每加一個效果器前，先用一句話說明它要解決什麼。

## 本單元完成條件

你要能完成一個 60–90 秒混音：先做 static balance，再用 EQ、compression、空間和至少一條 automation 解決明確問題；每個處理都做 bypass 或 level-matched A/B，並保留足夠 headroom。

## 混音的工作順序

```text
選對素材
  → clip gain 與基本音量
  → pan 與編曲空間
  → 問題修復
  → EQ／compression 等處理
  → reverb／delay 與深度
  → automation 建立段落推進
  → Main 檢查與 export
```

不要一開專案就把所有插件放上去。若只調 fader 和 pan 就能清楚，這是成功，不是功能用得不夠多。

## 1. Gain staging：先讓訊號有工作空間

Clip gain 用來修正素材本身的基準音量；track fader 用來做混音平衡。若某個 clip 天生過大，不要只把 fader 拉到底，先在較前端調整。

沒有一個所有曲風都必須遵守的神奇 dB 數字。重點是：

- track 與 Main 不持續不可控制地 clipping。
- 插件輸入不因過大或過小而偏離預期。
- bypass 前後音量接近，避免把「比較響」誤認為「比較好」。
- 最後仍保有調整與母帶空間。

## 2. Static balance：不用插件先完成歌曲

從主角開始，再加入 groove、bass、harmony、response 與 texture。小音量播放時，仍應聽到主唱、核心節奏和 hook。若小音量只剩鼓或低頻，平衡可能被聲壓誤導。

Pan 用來安排左右，不是把衝突全部推到兩邊。低頻核心通常需要穩定；重要內容要檢查 mono，避免左右相消。

## 3. EQ：讓位置清楚，不是把聲音變昂貴

EQ 可以移除不需要的低頻、降低刺耳共振、讓主唱與樂器分工，或塑造音色。操作時：

1. 先指出被遮蔽的對象。
2. 在 full mix 中調整，不要只 solo。
3. 優先做小而有目的的修正。
4. Bypass 確認清晰度真的改善，沒有只變薄或變亮。

若兩個聲部從編曲到音域都完全重疊，先回到單元 5，而不是做激烈 EQ 雕刻。

## 4. Compression：管理包絡與動態

Compressor 不是單純變大聲。它根據 threshold、ratio、attack、release 等條件改變動態：

- 較快 attack 會更快壓住 transient，可能變平。
- 較慢 attack 可保留敲擊開頭，但峰值較突出。
- release 太短可能抖動或失真；太長可能整句壓住不回來。
- Makeup gain 應在比較時補回合理音量，而不是用來作弊。

在人聲上可穩定句與句；在鼓上可改變 punch；用 sidechain 可讓 bass 或 pad 在 kick 出現時暫時讓位。先用耳朵辨認包絡，不必追求固定參數。

## 5. Gate、Distortion 與 Saturation

Gate 可降低段落間噪音或收緊尾音，但設定過強會切掉呼吸與自然 decay。Distortion／saturation 可增加諧波、密度與存在感，也會放大齒音和 artifacts。AI stem 已有殘留時，失真可能讓殘留更明顯。

## 6. Reverb、Convolution 與 Delay

Reverb 決定空間與距離；convolution 使用空間 impulse response 建立較具體的聲學輪廓；delay 則創造可辨認的重複與節奏。

實用原則：

- 主唱要靠前，可先用較短、較暗的空間或 pre-delay，而不是完全沒有 reverb。
- 多條軌共享相同空間，有助於像在同一個世界。
- 長殘響要替歌詞與下一個 transient 留位置，可用 EQ、automation 或 ducking。
- Delay throw 適合只在句尾出現，不必整段一直開。

## 7. Automation：混音隨歌曲呼吸

Automation 讓 volume、pan、effect 和 plugin parameter 隨時間改變。Studio 2.0 可對 track volume、pan 與多數效果參數畫 lane，且 automation 會反映在 export。

先從四種高價值用法開始：

- 主唱字句的 volume ride。
- Chorus 前一拍抽掉或推升某層。
- 句尾 delay throw。
- Final Chorus 才打開的寬度、reverb 或 filter。

曲線越簡單越容易維護。官方建議先學 volume，使用少量平滑曲線，不要堆滿控制點。

## 效果器順序與 Bypass

效果 chain 的順序會改變聲音。常見起點是 corrective EQ → compression → tone／saturation → space，但不是規則。每個效果都要：

- 有一個可說明的目的。
- 可單獨 bypass。
- 比較時音量接近。
- 在整段上下文，而不是只循環一個瞬間驗收。

Studio 2.0 內建 Compressor、EQ、Reverb、Convolution、Delay、Distortion 與 Gate；也可用 chat 建立 Studio 內的自訂插件。自訂插件仍需像任何工具一樣測試，不因是 AI 生成就自動安全或合適。

## 常見誤判

- 紅燈不亮就一定沒有問題：動態、插件輸入與 inter-sample peak 仍需檢查。
- Solo 很漂亮就能放進 mix：混音判斷主要發生在關係中。
- EQ boost 能增加細節：有時只是變尖，或把 AI artifacts 提出來。
- Compression 越多越穩：過度壓縮會失去語氣與段落差。
- Reverb 越長越有電影感：沒有前後層次時，只會更模糊。
- Main limiter 一開就完成：它不能替錯誤的單軌平衡負責。

## 練習：60 秒限制混音

只能使用 fader、pan、EQ、compressor、一個共用 reverb 與兩條 automation：

1. 先完成 static mix，存成 A。
2. 寫出三個明確問題，才允許加效果。
3. 每個效果調整後 level-match bypass。
4. 一條 automation 修主唱；另一條建立段落推進。
5. 以耳機、喇叭、mono、小音量與略大音量各聽一次。
6. 隔至少十分鐘再盲聽 A／B。

若 B 的歌詞、主角與段落更清楚，而且不是只比較響，就完成本單元。

## 延伸閱讀

- [Suno：Audio Effects and Plugins in Studio](https://help.suno.com/en/articles/13670785)
- [Suno：Automation in Studio](https://help.suno.com/en/articles/13674305)
- [Ableton：Mixing](https://www.ableton.com/en/manual/mixing/)

上一篇：[[Learning/suno-studio-album-production/05-arrangement-stems-and-repair]]

下一篇：[[Learning/suno-studio-album-production/07-album-cohesion-export-and-rights]]

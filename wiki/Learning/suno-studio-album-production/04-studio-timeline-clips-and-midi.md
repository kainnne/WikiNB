---
title: 單元 4：Suno Studio 2.0 時間軸、Clip 與 MIDI
description: 讀懂 Studio 2.0 的 transport、track、take lane、audio clip、MIDI、warp、fade、library 與 chat 操作邏輯。
type: learning
status: active
tags:
  - Suno Studio
  - DAW
  - Audio Editing
  - MIDI
date: 2026-09-03
updated: 2026-09-03
---

# 單元 4：Suno Studio 2.0 時間軸、Clip 與 MIDI

> 課程首頁：[[Learning/suno-studio-album-production]]

DAW 看起來有很多按鈕，但核心只有三件事：聲音放在哪個時間、經過哪條 track、播放時有哪些參數會改變。掌握時間軸與 signal flow 後，換到 Logic、Ableton 或其他 DAW 也能遷移。

## 本單元完成條件

你要能在 Studio 建立一個不破壞原始素材的測試版本，完成：匯入／拖入、拍點檢查、切割、移動、淡入淡出、take 比較、一條 MIDI、一次 quantize，以及另存可回復版本。

## 使用前邊界

截至 2026 年 9 月：

- Studio 2.0 為 Premier 功能。
- 官方建議使用最新版 Chrome；Safari 目前不能使用 Web MIDI。
- 支援 WAV、MP3 與 MIDI 匯入。
- Studio 有內建 effects 與 synth，也能用 chat 設計 Studio 內插件，但不能載入 VST／Audio Units。
- 可與外部 DAW 交換檔案，但沒有直接同步或 plugin-host 整合。

方案與介面可能更新，開始前仍應檢查官方說明。

## 先認得六個區域

1. **Transport**：播放、停止、錄音、loop、metronome、tempo、拍號與 playhead。
2. **Timeline**：時間從左到右；track 由上到下。
3. **Track controls**：mute、solo、volume、pan、effects 與 automation。
4. **Clip／Arrangement Editor**：audio waveform 或 MIDI piano roll 的局部細節。
5. **Take Lanes**：同一次生成的候選版本；先 audition，再 commit 到主時間軸。
6. **Library／Chat**：瀏覽歌曲、stems、uploads、workspaces，或用語言提出生成與編輯要求。

Chat 是操作入口，不是判斷替代品。每次對話式修改後仍要檢查時間、音樂與音訊結果。

## Audio 與 MIDI 的差別

### Audio clip

Audio 是已經發生的聲音。可切割、移動、fade、調 gain、transpose、改速度與 warp，但每次大幅拉伸都可能增加 artifacts。人聲、生成歌曲與 stem 通常是 audio。

### MIDI clip

MIDI 儲存 pitch、timing、duration、velocity、pitch bend 與 modulation 等事件，必須通過 synth 才有聲音。MIDI 適合修旋律、改和弦、量化節奏與替換音色。Studio 2.0 可在 piano roll 畫音、錄製控制器，也能在 audio 與 MIDI 之間做轉換或生成式 cover。

「可編輯」不等於「比較自然」。過度 quantize 會失去 groove；audio-to-MIDI 也需要人工核對錯音與延音。

## 時間軸操作順序

### 1. 先複製版本

原始生成保持不動；建立新的 Studio version 或 duplicate，名稱包含日期與目的，例如 `song_M01_timing-cleanup`。任何大改前都留下可回復點。

### 2. 設定 tempo 與拍號

不要只相信偵測值。打開 metronome，從第一個明確 downbeat 開始聽，確認每小節是否逐漸偏離。若前面有自由速度 intro，先決定要保留原速，還是把後段對齊 grid。

### 3. 判斷 warp 是否必要

- 節奏性 loop 需要跟專案 tempo 同步時才 warp。
- ambience、one-shot、自由速度鋼琴未必需要。
- 先固定可靠 downbeat，再逐段放 marker；不要一次把整首自動拉平後就假設正確。
- 拉伸後比較 transients、人聲尾音與殘響，確認沒有顆粒或顫動。

Suno 官方已提醒 Studio 2.0 的新生成有時可能略早或略晚於拍點，因此 metronome、solo 與人工檢查是必要步驟。

### 4. 切割與淡化

切割用來分開可移動或可替換的區段；fade／crossfade 用來避免爆音與突兀接縫。不要把切點放在明顯 transient 正中央，也不要用很長 crossfade 掩蓋兩段不同和聲。

### 5. Take Lanes

先在相同上下文 audition 候選，再 commit。比較時音量要接近，避免總是選較響的一個。保留備選直到整段轉場確認完成。

### 6. MIDI 與 quantize

先修錯音，再修 timing；先選需要量化的音，不要整軌一鍵推滿。鼓可較嚴格，旋律與和弦保留適量提前、延後與 velocity 差異。

## 常用快捷鍵的最小集合

依 2026 年 8 月官方表：Space 播放／停止、Shift+C 開關 metronome、Shift+R 錄音、Shift+S solo、Shift+M mute、Cmd/Ctrl+E split、Cmd/Ctrl+L loop、Shift+A automation、Shift+Q quantize、Cmd/Ctrl+Z undo。快捷鍵可能改版，完整表以官方頁為準。

先熟十個高頻操作即可，不必背完整清單。

## 常見誤判

- 對上第一拍就等於全曲同步：tempo drift 可能後面才出現。
- waveform 看起來整齊就一定聽起來對：視覺只能輔助，拍感仍要聽。
- quantize 越多越準：準確與 groove 不是同義詞。
- 把原 mix 和所有 stems 同時播放會更厚：相同內容疊加可能造成相位、梳狀濾波與音量假象。
- Chat 回覆成功就等於編輯成功：必須播放、solo、時間碼驗收。

## 練習：60 秒 Studio 編輯

選一段約 60 秒的歌曲：

1. 複製版本並開 metronome。
2. 標出四個段落邊界與 downbeat。
3. 切割一處，移動或替換一個 clip。
4. 做一個聽不出爆音的 crossfade。
5. 建一條 MIDI track，輸入四小節和弦或反旋律。
6. 只量化必要音符，調整 velocity。
7. 關閉 metronome，從段落前兩小節播放確認轉場。

若能復原到原版，並說明每個操作改變了什麼，就完成本單元。

## 延伸閱讀

- [Suno Studio 2.0 官方介紹](https://help.suno.com/en/articles/13670529)
- [Suno Studio 2.0 快捷鍵](https://help.suno.com/en/articles/13680385)
- [Ableton：Audio Clips、Tempo 與 Warping](https://www.ableton.com/en/manual/audio-clips-tempo-and-warping/)

上一篇：[[Learning/suno-studio-album-production/03-generation-and-version-selection]]

下一篇：[[Learning/suno-studio-album-production/05-arrangement-stems-and-repair]]

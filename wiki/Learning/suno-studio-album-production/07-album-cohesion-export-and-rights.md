---
title: 單元 7：專輯一致性、輸出、Metadata 與權利
description: 用 sonic bible 與曲目地圖維持整張專輯的共同世界，完成多軌輸出、備份、發行紀錄與 AI 音樂權利檢查。
type: learning
status: active
tags:
  - Album Production
  - Export
  - Metadata
  - Music Rights
  - Suno
date: 2026-09-03
updated: 2026-09-03
---

# 單元 7：專輯一致性、輸出、Metadata 與權利

> 課程首頁：[[Learning/suno-studio-album-production]]

九首各自精彩的歌，不一定是一張專輯。專輯需要共同聲音世界、曲目角色、動態關係與可追溯的製作紀錄。同時，一致性不是把每首都做成同一個 tempo、同一組和弦與同一個 prompt。

## 本單元完成條件

你要能完成一頁 sonic bible、一張曲目地圖、一份 export manifest 與一份權利／來源紀錄；並能把三首歌依曲序播放，指出共同特徵與刻意差異。

## Sonic Bible：先定義共同世界

建議只寫一頁：

```text
核心世界：夜間移動、記憶與主動靠近；溫暖但不懷舊到模糊。
主聲音：近距主唱、Rhodes、乾淨／muted guitar、圓潤 bass、克制鼓組。
共同空間：主唱偏近；樂器共享短 room；長 reverb 只在轉場與結尾。
動態：Verse 保留呼吸；Chorus 加寬而不是只加 limiter。
辨識手勢：一句雙語回應、上行三音 motif、第二次副歌才出現的高音層。
禁止：festival EDM drop、重失真牆、過量轉音、每首都用長 sax solo。
```

共同世界至少包含：主唱觀點、核心樂器、鼓與 bass 性格、空間、動態、代表性手勢與 no-go。每首歌可違反一兩項，但要知道為什麼。

## 曲目地圖

| Track | 專輯功能 | BPM／拍感 | Key／色彩 | 能量 | 核心聲音 | 主要差異 |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | 開門、建立世界 | 中速 | 開放但未解決 | 2→3 | 近距主唱、Rhodes | 最少鼓 |
| 02 | 第一個外放動作 | 快 | 明亮 | 4 | guitar、bass、tight drums | 第一個完整 chorus |
| 05 | 轉折 | 自由→慢拍 | 模糊 minor | 1→4 | piano、strings | 最長動態弧線 |
| 09 | 收束 | 中慢 | 回到主色彩 | 2→5→1 | 全專輯 motif | 最寬高潮後留白 |

地圖用來避免連續三首速度、音域、主唱強度與開場方式都相同，也避免為了多樣性讓某首完全掉出世界觀。

## 一致性與同質化

維持三至五個固定維度，再讓二至三個維度變化：

- 固定：主唱距離、bass 質地、主要空間、歌詞視角、mix 的清晰度。
- 變化：tempo、拍號、核心樂器、段落結構、高潮位置。

若每首都換歌手、鼓聲、混響世界與年代，Persona 或固定 prompt 也很難補救；若每首都複製相同 arrangement，則像同一首歌的九個版本。

## 曲序是另一種編曲

曲序要考慮：

- 第一首承諾什麼世界？
- 前三首是否建立足夠辨識度？
- 中段是否有呼吸、視角或速度轉折？
- 最大高潮放在哪裡，之後如何離場？
- 相鄰曲目的尾音、第一個 transient、key、noise floor 與 perceived loudness 是否衝突？

以 gap、crossfade 或直接切換做曲間關係前，先確認發行平台是否會照預期播放；保留每首獨立 master，也保留整張連續 audition 檔。

## 匯出與交接

Suno Studio 2.0 官方目前支援完整歌曲、選取範圍與 multitrack 匯出，可輸出 32-bit WAV 或 MP3，也能下載個別 stem WAV。實務上：

1. 保留一份 Studio project／version 名稱與日期。
2. 匯出 full mix 作為核對基準。
3. 需要外部 Logic／Ableton 混音時，再匯出 multitracks／stems。
4. 確認所有檔案同一起點、同長度或附清楚時間資訊。
5. 記錄 sample rate、bit depth、tempo、拍號與是否包含 Main processing。
6. 匯出後重新匯入空白 session，從頭到尾播放驗證。

不要只保留 MP3；也不要因 32-bit float 有較大 headroom，就忽略 clipping、版本與格式管理。

## Mastering 的最低必要理解

母帶階段要檢查曲目間 perceived loudness、低頻、明亮度、stereo、峰值與轉場。不要盲目追逐單一 LUFS 數字；串流平台、發行商與使用情境可能改變。先讓每首混音成立，再以整張專輯的關係做小幅統一。

至少輸出：

- 發行用 lossless master。
- 經驗證的預覽檔。
- Instrumental／acapella／stems，只在確實需要時建立。
- 一份 checksum 或檔案大小／日期紀錄，避免傳錯版本。

## 權利與來源紀錄

Suno 官方目前說明：在付費方案有效期間生成的歌曲具有商業使用權；自己輸入的原創歌詞仍屬於作者。然而商業使用權不等於各司法管轄區一定承認完整著作權，純 AI 產出與人類實質貢獻的判定也可能變動。

每首歌至少記錄：

- 生成日期與當時方案。
- Suno song／project／version 識別資訊。
- 自己撰寫的歌詞、旋律、MIDI、錄音與後製內容。
- 使用的第三方歌詞、sample、表演或 reference 是否已獲授權。
- 主要 prompt、Voice／Persona／Custom Model 來源與隱私設定。
- 匯出日期、檔名與預定用途。

不得因訂閱後才下載，就假設先前免費方案生成的作品自動取得回溯商用權。正式發行時再次閱讀最新方案、條款、發行商與所在地法律；重大商業用途應諮詢合格專業人士。

## 常見誤判

- 同一個 Persona 就能保證專輯一致：仍可能有配器、空間與演唱漂移。
- 每首一樣響就是一致：音色、動態與空間關係同樣重要。
- 有商用權就一定能登記完整著作權：兩者不是同一概念。
- 檔名有 final 就是 master：必須能追溯來源、設定與驗證。
- 匯出成功就完成：要重新匯入、完整播放、核對開頭結尾與檔案資訊。

## 練習：三首歌的 Mini Album Gate

1. 完成 sonic bible。
2. 選三首功能不同的歌填曲目地圖。
3. 連播三首，記錄五個共同特徵與每首兩個刻意差異。
4. 對相鄰曲目比較 perceived loudness、低頻與空間。
5. 為每首填 export manifest 與權利紀錄。
6. 重新匯入輸出檔，完整播放一次。

三首能形成同一世界、各自有功能，而且檔案與來源可追溯，才算完成。

## 延伸閱讀

- [Suno Studio 2.0：匯出能力](https://help.suno.com/en/articles/13670529)
- [Suno：付費方案作品權利](https://help.suno.com/en/articles/9601665)
- [Suno：AI 作品與著作權](https://help.suno.com/en/articles/2746945)

上一篇：[[Learning/suno-studio-album-production/06-mixing-automation-and-effects]]

下一篇：[[Learning/suno-studio-album-production/08-practice-plan-and-checkpoints]]

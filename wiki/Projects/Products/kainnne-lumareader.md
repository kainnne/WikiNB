---
title: Kainnne LumaReader
description: 一個重視閱讀體驗與隱私的本機 Markdown 閱讀器，支援長文、數學、圖表與多媒體內容。
type: note
status: active
tags:
  - LumaReader
  - Markdown
  - Electron
  - 本機優先
  - 閱讀器
date: 2026-08-14
updated: 2026-08-14
---

# Kainnne LumaReader

LumaReader 是一個本機優先的 Markdown 閱讀器。我希望它解決的不是「能不能打開 Markdown」，而是大量筆記、教材與專案文件是否能像真正的閱讀內容一樣被整理、瀏覽與長時間使用。

## 已完成的主要功能

- 選擇資料夾後遞迴建立 Markdown 書庫，支援常見 Markdown 與 MDX 副檔名。
- 顯示目錄、程式碼語法、KaTeX 數學式、Mermaid 圖表與本機圖片／媒體。
- 提供原始碼、文章大綱、媒體瀏覽與檔案變更後即時更新。
- 支援直向、橫向與分頁閱讀，以及 20 組色彩主題和 11 種介面語言。
- 內容由本機 loopback 服務提供，不必把私人文件上傳到外部網站。

## 價值

它把「散落的 Markdown 檔」變成可閱讀的個人資料庫，也能承接 WikiNB、專案 handoff、教學文件與長篇創作等不同內容。對我而言，閱讀工具不是知識系統的附屬品，而是讓知識真的能被再次使用的最後一哩。

## 目前邊界

macOS 開發流程已有本機驗證；目前仍以原始碼與開發版本為主，尚未把未簽署的安裝包描述成正式公開發行版。Windows 與正式發佈仍需要額外封裝及實機驗證。

產品頁：[lumareader.kainnne.com](https://lumareader.kainnne.com/)

---
title: Kainnne LumaReader
description: 把本機 Markdown 資料夾變成安靜、可編輯且可長時間閱讀的跨平台桌面書庫。
type: note
status: active
tags:
  - LumaReader
  - Markdown
  - Electron
  - 本機優先
  - 閱讀器
date: 2026-08-14
updated: 2026-08-24
---

# Kainnne LumaReader

LumaReader 是一個本機優先的 Markdown 與純文字桌面閱讀器。我希望它解決的不是「能不能打開 Markdown」，而是大量筆記、教材、handoff 與專案文件，能不能像真正的閱讀內容一樣被整理、搜尋、編輯與長時間使用。

它也是目前最能代表我產品設計與軟體實作能力的單一專案：從閱讀介面、跨語言與長文互動，到本機檔案權限、Electron 安全邊界、跨平台測試與正式發行，都有可操作成果。

## 從資料夾開始，而不是從帳號開始

第一次開啟時，使用者選擇一個資料夾作為書庫根目錄。LumaReader 會遞迴整理支援的文件，保留原本的資料夾結構，並在之後啟動時記住選擇。

日常閱讀不需要建立帳號，也不需要把文件上傳到雲端。內容由只監聽本機 loopback 的文件服務提供給桌面介面；書庫路徑與外觀偏好保存在應用程式自己的使用者資料中。

## 主要閱讀與管理能力

- Markdown 格式預設啟用，包含 `.md`、`.markdown`、`.mkd` 與 `.mdx`；`.txt`、`.log` 可以個別開啟並保持唯讀。
- 檔名與路徑搜尋會自動展開命中項目的上層資料夾，清除搜尋後再回到原本的收合狀態。
- 直向、橫向、左右翻頁與上下翻頁能配合長文；側欄可調寬或收合，字級與偏好會保留。
- 支援表格、任務清單、提示區塊、程式碼高亮、KaTeX 數學式、Mermaid 圖表、註腳、縮寫、emoji、本機 include 與圖片／音訊／影片。
- 中日韓文字緊接 `**粗體**` 時會先做安全正規化，避免標記直接露在畫面上。
- 11 種介面語言、亮暗模式與 22 組色盤只改變應用程式框架與重點色；閱讀紙張維持中性，提高文字清晰度。

## 閱讀與編輯在同一條流程

Markdown 可以直接切換到原文編輯，使用 `Command+S` 或 `Ctrl+S` 儲存。儲存後會在原地顯示 Saved，不會強迫跳回閱讀畫面；何時退出編輯由使用者決定。

需要對照時，可以開啟即時 Markdown 預覽、拖動中間分隔線，並讓預覽跟著原文的段落位置同步捲動。新增文件則先選擇目的資料夾，再確認檔名與位置；系統不覆寫既有檔案，完成後會重新整理書庫並直接進入編輯。

## 為什麼本機優先仍需要安全設計

「文件不上雲」只是第一層。LumaReader 仍限制 renderer 權限、檢查實際路徑與 symlink 邊界、清理 Markdown 產生的 HTML，並把新增／儲存收斂在受限制的 Electron bridge。儲存時也會比對修改時間，避免外部程式已更新文件後仍被靜默覆蓋。

這些設計不能代表零風險，但能讓權限、輸入與寫入範圍保持可說明、可測試。

## 跨平台交付

目前公開版本提供：

- **macOS Universal**：同時支援 Apple silicon 與 Intel，使用 Developer ID 簽章，經 Apple 公證並附帶 stapled ticket。
- **Windows x64**：提供 Setup 與 Portable。Windows 版本目前沒有付費程式碼簽章，因此 SmartScreen 可能顯示未知發行者提醒；官方頁面與 Release 都明確揭露這項限制。

兩個平台使用同一份產品程式碼，但分別在真正的 macOS 與 Windows runner 建置、啟動與測試。安裝檔存放在 GitHub Releases，SHA-256 校驗碼與下載檔一起發布，不把大型二進位檔提交進 source repository。

## 延伸閱讀與下載

- [產品與下載網站](https://lumareader.kainnne.com/)
- [原始碼](https://github.com/kainnne/Kainnne-LumaReader)
- [最新 GitHub Release](https://github.com/kainnne/Kainnne-LumaReader/releases/latest)
- [[Technical/kainnne-lumareader/02_architecture_and_release_20260824|從本機檔案權限到跨平台發行：LumaReader 架構與交付]]

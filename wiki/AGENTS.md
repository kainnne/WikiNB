---
title: Wiki 內容維護規則
description: WikiNB 筆記、技術文件、時間軸版本與索引的維護規範。
type: note
status: active
tags:
  - WikiNB
  - 維護規則
date: 2026-07-31
---

# Wiki 內容維護規則

本檔案適用於 `wiki/` 與其所有子資料夾。建立、整理、重新命名或刪除 WikiNB
內容時，除了遵守專案根目錄的 `AGENTS.md`，也要遵守以下規則。

## 一、技術文件的時間軸命名

會隨專案演進、需要保留修訂順序的技術文件，使用：

```text
NN_topic_YYYYMMDD.md
```

各欄位意義：

- `NN`：兩位數順序，從 `01` 開始，例如 `01`、`02`、`03`。
- `topic`：小寫英文 snake_case，清楚描述主題。
- `YYYYMMDD`：該版本建立日期，以台北時間為準。

例如：

```text
Roadmap/01_wikinb_roadmap_20260731.md
Roadmap/02_reminder_mvp_20260815.md
Architecture/01_public_private_boundary_20260820.md
Deployment/01_bridge_remote_access_20260901.md
```

這項規則適用於：

- Roadmap 與階段計畫
- 架構決策與重大改版說明
- 部署、安全與遷移計畫
- 需要保留歷史版本的技術評估

一般知識筆記不需要強制使用時間軸格式，仍可使用語意清楚的英文檔名。

## 二、何時建立下一個版本

- 只有錯字、標點或不影響決策的小修正，可以直接修改原檔。
- 若目標、架構、優先順序或執行方案有實質改變，建立下一個 `NN` 文件。
- 新版文件要說明它延續或取代哪一版，舊版保留，不靜默覆蓋歷史。
- 同一系列的 `NN` 必須遞增，不因跨日期而重新從 `01` 開始。
- 建立新版後，在舊版頂端標記其狀態與新版連結。

## 三、Frontmatter

新增一般筆記或技術文件時，至少包含：

```yaml
---
title: 繁體中文標題
description: 一句話說明內容與目的
type: note
status: active
tags:
  - WikiNB
date: YYYY-MM-DD
---
```

Roadmap、架構決策與部署文件使用 `type: note`。只有真正代表學習目標或學習路線的
內容才使用 `type: learning`。

## 四、資料夾與連結

- 技術文件依目的放入 `Roadmap/`、`Architecture/`、`Deployment/` 等資料夾。
- Wiki link 必須包含完整 slug，例如 `[[Roadmap/01_wikinb_roadmap_20260731]]`。
- 重新命名時，同步修正所有指向舊 slug 的 `[[wiki-links]]`。
- 刪除頁面或資料夾時，清除所有失效連結。

## 五、索引維護

每次新增、重新命名或刪除筆記後，都要更新 `wiki/index.md`：

- 更新「最後更新」日期。
- 將一般內容放在「筆記」或「學習中」。
- 將維護規則、Roadmap、架構與部署文件放在「元資料」。
- 不保留指向不存在檔案的連結。

## 六、內容原則

- 技術 Roadmap 要區分優先級、完成條件與暫不處理的範圍。
- 記錄「為什麼」與取捨，不只列出要做的功能。
- 不把構想或履歷版技術棧寫成已經完成的現況。
- 未驗證的安全性、部署狀態或功能要明確標示為規劃中。
- 優先維持 Markdown 可攜性，不讓網站專用 metadata 成為唯一可讀來源。


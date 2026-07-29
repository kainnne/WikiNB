# WikiNB — AI 知識庫維護規則

## 這個專案是什麼

**Kainnne / WikiNB** = 你的**筆記彙整** + **AI 提醒助理**。

流程：

1. 你在外面把筆記整理好（建議含 frontmatter 的 `.md`）
2. 登入網站 → **新增 MD**（選資料夾、拖入檔案）→ **自動推上 GitHub Pages**
3. **Codex** 讀 `wiki/`，幫你回想、複習、延伸思考、提醒下一步

沒有 `raw/` 流程。不上線上編輯器。AI 以 `wiki/` 為主；可自由發揮，不要過度保守。

## 品牌

- 名稱：**Kainnne**
- 標語：一個由 Kaine 設計與維護的個人知識系統。

## 資料夾

```
WikiNB/
├── wiki/          你的筆記（可含子資料夾，例如 wiki/專案/筆記.md）
│   └── index.md   目錄
├── config/
├── docs/
├── bridge/        登入 / Codex / 同步 / 上傳 / 建資料夾 / 刪除
└── src/           網站程式（少動）
```

## 內容類型

| type | 說明 |
|------|------|
| `note` | 已學到、可複習的筆記 |
| `learning` | 想學的目標與路線 |

建議 frontmatter：

```yaml
---
title: 頁面標題
description: 一句話摘要
type: note              # note | learning
status: active
tags:
  - 標籤1
date: YYYY-MM-DD
---
```

### 命名

- 檔名：小寫英文 + 連字號，如 `llm-basics.md`；也可放在子資料夾 `專案/llm-basics.md`
- slug 含路徑：`專案/llm-basics`
- 標題：繁體中文（內容本身是英文除外）
- 元資料頁可用 `meta-` 前綴

## 新增／更新筆記

- **網站「新增 MD」**：選／建資料夾 → 拖入 `.md` → 寫入 `wiki/` **並自動 git push**
- **網站「管理」**：重新命名／刪除／建夾，同樣預設自動推送
- **Codex 拖檔**：同上，自動上線
- **Cursor**：可直接建立／修改 `wiki/**/*.md`、更新 `index.md`，再請使用者用「新增 MD」上傳或協助 commit

當使用者請你「整理／補目錄／刪頁」時：

1. 維護 `wiki/**/[slug].md`（可巢狀）
2. 更新 `wiki/index.md`
3. 清理失效的 `[[slug]]`（slug 可含 `/`）

## Codex 可以幫什麼

- 回想「我寫過什麼」
- 解釋、延伸、複習、出題
- 規劃下一步；可對照 Me 履歷 skills（`../resume-website/v1/data.js`）

## 網站與 Bridge

```bash
npm run dev
npm run build
npm run bridge   # 登入 / Codex / 同步 / 上傳 wiki
```

| 項目 | 說明 |
|------|------|
| 公開站 | https://zx50416.github.io/WikiNB/ |
| 瀏覽 wiki | 不需 Mac |
| 登入／Codex／同步／拖檔 | 需 Bridge + Mac |

同步需 `AUTO_GIT_PUSH=true`（見 `bridge/README.md`）。

## 與 Me 的關係

- **Me**：對外能力證明
- **Kainnne**：對內筆記與 AI 助理

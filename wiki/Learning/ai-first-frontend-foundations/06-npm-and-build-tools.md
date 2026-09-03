---
title: 單元 6：npm 與建置工具——看懂專案如何被組裝
description: 理解 Node.js、npm、package、lockfile、scripts、bundle 與 build 產物，能安全啟動、審查與驗證 Agent 維護的專案。
type: learning
status: active
tags:
  - Frontend
  - npm
  - Build Tools
  - Webpack
  - AI Agent
date: 2026-09-03
updated: 2026-09-03
---

# 單元 6：npm 與建置工具——看懂專案如何被組裝

> 課程首頁：[[Learning/ai-first-frontend-foundations]]

前端專案不只有你看得到的 component 與 CSS。它還依賴 runtime、套件、版本鎖定、啟動指令、環境變數與建置流程。Agent 可以很快執行 `npm install` 或改設定，但若你不知道這些動作改變了什麼，就很難判斷一個專案為什麼在某台機器能跑、部署時卻失敗。

本單元不要求你從零手寫 Webpack 設定。目標是讓你能打開任何常見前端 repository，找出「怎麼安裝、怎麼啟動、怎麼檢查、怎麼產生部署成果」，並知道每項證據的限制。

## 本單元完成條件

完成後，你應該能夠：

1. 分辨 Node.js、npm、package 與 browser 的角色。
2. 閱讀 `package.json` scripts 與 dependency 分類。
3. 說明 lockfile 為什麼是可重現安裝的重要證據。
4. 用 dependency graph、entry、output、loader／transform 與 plugin 理解 bundler。
5. 分辨 dev server、typecheck、test、build 與 production runtime。
6. 要求 Agent 說明安裝或升級造成的完整 diff，而不是只看終端成功訊息。

## Node.js 與 browser 都能跑 JavaScript，但用途不同

Browser runtime 負責頁面、DOM 與使用者互動。Node.js runtime 讓 JavaScript 能在瀏覽器之外執行，前端工具因此可以讀取專案檔案、啟動開發伺服器、執行測試與建置成果。

這不表示使用 Node.js 的程式都會送給使用者。建置工具可能只在開發或 CI 中執行；server 應用可能在 production Node runtime 執行；client bundle 才會被 browser 下載。看到 import 某個 package，必須繼續確認它在哪一個執行環境使用。

## npm 是套件管理與指令入口

npm 常負責兩件事：依照專案描述安裝 packages，以及執行 package scripts。它不是 framework，也不是 build tool 本身；它像一位倉管兼指令櫃台，真正工作由被安裝的工具完成。

常見檔案關係：

```text
package.json
  ├── 專案 metadata
  ├── scripts
  ├── dependencies
  └── devDependencies

package-lock.json
  └── 實際解析出的完整版本與相依樹

node_modules/
  └── 本機安裝的套件內容
```

## `package.json` 是專案操作契約

閱讀時先看 scripts，不要一開始就深入所有 dependencies。

- `dev` 通常啟動本機開發環境，可能包含快速重載與除錯資訊。
- `build` 產生 production 需要的成果，可能同時執行編譯與最佳化。
- `test` 驗證特定行為。
- `lint` 檢查程式規則與常見問題。
- `typecheck` 檢查 TypeScript 契約，有些專案會把它整合進 build。
- `start` 的意義依專案而異，可能啟動 production server，也可能只是另一個本機入口。

名稱只是慣例，真正內容以 script 右側指令為準。Agent 說「測試通過」時，要確認它執行的是哪個 script、涵蓋什麼，而不是只看到命令名稱。

## Dependencies 與 devDependencies

Dependencies 通常代表 production 執行或建置成果需要的套件；devDependencies 通常是開發、檢查、測試或建置工具。不過不同 framework 與部署平台的打包方式不同，不能只憑分類斷定某套件一定不進 production。

重要問題是：誰 import 它、何時執行、部署平台是否會重新安裝它，以及 client bundle 是否包含它。把套件從一區搬到另一區不是單純整理，可能影響 production 安裝。

## Lockfile：把「大概這個版本」變成可重現結果

`package.json` 的版本範圍可能允許多個版本。Lockfile 記錄實際解析出的直接與間接相依版本，使不同機器與 CI 更有機會安裝相同依賴樹。

因此 lockfile 應與 package 變更一起審查。若 Agent 只改 package.json 沒更新 lockfile，或在沒有理由時重寫大量 lockfile，你都應停下來查明。大量 diff 可能來自 npm 版本、lockfile 格式、安裝指令或整棵相依樹重新解析。

## 安裝指令不是完全相同

一般開發安裝可能會依版本範圍更新 lockfile；乾淨安裝則通常要求 lockfile 與 package.json 已一致，並按鎖定內容重建依賴。CI 常偏好後者，因為結果較可重現。

對 AI Agent 的安全要求是：先讀專案既有說明與 lockfile，再選擇指令。不要在診斷單一 build 錯誤時，先刪除 lockfile 或全面升級套件，因為這會同時改變太多變數。

## Build tool 在做什麼

現代前端原始碼可能包含瀏覽器不能直接以相同方式使用的 TypeScript、JSX、CSS modules、圖片 import 與多個 package。Build tool 會讀取入口，追蹤相依關係，轉換內容並輸出適合目標環境的成果。

### Dependency graph

從 entry 開始，每個 import 都形成連線，最後成為相依圖。這張圖讓工具知道哪些程式真的被使用、如何分割以及變更後哪些部分需要重建。

### Entry 與 output

Entry 是分析起點，output 是產物位置與命名方式。應用可能有多個 entry，也可能依 route 自動形成分割點。`dist/` 或其他資料夾只是常見名稱，不是所有專案固定規則。

### Transform／loader

不同工具對名稱不同，概念是把一種輸入轉成可繼續處理或可執行內容，例如 TypeScript 轉成 JavaScript、處理 CSS 或最佳化圖片。

### Plugin

Plugin 通常介入較完整的建置生命週期，例如產生 HTML、注入 metadata、分析 bundle 或複製資產。看到 plugin 要問它改變哪個階段與輸出，不要只看名稱猜用途。

### Bundle 與 code splitting

Bundle 將相關模組組裝成可載入的檔案。全部塞成一包會讓初次下載變大；切得太碎又可能增加 request 與管理成本。Code splitting 讓不同頁面或功能按需要載入，但仍要用實際 Network 與效能證據判斷。

### Source map

建置後程式可能被轉換與壓縮。Source map 協助錯誤回到較接近原始碼的位置。Production 是否公開 source map 是除錯、效能與原始碼暴露之間的部署決策，不能只因方便就一律開啟。

## Dev server 不等於 production

Dev server 為開發速度與回饋最佳化，可能即時轉換檔案、顯示詳細錯誤並使用本機代理。Production build 則更重視最佳化、穩定輸出與實際部署環境。

所以「本機 dev 可以開」不能證明：

- production build 能完成。
- 深層路由在主機重新整理時可用。
- production 環境變數正確。
- 大小寫敏感、路徑與平台 runtime 一致。
- 實際 client bundle 沒有秘密或過大依賴。

## Build 成功究竟證明什麼

Build 成功通常證明工具能在當下環境讀取專案、完成必要轉換並產生輸出。它不證明 API、資料庫、登入、瀏覽器相容性、響應式、可及性與 production 網域都正確。

把證據分層：

1. Typecheck：資料與程式契約沒有已知阻擋錯誤。
2. Test：被測試覆蓋的行為符合預期。
3. Build：能產生 production 成果。
4. Preview：建置成果在接近 production 的環境可執行。
5. Production smoke test：實際網域、環境與服務完成最小關鍵流程。

每一層都重要，也都只能證明自己的範圍。

## 環境變數與公開邊界

環境變數只是配置傳入方式，不自動等於秘密。會被建置進 client bundle 的值，使用者最終可以取得。只有確定在 server runtime 使用、且部署平台沒有暴露給 client 的變數，才適合放 secret。

審查 Agent 時，要求它列出每個變數的使用位置、執行環境與部署來源，不接受「放在 `.env` 所以安全」這種結論。`.env` 也不應被加入公開 Git。

## 與 Agent 協作的提示詞

```text
請先不要安裝、升級或刪除任何依賴。閱讀 README、AGENTS.md、package.json、lockfile、框架與部署設定，整理一張專案啟動／建置卡：

1. 所需 runtime 與版本證據；
2. 安裝指令及 lockfile 策略；
3. dev、lint、typecheck、test、build、preview、start 的實際內容；
4. 原始碼入口、主要轉換與輸出位置；
5. server／client 使用的環境變數邊界；
6. 目前未知或需要執行才確認的部分。

若必須改 dependency，先說明原因、最小版本範圍、lockfile 預期 diff、風險與 rollback。完成後提供實際命令、exit code、輸出摘要與產物證據。
```

## 操作練習：只讀一個專案的建置流程

1. 找出 runtime 版本檔或 README 說明。
2. 閱讀 package.json scripts，逐一用白話翻譯。
3. 找出 lockfile 類型，確認專案預期使用哪個 package manager。
4. 找到 source 入口、build output 與部署設定。
5. 請 Agent 畫 dependency／build 流程，但要求每個結論附檔案證據。
6. 在允許範圍執行 typecheck、test 與 build，分開記錄結果。
7. 檢查 Git diff，確認執行驗證沒有意外改 package 或 lockfile。

## 常見誤判

- 「npm 就是 Node.js」：一個是 package manager／指令入口，一個是 runtime。
- 「package.json 寫了版本，所以每台機器一定相同」：仍需 lockfile 與 runtime 條件。
- 「dependencies 一定進 client bundle」：要看實際 import 與建置邊界。
- 「刪 lockfile 重裝可以修所有問題」：這會失去原本可重現基準並引入大量變數。
- 「dev 成功等於部署成功」：兩者設定、最佳化與 runtime 可能不同。
- 「build 成功等於網站完成」：它沒有覆蓋所有 runtime 與使用者路徑。

## Teach-back 題目

1. Node.js、npm、package 與 build tool 分別是什麼角色？
2. Lockfile 為什麼需要和 package.json 一起審查？
3. Dependency graph 如何幫助 bundler 產生輸出？
4. Dev server 能開啟，為什麼 production 仍可能失敗？
5. `.env` 中的值為什麼不一定是秘密？

上一課：[[Learning/ai-first-frontend-foundations/05-typescript-data-contracts]]

下一課：[[Learning/ai-first-frontend-foundations/07-nextjs-server-client-boundaries]]

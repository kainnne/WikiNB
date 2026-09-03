---
title: 單元 9：除錯、驗收、部署與回復
description: 建立從症狀、證據、假設到最小修正的除錯流程，並以多層驗收、preview、production smoke test 與 rollback 完成安全發布。
type: learning
status: active
tags:
  - Frontend
  - Debugging
  - Verification
  - Deployment
  - Rollback
date: 2026-09-03
updated: 2026-09-03
---

# 單元 9：除錯、驗收、部署與回復

> 課程首頁：[[Learning/ai-first-frontend-foundations]]

一個網站最危險的完成狀態，是「截圖看起來很好，而且 Agent 說完成了」。真正的產品會遇到不同尺寸、真實內容、慢速網路、登入狀態、失敗 response、重新整理與 production 環境。除錯與發布的目的，不是追求永遠不出錯，而是讓問題能被重現、定位、修正、驗證，並在發布失敗時安全回復。

對 AI-first 前端工作者來說，你不必親手修所有 bug，但必須掌握證據鏈。Agent 的解釋只是一個假設，直到 browser、log、test、build 與實際使用結果共同支持它。

## 本單元完成條件

完成後，你應該能夠：

1. 把模糊抱怨整理成可重現症狀。
2. 區分事實、假設、修正與驗證，不因第一個合理故事就停止。
3. 使用 Elements／Styles、Console、Network 與裝置模式取得證據。
4. 理解 lint、typecheck、test、build 各能與不能證明什麼。
5. 用 visual、functional、responsive、accessible、performance、security 六面驗收。
6. 分辨 preview 與 production，寫出 smoke test 與 rollback 條件。

## 除錯是一個縮小可能性的過程

最有效的順序是：

```text
觀察症狀
  ↓
建立可重現步驟
  ↓
收集最接近故障邊界的證據
  ↓
提出能被否證的假設
  ↓
做一個最小改變或對照測試
  ↓
確認原症狀消失且沒有明顯回歸
```

「我覺得是 cache」不是證據；「無痕視窗仍重現，document response 已是新版本，但 API response 保留舊資料」才會縮小範圍。好的除錯不是猜得快，而是每一步都讓可能原因變少。

## 先寫可重現步驟

一份有用的 bug 描述包括：

- 使用的網址、環境與登入狀態。
- 起始條件，例如購物車為空或帳號沒有資料。
- 依序做了哪些操作。
- 實際看到什麼。
- 預期應該看到什麼。
- 是否每次發生，或只在特定尺寸、資料、網路條件出現。
- Console、Network、server log 或截圖中的直接證據。

「手機版壞了」無法驗證；「375px 寬度、標題 28 個中文字時，右側操作超出 viewport 且無法點擊」則可以交給任何人重現。

## DevTools 四個主要視角

### Elements／Styles：結構與實際樣式

用來確認 DOM 是否存在、元素是否被遮住、哪條 CSS 最終生效、尺寸來自哪個盒模型，以及狀態 attribute 是否正確。看不到元素不一定是沒 render，也可能是 display、opacity、overflow、位置或疊放問題。

### Console：browser 執行錯誤與警告

Console 能看到 JavaScript exception、資源問題、框架警告與自行記錄資訊。第一個錯誤通常比後續連鎖錯誤更重要。不要只清空 Console 讓畫面看起來乾淨，也不要把所有 warning 一概視為阻擋；要說明它和症狀的關係。

### Network：request、response 與時間

Network 告訴你 request 是否真的送出、URL／method 是否正確、status、response、cache、redirect 與 timing。若畫面說「沒有資料」，Network 可以幫你區分：沒有 request、request 失敗、成功回空資料，或成功有資料但 UI 沒顯示。

查看時避免把 cookie、Authorization、token 或私人 response 交給不必要的第三方。分享證據只保留狀態、類型、遮蔽後的錯誤與重現步驟。

### Device mode：空間與輸入條件

裝置模式可快速檢查 viewport、觸控與部分網路條件，但不是所有實機差異的完整替代。至少要測窄手機、較寬手機／平板與桌面，並使用長文字、縮放與不同狀態，不只截一張首頁。

## 從症狀選擇第一個證據

| 症狀 | 先看 | 接著排查 |
| --- | --- | --- |
| 完全無法開頁 | document request | DNS／TLS／status／部署 |
| 有內容但無樣式 | CSS request、Styles | asset path／build／cascade |
| 按鈕無反應 | Elements、Console | 元素語意／event／disabled／exception |
| 一直 loading | Network、state | request 是否送出／收尾／錯誤被吃掉 |
| 資料顯示舊版 | Network cache／response | server cache／client state／部署版本 |
| 只在手機重疊 | box model、layout | 長內容／breakpoint／fixed size／overflow |

這張表只提供入口，不提供唯一答案。每一步仍要用觀察決定下一步。

## 分開事實、假設與行動

除錯紀錄可以使用三欄：

| 類型 | 例子 |
| --- | --- |
| 已觀察事實 | 點擊後有 POST；response 是 500；按鈕一直維持 disabled |
| 目前假設 | error path 沒有在 finally 恢復 submitting state |
| 驗證行動 | 檢查事件處理、在測試環境重現 500、只修收尾後再測 |

若驗證不支持假設，就撤回它，不要為了維持原故事繼續堆修正。Agent 容易生成流暢解釋，但流暢不等於因果成立。

## 最小重現與一次一項改變

複雜頁面出錯時，先找出最小仍能重現的資料、viewport、操作與 component。修正也盡量一次處理一個原因。若同時更換套件、重寫 component、改 API 與清 cache，即使問題消失，也不知道哪一步有效，rollback 更困難。

修正後至少做兩種驗證：原失敗路徑已恢復，以及相鄰的成功路徑沒有回歸。只測成功截圖，無法證明 error path 的修正。

## 自動化證據各有邊界

### Lint

檢查程式風格與一部分常見錯誤。通過不代表資料流與產品行為正確。

### Typecheck

檢查靜態契約。通過不代表 runtime 外部資料、權限與使用者操作正確。

### Unit／integration test

證明被寫入測試的輸入與行為。沒有涵蓋的 viewport、browser、資料與整合仍未知。

### End-to-end test

接近真實使用流程，但測試資料、環境與第三方服務可能仍和 production 不同。

### Production build

證明能產生部署成果。它不會自動測完每個 route、登入與 API。

因此完成報告要寫「執行了什麼、結果如何、涵蓋什麼、仍未驗證什麼」，而不是只列綠色勾勾。

## 六面驗收

### Visual

檢查層級、字體、色彩、間距、真實內容與各狀態是否符合規格。比較不只靠像素，也看設計關係是否在內容變動後成立。

### Functional

主要流程、返回、重新整理、重複操作、空資料、失敗與恢復是否正常。確認成功不是只更新畫面，server 結果也真的成立。

### Responsive

不同寬度、方向、長文字、放大與觸控下沒有遮擋、水平捲動或不可操作內容。

### Accessible

語意、標題、可及名稱、鍵盤順序、焦點、表單錯誤、對比與非顏色訊號符合使用者需求。

### Performance

確認主要內容何時可見、互動何時可用、圖片與 bundle 是否合理，以及慢速條件下是否提供穩定回饋。沒有量測不要宣稱「已最佳化」。

### Security

檢查 secret、權限、輸入驗證、錯誤資訊、依賴與公開資料。隱藏按鈕不是授權；`.env` 不保證值不進 client；測試資料也不能包含真實秘密。

## Preview 是正式發布前的共同證據

Preview 應使用 production build 與接近 production 的設定，讓你在公開前檢查真實 URL、route、資產、環境變數與服務整合。它不是自動安全沙盒：如果連到 production 資料庫或第三方付費服務，仍可能造成實際影響。

Preview 驗收至少包括：

- 直接開啟主要與深層 route。
- 重新整理與返回。
- 主要成功流程與一條安全失敗路徑。
- 窄／中／寬 viewport。
- Console 與 Network。
- 版本或 commit 可追溯。

## Production smoke test

部署成功訊息只代表平台完成流程。上線後應在正式網域做最小、高價值、低風險檢查：首頁與主要 route 可開、靜態資產成功、登入或核心讀取正常、沒有大量 Console／server error、部署版本正確。

Smoke test 不應破壞真實資料。涉及寄信、付款、刪除或外部通知時，使用專用測試帳號、沙盒或其他受控方法。

## Rollback 要在發布前寫

Rollback 是「遇到什麼條件，要如何回到哪個已知良好版本，回去後怎麼驗證」。如果等事故發生才思考，當下會同時承受壓力與資訊不足。

一張 rollback 卡包括：

- 本次版本／commit／deployment id。
- 前一個已知良好版本。
- 觸發條件，例如核心 route 無法開啟、登入全面失敗、資料寫入錯誤或秘密暴露。
- 回復方式與需要權限。
- 資料庫 schema 或外部副作用是否向後相容。
- 回復後 smoke test。
- 若不能直接回復，應採取的停止流量、停用功能或修補策略。

前端檔案回復不代表資料庫與 API 一定能一起回到舊狀態。跨系統變更要先確認相容性。

## 與 Agent 協作的提示詞

```text
請把目前問題分成：已觀察事實、尚未證明的假設、下一個最小驗證。先建立可重現步驟，不要先全面重寫或升級依賴。

修正前說明：
- 故障最可能在哪個邊界；
- 將查看的 Elements／Console／Network／server log 證據；
- 最小修改範圍；
- 如何證明原失敗路徑恢復且相鄰功能未回歸。

完成後提供六面驗收、實際命令與 exit code、preview 結果、未驗證項目，以及 production 發布前的 rollback 卡。沒有證據的地方請標成未知，不要寫「應該沒問題」。
```

完整證據模板：[[Learning/ai-first-frontend-foundations/toolkit]]

## 結業練習：完成一次小型發布

1. 選一個可安全修改的小網站功能。
2. 使用單元 8 的 brief 定義範圍與 acceptance criteria。
3. 刻意保留一個可控的 API failure 或 responsive 問題作為除錯題。
4. 寫出重現步驟，分開事實、假設與驗證。
5. 讓 Agent 只做最小修正，審查 diff。
6. 完成 lint、typecheck、test、build 與六面驗收。
7. 在 preview 測主要 route、成功與安全失敗路徑。
8. 寫 rollback 卡後才發布。
9. 在 production 做低風險 smoke test，記錄版本與結果。
10. 用自己的話說明：這次最重要的三項證據，以及仍未被證明的部分。

## 常見誤判

- 「Agent 已找到 root cause」：若沒有對照或驗證，它仍只是合理假設。
- 「Console 沒錯就完成」：Network、server、視覺、鍵盤與資料仍可能失敗。
- 「所有測試通過就能直接上線」：production 環境與未覆蓋路徑仍需驗收。
- 「部署平台顯示成功就是網站正常」：仍要正式網址 smoke test。
- 「Git revert 一定能完整 rollback」：資料庫、外部副作用與環境設定可能不相容。
- 「一次多修幾個地方比較快」：會失去因果、審查與回復能力。

## Teach-back 題目

1. 事實、假設、修正與驗證如何分開？
2. 同樣是「資料沒出現」，Network 可以協助區分哪些原因？
3. Lint、typecheck、test 與 build 各不能證明什麼？
4. Preview 與 production smoke test 的角色有何不同？
5. 一張可執行 rollback 卡至少需要哪些資訊？

上一課：[[Learning/ai-first-frontend-foundations/08-agent-task-design]]

回到課程首頁：[[Learning/ai-first-frontend-foundations]]

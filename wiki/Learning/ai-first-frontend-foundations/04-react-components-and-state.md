---
title: 單元 4：React——元件、props、state 與 Effect 邊界
description: 從介面拆解理解 component、props、state、render、event 與 Effect，建立可預測而不過度抽象的互動模型。
type: learning
status: active
tags:
  - Frontend
  - React
  - Components
  - State Management
  - AI Agent
date: 2026-09-03
updated: 2026-09-03
---

# 單元 4：React——元件、props、state 與 Effect 邊界

> 課程首頁：[[Learning/ai-first-frontend-foundations]]

React 的價值不是讓網站自動變漂亮，也不是把 HTML 換成比較高級的語法。它提供一種思考互動介面的方式：把畫面拆成元件，讓資料從清楚的位置流入，讓狀態改變後重新描述畫面應該長什麼樣子。

對有設計背景的人來說，component 很容易被理解成 Figma component；這個類比有幫助，但還不完整。前端 component 除了可重用外觀，還包含資料輸入、狀態、事件與生命週期。兩個畫面看起來一樣，不代表它們一定要共用同一個 component；真正要看的是責任與變化方式是否相同。

## 本單元完成條件

完成後，你應該能夠：

1. 從一個頁面畫出合理的 component tree，並解釋拆分依據。
2. 分辨 props、state 與可由它們計算出的 derived data。
3. 說明 event handler、render 與 Effect 分別適合處理什麼。
4. 找出重複 state、過度提升 state 與不必要 Effect。
5. 判斷 key 如何影響清單項目的身分。
6. 要求 Agent 用四張表說明元件，而不是只交付程式碼。

## Component 是具有責任邊界的 UI 單位

一個好的 component 通常能用一句話說清楚責任，例如「顯示一筆搜尋結果並回報選取事件」或「收集登入資料並呈現送出狀態」。如果描述變成「處理所有資料、導覽、通知與五種頁面」，邊界可能太大；如果每個字、每條線都被拆成 component，則可能太碎。

判斷是否拆分，可以看四個訊號：

- 這一塊是否在多處以相同責任重複出現。
- 它是否有自己的資料輸入與狀態。
- 它是否會獨立變動或需要獨立測試。
- 拆出後，名稱是否能比原本結構更清楚。

可重用不是唯一目的。即使只使用一次，一個責任清楚的大區塊仍可能值得獨立成 component；反過來，只因兩處外觀相似就硬共用，可能產生大量條件參數。

## JSX 是畫面描述，不是字串模板

JSX 讓 component 在 JavaScript 中描述目前應呈現的元素樹。它看起來像 HTML，但能插入資料、條件與其他 component。重點不是背 JSX 規則，而是知道 render 輸出應該由目前 props 與 state 決定。

理想上，相同的 props 與 state 應產生相同的畫面描述。Render 期間不應偷偷送出 request、修改外部資料或依賴無法追蹤的副作用，否則 React 重新計算畫面時就可能重複執行不該重複的工作。

## Props：父層交給子層的輸入

Props 可以理解成 component 的公開介面。父層決定要傳入什麼，子層讀取後呈現或回報事件。子層不應直接改寫收到的 props，因為資料所有權仍在父層。

一份好的 props 表不只是列型別，還會說明：

| Prop | 意義 | 是否必要 | 可能值 | 缺少時行為 |
| --- | --- | --- | --- | --- |
| title | 卡片主要名稱 | 是 | 非空文字 | 不應 render 這筆資料 |
| status | 目前狀態 | 是 | draft／published | 決定狀態標示 |
| onOpen | 使用者開啟卡片時回報 | 否 | function | 卡片不提供互動 |

如果一個 component 有十多個布林 props，例如 `isLarge`、`isCompact`、`isBlue`、`isSpecial`，往往表示設計 variant 尚未整理成清楚模型。

## State：component 需要記住的變動資訊

State 改變時，React 會重新計算相關 UI。不是所有變數都該是 state。要成為 state，通常同時符合：它會隨時間改變，而且改變後會影響 render。

例如商品清單與搜尋字是 state，篩選後清單通常可以由兩者直接計算，不必再存一份。如果把原始清單、搜尋字與篩選結果都各自存成 state，就必須確保每次更新都同步，容易產生畫面顯示舊結果。

### 最小 state 原則

問三題：

1. 這個值能不能直接從 props 或其他 state 算出來？
2. 它是否真的會改變？
3. 它是否影響畫面或後續互動？

只保留不能推導、需要被記住的最小集合。這會讓 Agent 需要維護的同步關係變少。

## State 應該放在哪一層

如果只有一個 component 使用某狀態，就盡量放在該 component。若兩個兄弟 component 都需要同一份狀態，通常提升到最近共同父層，再透過 props 傳下去。

把所有 state 都放在頁面最上層看似集中，實際會讓任何小變化都穿越很多層；把同一資料複製到不同子元件，又會失去單一來源。正確位置是「能完整擁有這份狀態、且離使用者不過遠的最低共同層」。

## Render 是重新計算 UI，不是整頁重畫

State 改變時，React 會呼叫相關 component，取得新的 UI 描述，再把必要差異提交到 DOM。重新 render 不代表整個頁面 DOM 被刪除重建，也不代表免費無成本。

你應關注的不是「render 次數一定要最少」，而是 render 是否純粹、範圍是否合理、重計算是否真的昂貴，以及 DOM identity 是否被意外破壞。過早加入 memoization 可能增加複雜度，卻沒有實際效益。

## Event handler：回應明確發生的操作

使用者按下「送出」所造成的資料提交，最自然的位置通常是 submit event handler。Event handler 知道是哪一次操作、當時輸入與意圖是什麼，也能直接控制 loading、成功與失敗狀態。

如果 Agent 先改一個 state，再用 Effect 監聽 state 變化送出 request，因果鏈會變得間接：之後任何地方改到該 state 都可能重新觸發工作。能在事件發生當下完成的事，通常留在 event handler。

## Effect：讓 React 與外部系統保持同步

Effect 適合處理 React 之外、需要隨 component 狀態保持同步的系統，例如訂閱外部事件、控制非 React widget、依可見狀態建立或清除連線。

Effect 的思考方式不是「畫面載入後要做什麼」，而是：目前這組 props／state 要求外部系統處於什麼狀態？Effect 建立同步，cleanup 撤銷前一次同步。

常見不必要 Effect：

- 用 Effect 計算可由 props／state 直接得出的值。
- 用 Effect 處理特定按鈕點擊造成的工作。
- 用 Effect 把一份 state 複製到另一份 state。
- 為了控制執行次數而隱瞞 dependency。

Dependency 不是「我希望何時執行」的開關，而是 Effect 實際讀取哪些反應式值的聲明。缺少 dependency 可能讀到舊值，過度依賴物件或 function identity 則可能反覆重連。

## Ref：保存不直接驅動畫面的值

Ref 可以指向 DOM 元素，或保存跨 render 仍需保留、但改變時不需要更新畫面的資料。例如把焦點移到 input、保存 timer id 或記錄先前值。

若一個值改變後畫面應更新，就不該只放在 ref；否則 React 不知道要重新 render。大量用 ref 繞過 state，會讓資料流變得不可見。

## Key：清單項目的身分證

React 需要 key 判斷一筆清單資料在前後兩次 render 中是不是同一個項目。穩定的資料 id 通常是好 key。使用陣列位置當 key，在插入、刪除或排序時可能讓輸入狀態、焦點或動畫錯置。

Key 不只是消除警告。它決定 component instance 是否被保留；改變 key 也能有意重設 component state，但應清楚知道這個效果。

## React 四表：讓 Agent 的設計可以審查

### Component tree

列出頁面如何拆分，以及每個 component 的一句話責任。

### Props 表

列出輸入、資料意義、是否必要、變體與 callback。

### State 表

列出擁有者、初始值、允許狀態、改變事件與是否可推導。

### Event 表

列出使用者動作、處理位置、資料變化、外部工作與畫面回饋。

四表能在寫程式前暴露矛盾：某個 state 沒有擁有者、同一事件由兩層處理，或一項 derived data 被重複保存。

## 與 Agent 協作的提示詞

```text
請先以 component tree、props 表、state 表與 event 表描述這個互動頁面，不要先實作。

要求：
- 每個 component 只有可說明的責任；
- state 保留最小集合，能推導的資料不重複保存；
- 特定使用者操作留在 event handler；
- Effect 只用於同步外部系統，列出 dependency 與 cleanup；
- 清單使用穩定 key；
- 說明 state 為什麼放在目前層級。

我確認模型後再實作。完成時逐一把四表對應到檔案與程式位置，並提供主要互動、錯誤狀態與鍵盤焦點的驗證證據。
```

## 操作練習：拆解一個表單或清單

1. 先畫出 component tree，不超過能清楚說明的層級。
2. 列出所有畫面資料，標記來自 props、state 或 derived data。
3. 找到每份 state 的唯一擁有者。
4. 列出 click、input、submit、retry 等事件。
5. 圈出所有 Effect，逐一問是否真在同步外部系統。
6. 刻意新增、刪除或重新排序清單，觀察 key 是否造成狀態錯置。
7. 讓 Agent 修正一個不必要 Effect 或重複 state，檢查 diff 與行為。

## 常見誤判

- 「越多 component 越模組化」：拆分若沒有責任意義，只會增加追蹤成本。
- 「所有變動資料都是 state」：可推導資料不應重複保存。
- 「Effect 就是初始化」：它是與外部系統的同步機制，可能需要重跑與清理。
- 「dependency 空陣列保證安全只跑一次」：Effect 仍可能讀到未聲明的值，開發模式行為也可能揭露清理問題。
- 「index 當 key 比較方便」：順序變動時可能保留錯誤 component 身分。
- 「render 多就是效能問題」：先量測真實瓶頸，不用複雜度交換假想效能。

## Teach-back 題目

1. Component 與單純把一段 JSX 抽成檔案有什麼不同？
2. Props、state 與 derived data 如何分辨？
3. 為什麼一次表單提交通常不需要 Effect？
4. Effect 的 cleanup 解決什麼問題？
5. 清單重新排序時，index key 可能造成什麼使用者可見錯誤？

上一課：[[Learning/ai-first-frontend-foundations/03-javascript-data-and-async]]

下一課：[[Learning/ai-first-frontend-foundations/05-typescript-data-contracts]]

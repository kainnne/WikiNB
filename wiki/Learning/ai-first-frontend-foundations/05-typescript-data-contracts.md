---
title: 單元 5：TypeScript——把想法變成資料契約
description: 用型別描述資料形狀與可能狀態，理解 inference、union、narrowing、unknown 及 runtime validation 的邊界。
type: learning
status: active
tags:
  - Frontend
  - TypeScript
  - Data Contracts
  - Runtime Validation
  - AI Agent
date: 2026-09-03
updated: 2026-09-03
---

# 單元 5：TypeScript——把想法變成資料契約

> 課程首頁：[[Learning/ai-first-frontend-foundations]]

許多前端錯誤不是因為語法寫錯，而是兩個部分對資料有不同想像：畫面以為 `user.name` 一定存在，API 卻可能回傳 `null`；component 以為按鈕狀態只有 enabled／disabled，產品實際還有 loading；Agent 以為 `id` 是數字，資料庫卻使用字串。

TypeScript 的核心價值，是把這些想像提早寫成可檢查的契約。它不能保證產品一定正確，但能在程式執行前，指出某些資料流彼此不相容。

## 本單元完成條件

完成後，你應該能夠：

1. 把 type error 翻譯成「哪兩邊的契約不同」。
2. 看懂 inference、annotation、object shape、optional 與 union 的用途。
3. 解釋 narrowing 如何把未知可能性縮小到可安全操作的範圍。
4. 分辨 `any`、`unknown` 與 `as` 的風險。
5. 說明 TypeScript 為什麼不能驗證 API runtime 資料。
6. 要求 Agent 修正真正的契約，而不是用斷言消除紅線。

## 型別是「允許哪些值」的集合

把型別想成一個允許集合。`string` 允許文字，`number` 允許數字；literal type 可以只允許特定值，例如 `"idle" | "loading" | "success" | "error"`。

當 TypeScript 報錯，通常是在說：你要放進去的值，不屬於這個位置允許的集合。真正的問題可能在提供者，也可能在接收者，不能看到錯誤就直接放寬型別。

例如畫面需要每位使用者都有 email，但 API 契約允許 email 缺少。你有三種產品決策：讓 email 變必填、讓畫面處理缺少狀態，或在中間排除不完整資料。型別錯誤迫使你選擇，而不是替你選擇。

## Inference 與 annotation

TypeScript 經常能從初始值與使用方式推論型別，這叫 inference。你不需要為每個變數手寫型別。Annotation 則是在推論不足、需要公開契約或希望限制範圍時明確標註。

過度 annotation 會讓程式冗長並重複資訊；完全不寫公開邊界又可能讓 API、props 與函式輸入難以理解。實務上，區域內讓 inference 工作，在 component props、函式參數、外部資料與共享模型等邊界清楚定義契約。

## Object shape：欄位不只是名稱

一個資料物件的 shape 包含：

- 有哪些欄位。
- 每個欄位允許什麼值。
- 欄位是否可能不存在。
- 是否可能為 `null`。
- 巢狀物件與清單的形狀。

Optional 表示欄位可能不存在，不等於欄位一定存在但值為空。`undefined`、`null`、空字串與空陣列也有不同產品意義。不要為了方便全部視為「沒有」。

## Union：把可能狀態列完整

Union 允許一個值屬於多種明確型別。它很適合描述 UI 狀態與不同資料變體。

```text
idle
loading
success + data
error + message
```

這比多個彼此可能矛盾的 optional 欄位更清楚。進一步可以使用共同的辨識欄位，例如 `status`，讓每一種狀態只攜帶合理資料：loading 不應假裝已有完成結果，success 不應同時要求 error message。

對設計者而言，這就是把狀態矩陣直接變成程式契約。漏掉 empty 或 error，不再只是設計稿缺頁，而會在某些處理邏輯中被看見。

## Narrowing：先證明，再使用

當一個值可能是多種型別，程式要透過條件檢查縮小可能性。例如先確認值不是 null、先檢查 `typeof`，或根據 `status` 判斷目前是哪一種狀態。通過條件後，TypeScript 才允許使用該型別專屬的欄位或方法。

Narrowing 的觀念非常適合審查 Agent：它是在有證據後使用資料，還是先假設資料一定符合？真正安全的程式會讓檢查與使用位置具有清楚關係。

## Type 與 interface：先看契約，不背陣營

`type` 與 `interface` 都能描述常見 object 契約，各自也有適合的組合與擴充方式。對初學者來說，最重要的不是選邊，而是團隊在同一類資料上保持一致，並確保名稱、欄位與擴充方式容易理解。

可以先採用簡單原則：若專案已有慣例就沿用；描述一般資料形狀時選團隊較常使用的方式；需要 union、tuple 或其他型別組合時 type alias 很自然。不要讓 Agent 花大量 diff 只為了在兩者之間機械轉換。

## Function contract：輸入與輸出都要可解釋

函式型別不只是讓參數有紅線。它描述呼叫者需要提供什麼、函式承諾回傳什麼，以及工作是否可能沒有結果或失敗。

如果函式可能找不到資料，回傳契約應表達這個可能性，而不是宣告一定回傳，再於 runtime 意外得到 undefined。若一個非同步函式可能拋出錯誤，呼叫端也需要有相對應的使用者狀態與錯誤邊界。

## `any`、`unknown` 與 `as` 的差別

### `any`：暫停檢查

`any` 幾乎讓 TypeScript 放棄對該值的保護，錯誤會沿資料流擴散。它有時用於遷移，但不能被當成消除錯誤的快速修復。若 Agent 新增 any，應要求說明原因、範圍與移除條件。

### `unknown`：承認不知道

`unknown` 表示目前無法信任其型別，使用前必須檢查與 narrowing。對 API response、JSON parse 或第三方輸入，unknown 常比 any 更符合事實。

### `as`：告訴編譯器「相信我」

Type assertion 不會在 runtime 檢查資料，也不會轉換資料。它只是改變 TypeScript 對值的看法。當斷言錯誤，typecheck 可能通過，實際執行仍會失敗。

審查時看到 `as SomeType`，要問：程式已經用什麼證據知道它是 SomeType？如果答案只是「API 應該會回」，那不是證據。

## TypeScript 與 runtime validation 的邊界

TypeScript 型別在編譯後通常不會以相同形式存在。外部 API、local storage、URL 參數與使用者輸入不會因為你寫了 interface 就自動符合。

安全流程是：

```text
外部未知資料
  ↓ runtime 檢查／schema 驗證
已確認的資料形狀
  ↓ TypeScript 在內部維持契約
component 與商業邏輯安全使用
```

Runtime validation 要檢查真正影響功能與安全的欄位，並決定資料不合格時是拒絕、採用預設值、忽略該筆，還是顯示可恢復錯誤。不是所有內部物件都要重複驗證，重點在不可信邊界。

## 把 UI、API 與表單契約連起來

一個欄位可能同時存在三種契約：

- UI contract：使用者看見什麼、是否必填、錯誤怎麼說。
- Type contract：程式內允許哪些值。
- Runtime contract：API 或輸入實際如何驗證與拒絕。

三者必須一致。畫面寫「選填」但 TypeScript 規定必填，Agent 可能塞空字串；型別允許 undefined 但 server 拒絕缺少欄位，則會在 runtime 才暴露。設計與型別不是兩套世界。

## 閱讀 type error 的四步驟

1. 找到「實際提供的型別」。
2. 找到「此位置要求的型別」。
3. 比較最內層真正不相容的欄位或可能值。
4. 回到產品契約，判斷應修提供方、接收方，還是增加驗證與分支。

不要只看最上面一行，也不要直接請 Agent「讓 TypeScript 通過」。目標是讓契約符合真實產品，不是消除診斷訊息。

## 與 Agent 協作的提示詞

```text
請先把這個 TypeScript 錯誤翻譯成白話：實際值、預期契約、最小不相容位置，以及它反映的產品決策。

提出修正時：
- 不使用 any；
- 不用 as 隱藏尚未證明的外部資料；
- 不為了通過檢查把必要欄位全部改成 optional；
- 外部資料先做 runtime validation 或明確 narrowing；
- UI 的 loading／empty／error／success 與型別狀態一致。

完成後提供 typecheck 結果、相關測試與一條不合法資料的 runtime 行為證據。
```

## 操作練習：翻譯一個刻意失敗的契約

1. 選一個 typecheck 錯誤，不先讓 Agent 修。
2. 圈出提供值與接收位置。
3. 用白話寫：「這邊可能是 X，但那邊只接受 Y。」
4. 判斷哪個契約更符合產品事實。
5. 請 Agent提出至少兩種修法與取捨。
6. 拒絕 any、無證據斷言與全面 optional 化。
7. 修正後執行 typecheck，並用一筆邊界資料驗證 runtime。

## 常見誤判

- 「TypeScript 通過，所以 API 資料安全」：外部資料仍需 runtime 驗證。
- 「紅線太多就加 any」：錯誤只是從目前位置轉移到更難追的地方。
- 「as 會把資料轉成指定型別」：它不會改變 runtime value。
- 「所有欄位 optional 比較彈性」：這會把不完整狀態擴散給每個使用者。
- 「type 和 interface 一定有唯一正解」：實際應看資料角色、組合需求與專案一致性。
- 「型別越複雜越專業」：契約應服務理解，過度技巧化會讓人與 Agent 都難以維護。

## Teach-back 題目

1. Type error 如何揭露兩個部分對資料的不同想像？
2. `undefined`、`null`、空字串與空陣列為什麼不能一律當成相同？
3. Union 與 narrowing 如何協助建模 UI 狀態？
4. `unknown` 為什麼比 `any` 更誠實？
5. TypeScript 與 runtime validation 各保護哪一段資料流？

上一課：[[Learning/ai-first-frontend-foundations/04-react-components-and-state]]

下一課：[[Learning/ai-first-frontend-foundations/06-npm-and-build-tools]]

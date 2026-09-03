---
title: 單元 0：從需求到像素的網站系統地圖
description: 先理解網址、瀏覽器、server、HTML、CSS、JavaScript、API、build 與 runtime，再開始學框架。
type: learning
status: active
tags:
  - Frontend
  - Web Fundamentals
  - DevTools
  - AI Agent
date: 2026-09-02
updated: 2026-09-03
---

# 單元 0：從需求到像素的網站系統地圖

> 課程首頁：[[Learning/ai-first-frontend-foundations]]

當你看到一個完成度很高的網站，最容易產生的錯覺是：設計稿或程式碼就是網站本身。其實使用者看到的畫面，是需求、原始碼、建置工具、伺服器、網路、瀏覽器與資料服務共同合作的結果。任何一層中斷，都可能出現「程式看起來沒問題，但使用者就是不能用」的情況。

對 AI-first 的前端工作者來說，第一項基本功不是背語法，而是擁有一張系統地圖。Agent 可以很快產生檔案，但你要知道它改的是哪一層、那一層與其他部分如何連接，以及什麼證據才足以證明結果真的成立。

## 本單元完成條件

你不需要背出完整網路協定，但要能用自己的話回答：

1. 瀏覽器輸入網址後，至少發生哪五件事？
2. HTML、CSS、JavaScript 與 API 各自故障時，畫面可能怎麼壞？
3. React、TypeScript、Webpack、Next.js 分別位於哪一層？
4. Agent 說「build 成功」時，為什麼還不能直接等於「網站完成」？

## 一張心智圖

```text
人的需求
  ↓ 轉成頁面、內容、狀態與驗收規格
專案原始碼
  ↓ TypeScript／框架／建置工具檢查與轉換
可部署產物或可執行伺服器
  ↓ 部署平台與網域
瀏覽器送出 request
  ↓ server 回傳 document、assets、data
瀏覽器解析 HTML + CSS，執行 JavaScript
  ↓ DOM／樣式／互動更新
使用者看到像素並完成任務
```

每個箭頭都可能成功或失敗。前端基本功不是把工具名稱背完，而是知道問題在哪個邊界、要看什麼證據。

## 輸入網址後，實際發生了什麼

先把瀏覽器想成一個會主動工作的「閱讀器兼執行環境」，而不是被動顯示圖片的畫框。當你輸入一個網址並按下 Enter，大致會經過以下流程。

### 1. 瀏覽器先找出要聯絡誰

網址中的網域名稱方便人記憶，但網路需要找到實際提供服務的位置。瀏覽器會透過名稱解析取得可連線的位置，再建立連線。若網站使用 HTTPS，雙方還會先確認加密連線與網站身分。這一段失敗時，你可能連 HTML 都拿不到，只會看到無法連線、憑證錯誤或找不到主機。

### 2. 瀏覽器送出 request

Request 不只是「我要這個頁面」。它至少包含目標路徑、方法、可接受的內容，以及瀏覽器或登入狀態相關資訊。常見的 GET 表示取得資源，POST 通常表示送出資料或觸發一項工作。Request 是否能成功，取決於路徑、權限、資料格式與伺服器狀態。

### 3. Server 回傳 response

Response 包含狀態碼、headers 與內容。狀態碼是系統給系統看的快速摘要：成功、重新導向、使用者端請求有問題，或伺服器處理失敗。真正的內容可能是 HTML、JSON、圖片或其他檔案。看到 `200` 只代表這個 request 得到成功回應，不代表整個頁面所有功能都正確。

### 4. HTML 引出更多資源

瀏覽器拿到 document 後會解析 HTML，建立 DOM。HTML 中若引用 CSS、JavaScript、字型或圖片，瀏覽器還會再送出更多 request。因此一個網址通常不是只對應一個網路請求，而是一連串具有先後與相依關係的請求。

### 5. 瀏覽器計算結構與樣式

DOM 表示內容與元素之間的樹狀關係；CSS 會形成可用的樣式規則。瀏覽器把結構與樣式合在一起，計算每個可見元素的位置、尺寸、字體與顏色，再把結果繪製成像素。當視窗尺寸改變、字型載入或內容增加時，部分計算可能重新進行。

### 6. JavaScript 讓畫面能回應與改變

JavaScript 可以監聽點擊與輸入、請求資料、修改狀態，再讓畫面更新。它不是所有網站「顯示內容」的必要條件，但現代互動式網站通常高度依賴它。JavaScript 失敗時，有時仍能看到 HTML 與 CSS，卻無法打開選單、提交表單或載入新資料。

### 7. 使用者完成的不是「看見畫面」，而是任務

網站真正的完成條件不是像素出現，而是使用者能理解內容、操作功能並在失敗時知道如何繼續。例如購物頁的圖片都顯示了，但加入購物車失效，仍然不是一個完成的產品。這也是為什麼截圖只能證明視覺的一小部分。

## Client 與 server 是工作位置，不是好壞選擇

Client 在這門課裡通常指使用者的瀏覽器；server 指瀏覽器之外、負責回應請求與處理受保護工作的環境。兩邊都能處理資料，但條件不同。

- Browser 看得到使用者操作，也能使用 DOM、視窗與本機儲存等 API。
- Server 可以安全接觸資料庫、私密金鑰與內部服務，但不能直接感知使用者目前點了哪個 DOM 元素。
- 送到 browser 的 JavaScript 最終能被使用者下載與檢查，所以 secret 不能因為「藏在程式碼裡」就被視為安全。
- 放在 server 的工作通常要經過網路往返；放在 client 的工作則會增加下載與執行負擔。

因此你要問的不是「server 比 client 專業嗎」，而是「這項工作需要什麼能力、會接觸什麼資料、失敗時在哪裡留下證據」。

## 各層只先記一件事

| 名稱 | 本單元的白話定義 | 出問題時先看 |
| --- | --- | --- |
| HTML | 內容與語意結構 | Elements、document response |
| CSS | 排版與視覺規則 | Styles、計算後樣式、viewport |
| JavaScript | 行為、資料處理與互動 | Console、Sources |
| API | 前端與資料服務的請求契約 | Network 的 URL、method、status、response |
| React | 用元件與狀態組合互動 UI 的 library | component／props／state／event |
| TypeScript | 在執行前檢查資料與程式介面契約 | typecheck error、型別定義 |
| Webpack | 從相依入口建立圖並輸出可服務 assets 的 bundler | build log、entry／output／loader／plugin |
| Next.js | 在 React 之上提供路由、render、server 能力與建置慣例的 framework | route、server／client boundary、build／runtime log |

## Library、framework、runtime 與工具鏈的差別

初學者常把所有安裝進專案的東西都叫做「框架」。這會讓 Agent 的解釋聽起來都差不多，也讓你難以判斷替換一個工具會影響哪裡。

- **Library** 是你在需要時呼叫的能力。React 提供描述與更新 UI 的方法，但不單獨決定完整專案如何路由、部署或存取資料。
- **Framework** 提供較完整的結構與慣例。Next.js 會規定某些檔案如何形成路由、哪些工作可在 server 執行，以及如何建置應用。
- **Runtime** 是程式實際執行的環境，例如 browser 或 Node.js。相同 JavaScript 語言在不同 runtime 能使用的 API 不完全相同。
- **Package** 是被版本化與安裝的程式單位。它可能是一個 library、工具、插件或型別定義。
- **Build tool** 讀取專案原始碼並產生適合執行或部署的成果。它處理的可能包括轉換、分割、壓縮、資源命名與錯誤對應。

判斷一個名詞時，可以問三題：它在哪裡執行？誰呼叫誰？移除它之後，是少一項能力，還是整個專案結構都必須改變？

## 三種「東西」不要混在一起

### 1. 原始碼

人與 Agent 維護的內容，例如 component、CSS、TypeScript、圖片與設定檔。瀏覽器不一定會原樣收到它。

### 2. Build 產物

工具會檢查、轉換、切割、命名或壓縮原始碼，輸出例如 `dist/`、bundle 與 source map。這一層解決的是「如何把開發材料組裝成可執行或可部署成果」。

### 3. Runtime 狀態

網站真正執行時發生的事：請求 API、使用者點擊、資料成功或失敗、server log、browser console。Build 通過只能證明建置階段沒有阻擋錯誤，不能證明所有 runtime 路徑、畫面與可及性正確。

## 四種常見故障，畫面看起來會不一樣

| 故障位置 | 使用者可能看到 | 最先查看的證據 |
| --- | --- | --- |
| Document／HTML | 空白、錯誤頁、舊頁面或完全無法連線 | Network 第一個 document 的 URL、status、response |
| CSS／字型 | 內容存在但排版錯亂、無樣式、文字跳動 | Network 資源狀態、Elements 的實際套用樣式 |
| JavaScript | 靜態內容可見，但按鈕、選單或互動失效 | Console 錯誤、Sources、事件重現步驟 |
| API／資料 | 頁面外框正常，但清單空白、持續 loading 或顯示錯誤 | Fetch／XHR 的 method、status、response 與 timing |

這張表的重點不是讓你看到症狀就直接猜答案，而是幫你決定第一個檢查位置。相同症狀可能有不同原因。例如清單空白可能是 API 失敗，也可能是資料真的為空，或 JavaScript 在收到資料後處理出錯。要用證據逐步排除。

## SSR／CSR 先不要當成二選一

初學時常把 SSR 與 CSR 當成對比，但真正需要判斷的是：內容在哪裡準備、資料在哪裡取得、互動在哪裡執行。同一頁可以混合 server 與 client 工作：

- page 與 layout 預設可在 server 產生內容、取資料與保護 secret。
- 需要點擊狀態、Effect、`window` 或其他 browser API 的互動區才建立 client boundary。
- 首次載入可先收到 HTML，之後再 hydration，讓 client 互動生效。
- 靜態、快取、動態與串流也可能同時存在，不能用固定的「server 幾成、client 幾成」描述所有網站。

對你最實用的判斷方式是把一頁拆成幾個問題：使用者第一次收到什麼？資料在哪裡取得？哪一塊需要即時互動？哪些內容含有 secret？哪些結果可以預先準備或快取？這些答案會形成多個邊界，而不是把整個網站一次貼上 SSR 或 CSR 標籤。

## 為什麼 AI Agent 時代反而更需要這張地圖

Agent 很容易一次改動 component、API、環境變數與部署設定。沒有系統地圖時，你只能依賴它的完成摘要；有地圖時，你可以把每個聲明轉成可驗證問題。

例如 Agent 說：「我已完成登入頁並成功 build。」你應該繼續問：

1. 登入表單的 HTML 語意與鍵盤操作正確嗎？
2. request 送到哪個 endpoint，成功與失敗狀態各是什麼？
3. token 儲存在哪裡，client bundle 是否含有不應公開的 secret？
4. build 產物與本機 dev server 有何不同？
5. preview 環境是否真的完成登入與重新整理測試？

這不是不信任 Agent，而是把合作從「相信一句話」改成「共同檢查同一組邊界」。

## 操作練習：第一次只觀察，不改程式

選一個你熟悉的公開網站，建議先用 WikiNB。

1. 打開瀏覽器 DevTools 的 Network，重新整理頁面。
2. 找到 Type 為 document 的第一個請求，記錄 status 與 response type。
3. 找一個 CSS、一個 JavaScript、一張圖片；若網站沒有其中一類，記錄「沒有」而不是猜。
4. 找是否有 fetch／XHR。若有，記錄 URL、method、status，以及 response 大致是 HTML、JSON 或其他格式。
5. 切到 Console，記錄 error 和 warning；沒有也要寫「未觀察到」。
6. 回答：如果你剛才看到的每一項各自失敗，使用者會看到什麼？

不要貼任何 token、cookie、Authorization header 或私人 response 給 AI。需要協助時，只提供已遮蔽的錯誤訊息、status、request 類型與重現步驟。

## 可直接交給 Agent 的提示詞

```text
請先不要修改任何檔案。閱讀這個前端專案的規則、package.json、主要入口與部署設定，然後用初學者能理解的方式畫出：
1. 開發指令到本機畫面的流程；
2. production build 到部署產物的流程；
3. 瀏覽器首次開頁時取得的 document、assets 與 data；
4. 哪些程式在 server、哪些在 browser；
5. 每個結論對應的檔案或指令證據。
不要只根據框架慣例猜測；未知處請標成未知，並列出安全的驗證方法。
```

## 練習紀錄模板

完成 Network 觀察後，不必抄下所有技術欄位，只要留下能支持判斷的紀錄：

```text
觀察的頁面：
第一個 document：URL／status／content type
主要 CSS：成功或失敗；失敗時預期症狀
主要 JavaScript：成功或失敗；它負責的互動
圖片或字型：成功或失敗；是否影響版面
Fetch／XHR：method／status／資料大意，不記錄秘密
Console：error／warning／未觀察到異常
我目前判斷的 client／server 邊界：
仍然不知道、需要 Agent 協助查證的部分：
```

## 常見誤判

- 「畫面有出現，所以 API 一定正常」：可能顯示的是快取、假資料或舊資料。
- 「沒有 Console error，所以完成」：視覺、鍵盤、空狀態與 server log 仍可能失敗。
- 「build 成功，所以 production 正常」：環境變數、網域、資料庫與執行環境仍可能不同。
- 「用了 Next.js，所以全部是 SSR」：現代 Next.js 允許不同 render 與 server／client 邊界混合。
- 「TypeScript 通過，所以資料安全」：型別在執行時不會自動驗證外部輸入。

## Teach-back 題目

先不要搜尋答案，用自己的話回答：

1. 為什麼 CSS 壞掉時，HTML 內容可能仍然存在？
2. API 回 500 與 JavaScript 在瀏覽器拋錯，Network／Console 各會提供什麼不同證據？
3. TypeScript 和 Webpack 都會出現在 build 階段，它們負責的問題有何不同？
4. 為什麼 Agent 的完成報告必須同時附上 diff、測試／build 與瀏覽器證據？

能以自己的網站為例說清楚四題，就進入單元 1；若只能認得名詞，先重做 Network 觀察。

## 本單元下一步

完成一次 Network 觀察並回答四題 Teach-back。之後進入 HTML／DOM，開始把畫面設計轉成有語意、可操作的結構。

下一篇：[[Learning/ai-first-frontend-foundations/01-html-dom-semantic-structure]]

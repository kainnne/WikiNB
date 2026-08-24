---
title: 從本機檔案權限到跨平台發行：LumaReader 架構與交付
description: 解析 LumaReader 如何分隔 Electron 權限、安全讀寫 Markdown，並以可驗證的 CI 管線交付 macOS 與 Windows。
type: note
status: active
tags:
  - LumaReader
  - Electron
  - Markdown
  - 本機優先
  - 應用程式安全
  - 跨平台發行
date: 2026-08-24
---

# 從本機檔案權限到跨平台發行：LumaReader 架構與交付

一個桌面 Markdown 閱讀器看似只是「讀檔再轉成 HTML」，但真正進入可公開下載的產品階段後，問題會迅速擴大：誰可以選擇資料夾、網頁介面能取得多少檔案權限、如何避免覆寫外部修改、圖片路徑搬到別台電腦後是否仍成立，以及同一份 Electron 程式如何在 macOS 與 Windows 上得到可信任的成品。

LumaReader 的做法，是把閱讀體驗、檔案權限與發行供應鏈都設計成可檢查的邊界。產品定位與實際操作可先讀 [[Projects/Products/kainnne-lumareader]]；本文集中說明可重用的工程方法。

## 一、四層架構：不要讓 renderer 直接變成檔案管理員

```text
作業系統原生選擇器
        ↓
Electron main process ── 設定、生命週期、寫入驗證
        ↓ 限縮後的 IPC
Preload contextBridge ── 明確方法與資料形狀
        ↓
Loopback document service ── 掃描、唯讀文件／媒體 API
        ↓
Renderer ── 搜尋、解析、閱讀、編輯互動與外觀
```

1. **Main process** 管理視窗、原生資料夾選擇器、書庫設定與應用程式生命週期。會改變檔案的操作也在這一層驗證。
2. **Preload bridge** 只公開選擇書庫、取得偏好、新增 Markdown 與儲存 Markdown 等明確方法，不把 Node.js 或任意檔案 API 交給 renderer。
3. **Document service** 只監聽 `127.0.0.1` 的隨機 port，負責掃描書庫、讀取文件、提供相對媒體與 renderer 靜態檔。HTTP 路由維持唯讀。
4. **Renderer** 處理書庫樹、搜尋、Markdown 解析、版面、語言、主題與編輯介面；它不能自己指定任意本機路徑。

這種分層的重點不在「用了 Electron」，而在每一層只持有完成職責所需的最小權限。更換書庫必須經過原生選擇器與 IPC，不能靠一個 HTTP 參數把根目錄改到其他位置。

## 二、讀取路徑：用真實路徑處理 traversal 與 symlink

書庫掃描支援 Markdown 格式，純文字與 log 則由使用者選擇是否開啟。`src/document-types.js` 集中定義副檔名、MIME、能力與資源上限，讓掃描、API 與 renderer 共用同一份格式事實。

讀取檔案時，單純比較字串前綴不夠安全。LumaReader 會同時處理 lexical path 與 real path，避免 `..`、重新導向或 symlink 把請求帶出書庫；遞迴掃描本身也不跟隨 symlink。隱藏目錄、版本控制、dependencies、build、coverage 與應用程式 bundle 等資料夾會被排除，降低雜訊與不必要的資源消耗。

本機圖片、音訊、影片與 include 都相對於已驗證的文件來源解析。這讓整個 Markdown 資料夾搬到另一台電腦時，只要相對結構仍在，內容就不必綁死原電腦的絕對路徑。

## 三、寫入路徑：選擇、建立與儲存是三個不同問題

閱讀器加入編輯功能後，原本的唯讀邊界不應直接被放寬成「renderer 可以寫任何路徑」。LumaReader 把新增與儲存分別約束：

### 新增 Markdown

1. 使用者先用原生資料夾選擇器選定目的地。
2. Main process 驗證目的地後，建立短效且只能使用一次的 token。
3. Renderer 只送出 token 與簡單的 Markdown 檔名。
4. 建立操作使用 exclusive create；同名檔存在時直接拒絕，不能覆寫。
5. 若目的地不在目前書庫，該資料夾會成為新的書庫根目錄，再重新整理索引並開啟編輯。

### 儲存 Markdown

- 只能儲存目前書庫中的 Markdown，`.txt` 與 `.log` 保持唯讀。
- 請求包含上一次讀取的修改時間；如果外部程式已改過檔案，儲存會回報衝突，而不是靜默覆蓋。
- 儲存成功只顯示 Saved，閱讀器不代替使用者決定何時離開編輯模式。

這個設計把「使用者同意寫入哪裡」、「檔名是否合法」與「檔案是否仍是我剛才看到的版本」拆成三個可以分別測試的條件。

## 四、Markdown 呈現：功能豐富不等於信任輸入

閱讀管線大致如下：

```text
原始文字
  ↓ include 與擴充語法的有界處理
CJK 粗體等語法正規化
  ↓
Marked 產生 HTML
  ↓ element／attribute allowlist
KaTeX、Mermaid strict mode、syntax highlight
  ↓
大綱、媒體、閱讀模式與編輯對照預覽
```

Markdown 轉成 HTML 後仍會移除事件屬性、inline style 與 script、iframe、object、embed、form 等高風險節點。未知 MDX JSX 不會作為 JavaScript 執行；Mermaid 使用 strict security mode。

中日韓文件常見 `**標籤**文字` 緊接標點或其他字元的寫法。若直接套用一般解析器，星號有時會露在畫面上。LumaReader 在解析前只針對文字區段做正規化，避開 inline code 與 fenced code，再交給 Markdown renderer，讓修正不會破壞程式碼內容。

## 五、長文編輯：同步的不是像素，而是閱讀位置

原文與 Markdown 預覽的高度不會一樣：標題、表格、圖片、數學式與圖表都會改變預覽占用的空間。因此兩邊直接套用同一個 `scrollTop`，文件愈長偏差愈大。

LumaReader 讓原文成為主導端，建立原文區塊與預覽區塊之間的進度映射，再用鄰近錨點插值預覽位置。圖片載入、字型完成、視窗寬度或分隔線比例改變時，映射會重新計算。同步後只保留最右側一條可見 scrollbar，避免兩個已連動的捲軸在視覺上重複。

這個取捨不保證每一個像素永遠相同，而是優先維持「我正在編輯的段落仍出現在預覽視野附近」。對結構不同的兩種呈現，語意位置通常比絕對像素更有用。

## 六、跨平台發行是一條驗證鏈

```text
同一個產品 commit
      ├─ Windows runner → Setup + Portable → 啟動／API smoke test
      └─ macOS runner   → Universal app → Developer ID → Apple notarization
                                                 ↓
                                   signature／staple／Gatekeeper／雙架構檢查
      ↓
指定兩筆成功的 workflow artifacts
      ↓
重算 SHA-256 + 建立 GitHub Release
      ↓
部署下載網站 + 公開 HTTP／響應式驗證
```

### macOS

macOS 直接下載版使用 **Developer ID Application**，開啟 Hardened Runtime 與 secure timestamp，送交 Apple `notarytool` 公證，並把公證票證 staple 到成品。CI 會再次檢查深層簽章、簽章身分、Gatekeeper、ticket、Apple silicon／Intel 雙架構與實際啟動。

憑證、私鑰、`.p12`、Apple app-specific password 與 Team 資訊只存在受保護的本機 Keychain 或 GitHub Secrets。工作流程只能引用 secret 名稱，不能把實值寫進 repository、log 或文件。Apple 主帳號密碼與 app-specific password 是不同憑證；後者專門提供給公證工具。

### Windows

Windows x64 的 Setup 與 Portable 在真正的 Windows runner 建置，並測試安裝版、免安裝版、書庫掃描、文件開啟與正常結束。現階段沒有購買 Windows code-signing certificate，因此公開頁面必須持續說明 SmartScreen 的未知發行者提醒。

### Release 與網站

發行工作流程不重新建置產品，而是接收版本、產品 commit 與兩個已成功的 build run ID，下載指定 artifacts，核對四個檔名與版本，重新產生 SHA-256，並拒絕覆蓋既有 tag。這避免「測試的是 A、上傳的卻是 B」。

GitHub workflow token 建立的 Release 不會自動再觸發另一個 workflow，因此網站部署需要明確 dispatch。部署後再以公開網路確認網站、macOS 與 Windows 直接下載 URL 回傳成功，並在桌面與窄版手機寬度檢查兩個下載按鈕。

## 七、目前證據與限制

已完成並公開驗證的範圍：

- macOS Universal 簽章、公證、staple、Gatekeeper、雙架構與啟動 smoke test。
- Windows x64 Setup／Portable 建置、啟動、書庫掃描與文件開啟 smoke test。
- 四個安裝包的 SHA-256、GitHub Release 與公開下載連結。
- 下載網站的桌面與手機響應式檢查，以及瀏覽器 console error 檢查。

仍需維持的限制：

- Windows 未簽章，不應隱藏 SmartScreen 提示。
- loopback-only 與本機優先能降低暴露面，但不等於零風險；sanitize、路徑邊界、IPC origin 與 dependency 更新仍要持續驗證。
- Mac App Store 是另一條 sandbox、entitlement、商店審查與包裝路線；目前完成的是 Developer ID 站外直接發行。
- 自動化測試無法取代每次重大介面修改後的實際閱讀、鍵盤、長文與乾淨使用者安裝測試。

## 八、可以帶到其他桌面工具的原則

1. **把 renderer 當成不可信任的 UI 層**，權限交給較小且可審查的 bridge。
2. **讀取與寫入分開設計**；支援預覽某種格式，不代表應該允許修改它。
3. **用 native picker 表達使用者授權**，不要讓文字路徑或 URL 取代明確選擇。
4. **使用 exclusive create 與 optimistic concurrency**，分別處理同名覆寫與外部修改衝突。
5. **同步不同版面時對齊語意位置**，不要假設像素或捲動百分比天然相等。
6. **讓發行 artifact 帶著證據流動**：同一 commit、平台實測、簽章／公證、checksum、公開下載驗證缺一不可。
7. **對未購買的信任能力誠實揭露**；Windows 未簽章是一項限制，不應用文案掩蓋。

## Source of truth

- [Kainnne LumaReader repository](https://github.com/kainnne/Kainnne-LumaReader)
- Repository 中的 `README.md`、`docs/ARCHITECTURE.md`、`docs/HANDOFF.md` 與 `docs/RELEASE-ASSETS-AND-DOWNLOAD-LINKS.md`
- Repository 中的 `src/`、`renderer/`、`tests/` 與 `.github/workflows/`

本文只分享可公開的架構、取捨與驗證方式。實際使用者路徑、私人 Markdown、憑證、私鑰、密碼與 secret 實值不屬於 WikiNB 的公開內容。

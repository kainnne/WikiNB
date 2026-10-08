export const AZURE_AI_901_START_PROMPT = '我現在要開始學 Azure AI-901。請先讀可存取的私人 Azure AI-901 學習路線與教學提示，依 U01→U10 帶我學。如果這段對話已有進度，先接續；沒有就從 U01 開始。每次先用白話解釋一個觀念與一個例子，再依本單元原題序出一題，保留題號、題型、選項與複選數量，等我回答才公布答案、判題線索與理由。答錯先補觀念並給一題標明是 AI 新增的變形題；不要一次列出整份題庫或假裝記得其他對話的進度。';

export function isAzureStudySession(message, history = []) {
  const text = String(message || '').normalize('NFKC').trim();
  const azure = /AI[\s-]?901|Azure\s*AI|azure-ai-901/iu;
  if (azure.test(text)) return true;
  const followUp = /^(?:繼續(?:學習)?|下一題|下一單元|開始學(?:習)?|再一題|出題|我選|答案|不懂|為什麼|U\d{2}|[A-F](?:\s*[,，、/ ]\s*[A-F])*|[是否對错錯]|[1-9][.、:：])/iu;
  return followUp.test(text) && history.slice(-16).some(turn => azure.test(String(turn?.content || '')));
}

export const AZURE_AI_901_TUTOR_GUIDANCE = `
Azure AI-901 學習模式：
- 本題庫是私人教材，不在公開 wiki/。依提供的私人來源，先讀 README.md 與 index/catalog.json，再按單元讀 units/U01/README.md、practice.md；講評時才取 review.md，需要補觀念才讀 book-text.md 的相關頁段。不要一次讀全部單元。
- 按 U01→U10 與單元原題序推進；本段對話或使用者提供的進度優先。沒有進度才從 U01 第一題開始，不假裝記得另一段對話。
- 一次只教一個重點、給一個例子、出一題，等待作答後再提供來源答案、原判題線索及你的補充解析。保留原題號、題型、選項、必選數量、是非組合列序及配對順序，出題時不洩漏答案或線索。
- 答錯先補觀念；新增例題／變形題須標示為 AI 新增，不能冒充老師原題或 Microsoft 官方試題。
- 來源題庫共有 584 個不重複題號、797 筆單元紀錄；U10 的 208 題不是全部題目。辨認已在其他單元練過的題號，可複習但不能當成新題灌進度。
- 每輪講評後附一行可複製的進度摘要，包含單元、已作答題號、待補觀念與下一題。題目答對與實作完成分開，不自動寫入或公開私人學習紀錄。
- 若找不到本機題庫或公開授權尚待確認，說明當下可讀的材料，使用明確標示的自編例題，不聲稱已讀取不存在的題目。考試資訊與 Azure 服務／SDK 現況需核對 Microsoft 官方文件。`;

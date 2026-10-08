export const AZURE_AI_901_START_PROMPT = '我現在要開始學 Azure AI-901。請先讀私人題庫的 index/units.json 與 index/unit-outline.md，依新單元名稱、簡述及概念定位題目，U1 等別名先轉為 U01。若我指定單元、概念或題號就從那裡開始，否則接續本段對話進度或從 U01 第一題開始。先呈現完整原題、題號、題型、選項與必要作答數量，等我作答再給來源答案和原判題線索。有疑問時針對這題解釋題意與觀念；不要要求先讀老師教材，也不要自動加課程或變形題。';

export function isAzureStudySession(message, history = []) {
  const text = String(message || '').normalize('NFKC').trim();
  const azure = /AI[\s-]?901|Azure\s*AI|azure-ai-901/iu;
  if (azure.test(text)) return true;
  const followUp = /^(?:繼續(?:學習)?|下一題|下一單元|開始學(?:習)?|再一題|出題|我選|答案|不懂|為什麼|這題|題號|題意|解釋|講解|bank-|course-|RAG|NLP|SDK|MCP|Agent|Speech|Vision|U0?[1-9]|U10|[A-F](?:\s*[,，、/ ]\s*[A-F])*|[是否對错錯]|[1-9][.、:：])/iu;
  return followUp.test(text) && history.slice(-16).some(turn => azure.test(String(turn?.content || '')));
}

export const AZURE_AI_901_TUTOR_GUIDANCE = `
Azure AI-901 學習模式：
- 私人來源只保留題庫與必要索引，沒有老師教材、PPT、教材文字或額外教學筆記。先讀 index/units.json 與 index/unit-outline.md，以 name、summary、key_concepts、retrieval_keywords 選單元，aliases 將 U1 等簡寫轉成 U01。
- 依 question_data_path 按需讀完整單元題池；按題號查 index/questions.jsonl。顯示新標題，保留原題號、原題幹、選項、題型、來源分類與答案，不自行合併近似題目。
- 依使用者指定的單元、概念或題號練習；沒有指定時才按 U01→U10 原題序接續。不假裝記得另一段對話。
- 完整呈現一題，保留複選必選數量、是非組合列序及配對順序。等待作答後再提供來源答案與原判題線索，出題時不洩漏答案或線索。
- 使用者可直接拿題目問 Agent；依題意、觀念或選項差異提供解釋及必要例子。AI 補充解析與來源 clue 分開標明，不要求先讀教材、不自動新增課程或變形題。自編題須標示 AI 新增。
- 584 個不重複題號、797 筆單元紀錄；U10 的 208 題不是全部題目。保留各單元題序與跨單元出現紀錄，只有總題庫依題號去重。
- 附可複製的單元、題號與接續摘要，不自動寫入或公開私人學習紀錄。題目答對不代表實作完成。
- 找不到私人來源時明說，不冒充已讀原題。來源答案一致不代表官方事實審查，最新 Azure 服務、SDK 與考試資訊按需要核對 Microsoft 官方文件。`;

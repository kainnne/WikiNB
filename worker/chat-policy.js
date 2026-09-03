export const DEFAULT_MAX_CHAT_TURNS = 5;

const KNOWN_KAINE_TOPICS =
  /\b(?:kaine|kainnne|wikinb|lumareader|scopecut|codexrules|agents\s+cli|kainnne\s+geo|geo\s+automation|kcis|kuse)\b|朱璽|康橋|AI\s*(?:導入|教育訓練)/iu;

const FIRST_PERSON_PUBLIC_PROFILE =
  /(?:你是誰|介紹(?:一下)?你(?:自己)?|你(?:本人|自己)?(?:目前|現在)?在做什麼|你(?:會|擅長|懂|能做)什麼|你的?(?:公開)?(?:專案|作品|經歷|履歷|背景|技能|能力|工作|職涯|研究|音樂|創作|網站|wiki|筆記|合作|服務|技術)|who are you|introduce yourself|your (?:projects?|work|experience|background|skills?|music|research|website)|what (?:are you working on|have you built|do you do|can you do))/iu;

const PUBLIC_PROFILE_WITH_SUBJECT =
  /(?:kaine|kainnne|朱璽|他|這個人).{0,12}(?:專案|作品|經歷|履歷|背景|技能|能力|工作|職涯|研究|音樂|創作|網站|wiki|筆記|合作|技術|做過)|(?:專案|作品|經歷|履歷|背景|技能|能力|工作|職涯|研究|音樂|創作|網站|wiki|筆記|合作|技術).{0,12}(?:kaine|kainnne|朱璽|他)/iu;

const PROJECT_DISCUSSION =
  /(?:專案|作品|產品|系統|網站|工具|功能|設計|架構|流程|技術|方案|方向|project|product|system|website|tool|feature|design|architecture|workflow|technology)/iu;

const OPEN_ENDED_EXTENSION =
  /(?:延伸|額外|新增|改善|改進|建議|想法|評價|看法|認為|覺得|適合|可行|風險|取捨|優缺點|比較|差異|下一步|如何|怎麼|為什麼|extend|additional|add|improve|suggest|idea|opinion|think|suitable|feasible|risk|trade-?off|pros? and cons?|compare|difference|next step|how|why)/iu;

const CLEAR_GENERAL_TASK =
  /(?:教我|幫我(?:寫|解|算|翻譯|查|規劃|生成)|替我(?:寫|解|算|翻譯|查|規劃|生成)|今天.{0,8}(?:天氣|氣象)|(?:天氣|氣象)(?:如何|預報)|teach me|do my homework|solve (?:this|my)|translate (?:this|for me)|write (?:an?|my) (?:essay|homework)|plan (?:a|my)|generate (?:a|an)|weather (?:today|forecast))/iu;

function textOf(turn) {
  return String(turn?.content || '').trim();
}

function directlyInScope(text) {
  const normalized = String(text || '').normalize('NFKC').trim();
  if (!normalized) return false;
  return (
    KNOWN_KAINE_TOPICS.test(normalized) ||
    FIRST_PERSON_PUBLIC_PROFILE.test(normalized) ||
    PUBLIC_PROFILE_WITH_SUBJECT.test(normalized) ||
    (PROJECT_DISCUSSION.test(normalized) && OPEN_ENDED_EXTENSION.test(normalized))
  );
}

export function isKaineScopeQuestion(message, history = []) {
  const normalized = String(message || '').normalize('NFKC').trim();
  if (!normalized) return false;
  if (directlyInScope(normalized)) return true;
  if (CLEAR_GENERAL_TASK.test(normalized)) return false;

  const recentTurns = [...(Array.isArray(history) ? history : [])].reverse().slice(0, 4);
  const recentUserTurns = recentTurns.filter((turn) => turn?.role === 'user');
  const recentKaineContext = recentUserTurns.some((turn) => directlyInScope(textOf(turn)));
  if (recentKaineContext) return true;
  const recentGeneralTask = recentUserTurns.some((turn) =>
    CLEAR_GENERAL_TASK.test(textOf(turn).normalize('NFKC')),
  );
  if (recentGeneralTask) return false;

  // 模糊問題交給 Gemini 依公開 WikiNB 與系統規則判斷，避免關鍵字白名單
  // 把合法的作品名稱、錯誤訊息或技術追問誤擋。只有上方明確的一般任務才硬拒絕。
  return true;
}

export function prefersEnglish(message, history = []) {
  const combined = [message, ...(Array.isArray(history) ? history.slice(-2).map(textOf) : [])]
    .join(' ')
    .trim();
  if (/\p{Script=Han}/u.test(combined)) return false;
  return /[a-z]/i.test(combined);
}

export function maxChatTurns(env = {}) {
  const configured = Number(env.MAX_CHAT_TURNS || DEFAULT_MAX_CHAT_TURNS);
  return Number.isFinite(configured)
    ? Math.min(5, Math.max(4, Math.floor(configured)))
    : DEFAULT_MAX_CHAT_TURNS;
}

export function outOfScopeMessage(english = false) {
  return english
    ? "To help conserve Kaine's free Gemini API quota, I may not be able to answer requests unrelated to this chat's main purpose. 🙏"
    : '為了節省 Kaine 的免費 Gemini API 額度，我可能無法回答與主要任務無關的請求 🙏';
}

export function continuationPromptMessage(limit, english = false) {
  return english
    ? `You have used the first ${limit} messages. Would you like to continue? If you choose to continue, the system will email Kaine to let him know that you requested more chat time. The email will not include your conversation.`
    : `你已使用前 ${limit} 則訊息。要繼續聊嗎？如果你選擇繼續，系統會寄一封通知信給 Kaine，讓他知道你希望延長聊天；信中不會附上對話內容。`;
}

export function appendContinuationPrompt(answer, limit, english = false) {
  return `${String(answer || '').trim()}\n\n---\n${continuationPromptMessage(limit, english)}`.trim();
}

export const DEFAULT_MAX_CHAT_TURNS = 5;

const KNOWN_KAINE_TOPICS =
  /\b(?:kaine|kainnne|wikinb|lumareader|scopecut|codexrules|agents\s+cli|kainnne\s+geo|geo\s+automation)\b|朱璽/iu;

const FIRST_PERSON_PUBLIC_PROFILE =
  /(?:你是誰|介紹(?:一下)?你(?:自己)?|你(?:本人|自己)?(?:目前|現在)?在做什麼|你(?:會|擅長|懂|能做)什麼|你的?(?:公開)?(?:專案|作品|經歷|履歷|背景|技能|能力|工作|職涯|研究|音樂|創作|網站|wiki|筆記|合作|服務|技術)|who are you|introduce yourself|your (?:projects?|work|experience|background|skills?|music|research|website)|what (?:are you working on|have you built|do you do|can you do))/iu;

const PUBLIC_PROFILE_WITH_SUBJECT =
  /(?:kaine|kainnne|朱璽|他|這個人).{0,12}(?:專案|作品|經歷|履歷|背景|技能|能力|工作|職涯|研究|音樂|創作|網站|wiki|筆記|合作|技術|做過)|(?:專案|作品|經歷|履歷|背景|技能|能力|工作|職涯|研究|音樂|創作|網站|wiki|筆記|合作|技術).{0,12}(?:kaine|kainnne|朱璽|他)/iu;

const FOLLOW_UP =
  /^(?:那|所以|可是|然後|再|這|它|為什麼|怎麼|哪|可以|能不能|還有|更詳細|詳細一點|繼續|說下去|tell me more|why|how|which|what about|and|more|continue)/iu;

const CLEAR_GENERAL_TASK =
  /(?:教我|幫我(?:寫|解|算|翻譯|查)|替我(?:寫|解|算|翻譯)|teach me|do my homework|solve (?:this|my)|translate (?:this|for me)|write (?:an?|my) (?:essay|homework))/iu;

function textOf(turn) {
  return String(turn?.content || '').trim();
}

function directlyInScope(text) {
  const normalized = String(text || '').normalize('NFKC').trim();
  if (!normalized) return false;
  return (
    KNOWN_KAINE_TOPICS.test(normalized) ||
    FIRST_PERSON_PUBLIC_PROFILE.test(normalized) ||
    PUBLIC_PROFILE_WITH_SUBJECT.test(normalized)
  );
}

export function isKaineScopeQuestion(message, history = []) {
  if (directlyInScope(message)) return true;
  if (CLEAR_GENERAL_TASK.test(String(message || '').normalize('NFKC'))) return false;
  if (!FOLLOW_UP.test(String(message || '').normalize('NFKC').trim())) return false;

  return [...(Array.isArray(history) ? history : [])]
    .reverse()
    .filter((turn) => turn?.role === 'user')
    .slice(0, 2)
    .some((turn) => directlyInScope(textOf(turn)));
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
    ? "This small chat is only for my public experience, work, projects, skills, and collaboration topics. General requests such as calculus tutoring would use the shared free Gemini API quota, so I won't answer them here—sorry. You can instead ask what I have built or how one of my projects works."
    : '這個小聊天只開放聊我的公開經歷、作品、專案、技能與合作方向。像微積分教學這類一般問答會消耗共用的 Gemini 免費 API 額度，所以這裡先不回答，抱歉；你可以改問我做過什麼，或某個專案怎麼運作。';
}

export function conversationLimitMessage(limit, english = false) {
  return english
    ? `Let's stop here—sorry. This chat uses the free Gemini API quota I provide, so each verified email gets ${limit} messages per day to keep it available for other visitors. You can still browse WikiNB or contact me directly.`
    : `先聊到這裡，抱歉。這個聊天使用我提供的 Gemini 免費 API 額度；為了讓其他訪客也能使用，每個已驗證 Email 每天只開放 ${limit} 則訊息。你仍然可以直接瀏覽 WikiNB，或聯絡我。`;
}

export function appendConversationLimit(answer, limit, english = false) {
  return `${String(answer || '').trim()}\n\n---\n${conversationLimitMessage(limit, english)}`.trim();
}

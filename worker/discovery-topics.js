// Only published sources: selection is local and never calls a model.
export const DISCOVERY_TOPICS = [
  ['reader', 'Projects/Products/kainnne-lumareader', '讓長篇筆記更容易閱讀', 'Make long notes easier to read', 'LumaReader 閱讀器', 'LumaReader'],
  ['wiki', 'Projects/Knowledge/wikinb', '把筆記整理成可對話的網站', 'Turn notes into a conversational website', 'WikiNB 知識網站', 'WikiNB knowledge website'],
  ['school', 'KCIS/WikiNB-KCIS', '讓教材與工作文件方便查找', 'Make teaching and work documents searchable', 'WikiNB for KCIS 教育知識庫', 'WikiNB for KCIS'],
  ['navigation', 'KCIS/kcis-ai-navigation', '為不同工作找到 AI 的用法', 'Match AI applications to different jobs', '康橋 AI 應用導航網站', 'KCIS AI navigation website'],
  ['kuse', 'Learning/kuse-ai-practical-course', '讓團隊學會把工作交給 AI', 'Help a team delegate work to AI', 'Kuse AI 實作課', 'Kuse AI practical course'],
  ['novel', 'Projects/Creative/visual-novel-production-system', '把故事做成有分支的互動作品', 'Build a branching interactive story', '視覺小說模組化製作系統', 'modular visual novel production system'],
  ['scope', 'Projects/Workflow/scopecut', '把模糊需求整理成實作計畫', 'Turn a vague request into a build plan', 'ScopeCut 需求整理流程', 'ScopeCut'],
  ['agents', 'Systems/codexrules-agent-system', '讓多個 AI Agent 協作開發', 'Coordinate AI agents on development work', 'CodexRules 與 agents CLI', 'CodexRules and agents CLI'],
  ['search', 'Projects/Workflow/kainnne-geo-automation', '檢查網站能否被搜尋與 AI 理解', 'Check how search engines and AI read a website', 'Kainnne GEO 網站稽核流程', 'Kainnne GEO website audit workflow'],
  ['forms', 'Projects/Workflow/kainnne-forms-landing', '把表單服務整理成清楚的入口', 'Create a clear entry point for form services', 'Kainnne Forms 表單入口', 'Kainnne Forms'],
  ['classification', 'Projects/Machine-Learning/customer-message-classification', '研究如何自動分類客服訊息', 'Explore automated customer-message classification', '小型語言模型客服分類實驗', 'customer-message classification experiment'],
  ['music', 'AboutMe/01-music', '認識 Kaine 的音樂創作與演出', 'Explore Kaine’s music and performance', '音樂創作、專輯與演出經歷', 'music, album and performance experience'],
  ['enterprise', 'Projects/Knowledge/wikinb-enterprise', '探索團隊知識平台的設計', 'Explore a team knowledge platform', 'WikiNB Enterprise 原型', 'WikiNB Enterprise prototype'],
  ['documents', 'Learning/ai-document-workflow-workshop', '讓 AI 文件產出更容易檢查與交付', 'Make AI documents easier to review and hand over', 'AI 文件與 Agent 工作流工作坊', 'AI document and agent workflow workshop'],
].map(([id, slug, zh, en, subjectZh, subjectEn]) => ({ id, slug, label: { zh, en }, subject: { zh: subjectZh, en: subjectEn } }));

export function discoveryQuestion(topic, english = false) {
  return english
    ? `Introduce Kaine’s ${topic.subject.en}. Explain its purpose and the skills it demonstrates, then a possible way to work with Kaine. Distinguish completed work from prototypes, research and proposals; focus on this topic rather than a tutorial.`
    : `請介紹 Kaine 的「${topic.subject.zh}」。先說用途與展現的能力，再說可以與他討論的應用或合作；區分已完成成果、原型、研究與建議，聚焦這個主題，不展開操作教學。`;
}

export function findDiscoveryTopic(message) {
  return DISCOVERY_TOPICS.find((topic) => [false, true].some((english) => String(message).normalize('NFKC').includes(discoveryQuestion(topic, english).normalize('NFKC'))));
}

export function drawDiscoveryTopics(previousIds = [], random = Math.random) {
  const fresh = DISCOVERY_TOPICS.filter((topic) => !previousIds.includes(topic.id));
  for (let i = fresh.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [fresh[i], fresh[j]] = [fresh[j], fresh[i]];
  }
  return fresh.slice(0, 5);
}

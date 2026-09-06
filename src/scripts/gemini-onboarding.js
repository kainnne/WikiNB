// Curated entry points describe visitor goals, not services or availability.
import { isKaineScopeQuestion } from '../../worker/chat-policy.js';
import { visitorGuidance } from '../../worker/visitor-policy.js';

export const GEMINI_TOPICS = ['about', 'automation', 'knowledge', 'learning', 'website'];

export const GEMINI_FOLLOWUPS = {
  automation: ['documents', 'repetitive', 'unsure'],
  knowledge: ['finding', 'teamKnowledge', 'unsure'],
  learning: ['personalAi', 'teamAi', 'unsure'],
  website: ['portfolio', 'services', 'unsure'],
  about: ['automation', 'learning', 'website'],
};

// The local UI uses the existing Worker. Carry the visitor-facing response
// preference with the request, without changing its API or clipping user text.
export function withPlainLanguagePreference(message, preference, selectedQuestion = '') {
  // Leave free input untouched so it still reaches the Worker's scope filter.
  if (!selectedQuestion || message !== selectedQuestion) return message;
  const combined = `${message}\n\n${preference}`;
  return combined.length <= 1200 ? combined : message;
}

export function prepareVisitorRequest(message, preference, selectedQuestion, history = [], english = false) {
  // Classify original input before adding any mention of Kaine. Unrelated
  // requests must still reach the deployed Worker's existing scope filter.
  if (!isKaineScopeQuestion(message, history)) return message;
  const guidance = `${visitorGuidance(message, english)}\n${preference}`;
  return withPlainLanguagePreference(message, guidance, selectedQuestion === message ? selectedQuestion : message);
}

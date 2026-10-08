export async function generatePrivateStudy(env, email, instruction, message, { dailyUsage, dailyTokenLimit }) {
  const usage = await dailyUsage(env, email);
  const reserve = new TextEncoder().encode(instruction + message).length + 1500;
  if (reserve > dailyTokenLimit(env)) return { error: '今天的 AI 額度已達上限，請明天再來', status: 429 };
  const reserved = await env.DB.prepare(`INSERT INTO daily_usage(email, usage_day, count, token_count) VALUES(?, ?, 1, ?) ON CONFLICT(email, usage_day) DO UPDATE SET count = count + 1, token_count = token_count + excluded.token_count WHERE token_count + excluded.token_count <= ? RETURNING token_count`).bind(email, usage.day, reserve, dailyTokenLimit(env)).first();
  if (!reserved) return { error: '今天的 AI 額度已達上限，請明天再來', status: 429 };
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_MODEL || 'gemini-3.1-flash-lite')}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY }, signal: AbortSignal.timeout(45000),
      body: JSON.stringify({ systemInstruction: { parts: [{ text: instruction }] }, contents: [{ role: 'user', parts: [{ text: message }] }], generationConfig: { thinkingConfig: { thinkingLevel: 'minimal' }, maxOutputTokens: 1024 } }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { error: response.status === 429 ? 'Gemini 流量或額度限制，請稍後再試' : '私人 AI 教學暫時無法回應', status: response.status === 429 ? 429 : 502 };
    const answer = (data.candidates?.[0]?.content?.parts || []).filter(part => !part.thought).map(part => part.text || '').join('').trim();
    const used = Math.max(1, Number(data.usageMetadata?.totalTokenCount || reserve));
    await env.DB.prepare('UPDATE daily_usage SET token_count = MAX(0, token_count - ? + ?) WHERE email = ? AND usage_day = ?').bind(reserve, used, email, usage.day).run();
    return answer ? { answer } : { error: 'Gemini 沒有產生教學內容', status: 502 };
  } catch { return { error: '私人 AI 教學連線失敗，請稍後再試', status: 502 }; }
}

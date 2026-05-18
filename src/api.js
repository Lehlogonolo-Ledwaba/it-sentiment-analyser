// src/api.js — Groq API calls

const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL   = 'llama-3.3-70b-versatile'; // fast & capable; swap for 'mixtral-8x7b-32768' if preferred
const API_KEY = 'YOUR_GROQ_API_KEY_HERE';

/** Shared fetch wrapper for both endpoints. */
async function callGroq(systemPrompt, userPrompt, maxTokens = 1000) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

/**
 * Analyse a batch of IT feedback entries.
 * @param {Array<{category:string, source:string, text:string}>} batch
 * @returns {Promise<Array>} analysed results merged with original entries
 */
async function analyseEntries(batch) {
  const system = `You are an IT industry sentiment analyst. You return ONLY valid JSON arrays — no markdown, no backticks, no explanation, no preamble. Raw JSON only.`;

  const user = `Analyse each IT feedback entry below and return a JSON array.

Each object must have:
- "id": index number matching the entry (0-based)
- "sentiment": "positive", "negative", or "neutral"
- "score": float from -1.0 (very negative) to 1.0 (very positive), two decimal places
- "themes": array of 2-4 short IT-specific theme strings (e.g. "performance", "cost", "reliability", "UX", "security", "vendor support")
- "insight": one concise sentence, max 15 words, summarising the key finding

Entries:
${batch.map((e, i) => `[${i}] Category: ${e.category}\nSource: ${e.source}\nText: ${e.text}`).join('\n\n')}`;

  const raw    = await callGroq(system, user, 1200);
  const clean  = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);

  return batch.map((entry, i) => {
    const result = parsed.find(p => p.id === i) || parsed[i] || {};
    return { ...entry, ...result, id: i };
  });
}

/**
 * Generate an executive summary from all current results.
 * @param {Array} results
 * @returns {Promise<string>}
 */
async function generateSummary(results) {
  const lines = results
    .map(r => `${r.category} | ${r.sentiment} (${(r.score || 0).toFixed(2)}) | ${r.insight}`)
    .join('\n');

  const system = `You are a senior IT analyst who writes clear, concise executive summaries. Plain prose only — no bullet points, no headers, no markdown.`;

  const user = `Based on these ${results.length} IT feedback entries, write a 3-sentence executive summary covering: key sentiment trends, top pain points, and notable positives across the IT environment. Be specific to IT.

Data:
${lines}`;

  return await callGroq(system, user, 350);
}

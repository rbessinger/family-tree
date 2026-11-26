// Cloudflare Worker: family tree Ask bot. Secret needed: ANTHROPIC_API_KEY (set in Cloudflare, never in code).
const SITE = 'https://rbessinger.github.io/family-tree';
const MODEL = 'claude-haiku-5-5';
const hits = new Map();
let ctx = null, ctxAt = 0;
const cors = o => ({ 'Access-Control-Allow-Origin': o, 'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Vary': 'Origin' });
async function context() {
  if (ctx && Date.now() - ctxAt < 3600e3) return ctx;
  const [t, d] = await Promise.all([fetch(SITE + '/tree-data.json').then(r => r.json()), fetch(SITE + '/data.json').then(r => r.json())]);
  const P = t.p, nm = i => P[i] ? P[i].n : '';
  const yr = p => p.dead && p.y ? ` (${p.y[2] ? 'c.' : ''}${p.y[0] || '?'}-${p.y[1] || '?'})` : p.dead ? '' : ' (living)';
  const people = Object.values(P).map(p => `${p.n}${yr(p)}${p.bp ? ', born ' + p.bp : ''}; parents: ${p.par.map(nm).join(' & ') || 'unknown'}; spouse: ${p.sp.map(nm).join(', ') || 'none listed'}; children: ${p.ch.map(nm).join(', ') || 'none listed'}${p.q ? '; OPEN QUESTION: ' + p.q : ''}`).join('\n');
  const stories = Object.entries(d.stories).map(([s, x]) => `STORY [${s}] ${x.full}\n${x.text}`).join('\n\n');
  const arts = d.arts.map(a => `SCAN ${a.title}: ${a.cap}`).join('\n');
  ctx = `You are the helper inside a private family history website for the Bessinger, Schatzman, Siegel and Baratz families. Visitors range from kids to grandparents, so answer warmly, simply and briefly (usually 2 to 5 sentences).
RULES: Use ONLY the facts below. If the answer is not here, say you do not know and suggest asking Ross. Never guess, never invent dates or relatives. Where sources or relatives disagree, say so. For people marked living, share only what is listed (name, family links). Never give birth dates, addresses or private details about living people. Do not use em dashes.
LINKS: When you mention a person from the list, write their exact name inside double square brackets like [[Marvin Schatzman]]. When you point to a story, write [[story:slug]] using the slug in the STORY brackets.
The visitor message may include "Relation to visitor" lines, which are computed and reliable. Use them for how someone is related to the visitor.

PEOPLE (name, years, birthplace, parents, spouse, children):
${people}

STORIES:
${stories}

SCANS AND PHOTOS ON THE SITE:
${arts}`;
  ctxAt = Date.now(); return ctx;
}
export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const ok = origin === 'https://rbessinger.github.io' || origin.startsWith('http://localhost');
    const h = cors(ok ? origin : SITE);
    if (req.method === 'OPTIONS') return new Response(null, { headers: h });
    if (req.method !== 'POST' || !ok) return new Response('no', { status: 403, headers: h });
    const ip = req.headers.get('CF-Connecting-IP') || 'x', now = Date.now(), k = ip + Math.floor(now / 3600e3);
    const n = (hits.get(k) || 0) + 1; hits.set(k, n); if (hits.size > 5000) hits.clear();
    if (n > 25) return Response.json({ answer: 'That is a lot of questions for one hour. Please try again a bit later, or ask Ross.' }, { headers: h });
    let b; try { b = await req.json(); } catch { return new Response('bad', { status: 400, headers: h }); }
    const q = String(b.q || '').slice(0, 400).trim(); if (!q) return new Response('bad', { status: 400, headers: h });
    const hist = (Array.isArray(b.h) ? b.h : []).slice(-6).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0, 1200) }));
    const rel = String(b.rel || '').slice(0, 12000);
    const user = `${b.me ? 'Visitor is: ' + String(b.me).slice(0, 80) + '\n' : ''}${rel ? 'Relation to visitor:\n' + rel + '\n\n' : ''}Question: ${q}`;
    const msgs = [...hist, { role: 'user', content: user }];
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 500, system: [{ type: 'text', text: await context(), cache_control: { type: 'ephemeral' } }], messages: msgs })
    });
    if (!r.ok) return Response.json({ answer: 'Sorry, the helper is resting right now. Please ask Ross.' }, { headers: h });
    const j = await r.json();
    return Response.json({ answer: (j.content || []).map(c => c.text || '').join('').trim() }, { headers: h });
  }
};

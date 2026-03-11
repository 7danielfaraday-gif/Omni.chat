const ONE_HOUR_MS = 3600 * 1000;
const MESSAGES_KEY = 'void_chat_messages';
const MAX_MESSAGES = 200;

async function sha256(str) {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestGet({ env }) {
  const raw = await env.CHAT_KV.get(MESSAGES_KEY);
  const messages = raw ? JSON.parse(raw) : [];

  const now = Date.now();
  const fresh = messages.filter(m => now - m.ts < ONE_HOUR_MS);

  const recentUsers = new Set(fresh.filter(m => now - m.ts < 300_000).map(m => m.user));
  const onlineCount = Math.max(recentUsers.size, 1);

  return Response.json({ messages: fresh, onlineCount }, { headers: corsHeaders });
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  const { user, text } = body;
  if (!user || !text || typeof user !== 'string' || typeof text !== 'string') {
    return new Response('Missing fields', { status: 400 });
  }
  if (user.length > 24 || text.length > 500) {
    return new Response('Too long', { status: 400 });
  }

  const hash = await sha256(user + ':' + text);

  const raw = await env.CHAT_KV.get(MESSAGES_KEY);
  const messages = raw ? JSON.parse(raw) : [];

  const now = Date.now();
  const fresh = messages.filter(m => now - m.ts < ONE_HOUR_MS);

  const newMsg = {
    id: now + '_' + Math.random().toString(36).slice(2),
    user: user.slice(0, 24),
    text: text.slice(0, 500),
    hash,
    ts: now,
  };

  fresh.push(newMsg);
  const trimmed = fresh.slice(-MAX_MESSAGES);

  await env.CHAT_KV.put(MESSAGES_KEY, JSON.stringify(trimmed), {
    expirationTtl: 3600,
  });

  return Response.json({ ok: true, msg: newMsg }, { headers: corsHeaders });
}

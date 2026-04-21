/**
 * Bridger Western Wiki — Gemini Chat Worker
 * Deploy to Cloudflare Workers
 * Set environment variable: GEMINI_API_KEY = your key
 */

const ALLOWED_ORIGIN = 'https://bridgerwestern.cc';

// Rate limiting: max 10 requests per IP per minute
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  const entry = rateLimitMap.get(ip);
  if (now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

function corsHeaders(origin) {
  const allowed = origin === ALLOWED_ORIGIN || origin === 'http://localhost:3000';
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// The wiki content — loaded from llms-full.txt at build time via wrangler
// We embed it as a string constant so the Worker is self-contained
let WIKI_CONTENT = null;

async function getWikiContent(env) {
  if (WIKI_CONTENT) return WIKI_CONTENT;
  // Fetch from your site so it stays up to date
  try {
    const res = await fetch('https://bridgerwestern.cc/llms-full.txt', {
      cf: { cacheTtl: 3600 } // cache 1 hour in Cloudflare edge
    });
    WIKI_CONTENT = await res.text();
  } catch (e) {
    WIKI_CONTENT = 'Wiki content unavailable.';
  }
  return WIKI_CONTENT;
}

const SYSTEM_PROMPT = `You are a helpful assistant for the Bridger Western Wiki (bridgerwestern.cc).
Bridger Western is a Roblox game. Answer questions based ONLY on the wiki content provided below.
Keep answers concise and friendly. 
Always suggest a relevant page link from the wiki when applicable.
If the answer is not in the wiki content, say: "I don't have that info yet — check the Trello or ask in the community Discord."
Do NOT make up game mechanics, stats, or features not mentioned in the wiki.
Reply in the same language the user writes in.

Available pages on the wiki:
- /stands/ — Stands guide
- /stands/stand-tier-list/ — Stand tier list
- /stands/stand-abilities/ — Stand abilities
- /stands/skins/ — Stand skins
- /weapons/ — Weapons guide
- /weapons/mares-leg/ — Mare's Leg
- /cards/ — Cards guide
- /cards/all-cards/ — All cards
- /cards/how-to-get-cards/ — How to get cards
- /cards/card-builds/ — Card builds
- /items/ — Items database
- /items/dogbane-herb/ — Dogbane Herb
- /items/rokakaka-fruit/ — Rokakaka Fruit
- /locations/ — Locations guide
- /locations/map/ — World map
- /locations/horses/ — Horse Stables guide
- /locations/npcs/ — NPCs guide
- /locations/spawn-locations/ — Spawn locations
- /locations/red-corner-fight-club/ — Red Corner Fight Club
- /fishing/ — Fishing guide

WIKI CONTENT:
`;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers });
    }

    // Rate limiting
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait a moment.' }), {
        status: 429,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    const userMessage = (body.message || '').trim().slice(0, 500); // max 500 chars
    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    // Get wiki content
    const wikiContent = await getWikiContent(env);

    // Call Gemini API
    const apiKey = env.GEMINI_API_KEY;
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

    const geminiBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT + wikiContent + '\n\nUser question: ' + userMessage }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 512,
      }
    };

    try {
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody)
      });

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        console.error('Gemini error:', errText);
        return new Response(JSON.stringify({ error: 'AI service error. Please try again.' }), {
          status: 502,
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }

      const geminiData = await geminiRes.json();
      const answer = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';

      return new Response(JSON.stringify({ answer }), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });

    } catch (e) {
      console.error('Fetch error:', e);
      return new Response(JSON.stringify({ error: 'Network error. Please try again.' }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }
  }
};

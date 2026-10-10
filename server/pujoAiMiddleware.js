/**
 * Pujo AI Server Middleware
 * Handles /api/pujo-ai/chat, /api/pujo-ai/greeting, and /api/pujo-ai/status.
 * Uses official Google Gen AI SDK (@google/genai) and verified modern Gemini models.
 * Securely uses GEMINI_API_KEY from server environment without exposing it to the client.
 */

import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

// In-memory simple rate limiter (max 20 requests per minute per IP)
const requestRateMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const limit = 20;

  let record = requestRateMap.get(ip);
  if (!record || now - record.startTime > windowMs) {
    record = { startTime: now, count: 1 };
    requestRateMap.set(ip, record);
    return false;
  }

  record.count += 1;
  return record.count > limit;
}

// Streamlined, high-accuracy system prompt for Pujo AI Companion
const FESTIVAL_COMPANION_SYSTEM_PROMPT = `You are "Pujo AI", a warm, knowledgeable festival companion for Durga Puja (Sharadotsav) and Bengali traditions.
Provide concise, authentic insights on:
- Durga Puja rituals (Mahalaya, Bodhon, Sandhi Puja 108 lotuses, Nabami, Dashami Sindoor Khela, Dhunuchi Naach)
- Mythology (Maa Durga as Mahishasuramardini, triumph over Mahishasura, family deities)
- Traditions (Kolkata pandals, Dhak beats, authentic Bhog dishes, seasonal Sharad sentiments)

Guidelines:
1. Always maintain a warm, welcoming, festive tone.
2. If asked in Bengali, respond in natural, graceful Bengali (বাংলা). If in English, respond in articulate English.
3. Keep answers concise and direct (1-2 short paragraphs, under 150 words).`;

/**
 * Safely retrieve GEMINI_API_KEY from process environment or project .env file
 * Never logs or exposes the secret.
 */
export function getApiKey(env = {}) {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  if (env.GEMINI_API_KEY) return env.GEMINI_API_KEY.trim();
  if (process.env.AI_API_KEY) return process.env.AI_API_KEY.trim();
  if (env.AI_API_KEY) return env.AI_API_KEY.trim();

  // Dynamic fallback: read .env / .env.local without requiring dev server reboot
  try {
    for (const file of ['.env.local', '.env']) {
      const filePath = path.resolve(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(/^(?:GEMINI_API_KEY|AI_API_KEY)\s*=\s*(["']?)(.*?)\1$/m);
        if (match && match[2] && match[2].trim()) {
          return match[2].trim();
        }
      }
    }
  } catch {
    // ignore
  }

  return null;
}

// Verified, lightning-fast Gemini Flash models
export const PRIMARY_GEMINI_MODEL = 'gemini-3.5-flash-lite';
export const FALLBACK_GEMINI_MODEL = 'gemini-3.5-flash';

/**
 * Call Gemini using the official Google Gen AI SDK (@google/genai)
 */
export async function callGeminiApi(apiKey, userPrompt, systemPrompt = FESTIVAL_COMPANION_SYSTEM_PROMPT, maxTokens = 350) {
  const ai = new GoogleGenAI({ apiKey });

  async function executeRequest(modelName) {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: maxTokens
      }
    });

    const replyText = response.text;
    if (!replyText || !replyText.trim()) {
      throw new Error('No response content returned by Gemini model.');
    }
    return replyText.trim();
  }

  try {
    // Attempt with primary lightning-fast model
    return await executeRequest(PRIMARY_GEMINI_MODEL);
  } catch (err) {
    const rawMsg = err.message || '';

    // If primary model experiences a capacity spike, fall back to gemini-3.5-flash
    if (rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE') || rawMsg.includes('high demand') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
      try {
        return await executeRequest(FALLBACK_GEMINI_MODEL);
      } catch (fallbackErr) {
        const fallbackMsg = fallbackErr.message || '';
        if (fallbackMsg.includes('503') || fallbackMsg.includes('UNAVAILABLE')) {
          const e = new Error('Gemini service is currently experiencing high demand. Please try again shortly.');
          e.status = 503;
          throw e;
        }
      }
    }

    // Specific error mapping
    if (rawMsg.includes('API_KEY_INVALID') || rawMsg.includes('API key not valid') || rawMsg.includes('403')) {
      const e = new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY in server environment.');
      e.status = 401;
      throw e;
    }

    if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
      const e = new Error('Gemini rate limit or quota exceeded. Please wait a moment and try again.');
      e.status = 429;
      throw e;
    }

    if (rawMsg.includes('NOT_FOUND') || rawMsg.includes('404')) {
      const e = new Error('Configured Gemini model is not accessible. Please verify model permissions.');
      e.status = 404;
      throw e;
    }

    throw err;
  }
}

async function parseRequestBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  if (req.readableEnded) {
    return {};
  }

  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', (err) => {
      reject(err);
    });
    req.resume();
  });
}

export function getFallbackGreeting({ name, lang = 'en', mood = 'traditional', personalNote = '' }) {
  const isBn = lang === 'bn';
  const cleanName = (name || '').trim();
  const noteText = (personalNote || '').trim();

  const templates = {
    traditional: {
      en: {
        opening: `Dear ${cleanName},`,
        body: `May the divine presence of Maa Durga illuminate your home with peace, good health, and spiritual joy. As the sacred conch shells echo and the dhak beats resonate, may all obstacles be vanquished and divine blessings fill your life.`
      },
      bn: {
        opening: `শ্রদ্ধাস্পদ ${cleanName},`,
        body: `দেবী দুর্গার বোধনে ও পবিত্র ঢাকের আওয়াজে আপনার জীবন আনন্দ, সুস্বাস্থ্য এবং শান্তিতে ভরে উঠুক। মা দুর্গার দশভুজের আশীর্বাদে সমস্ত বিঘ্ন দূর হোক এবং আপনার সংসারে সুখ-সমৃদ্ধি চিরস্থায়ী হোক।`
      }
    },
    warm: {
      en: {
        opening: `Dear ${cleanName},`,
        body: `Sending you and your family warmest festive wishes this Sharadotsav. May the festive lights, the warmth of shared laughter, and Maa Durga’s eternal blessings bring happiness and harmony into your heart.`
      },
      bn: {
        opening: `প্রিয় ${cleanName},`,
        body: `আপনাকে ও আপনার প্রিয়জনদের জানাই শারদোৎসবের আন্তরিক ও উষ্ণ প্রীতি-শুভেচ্ছা। পুজো উপলক্ষে ঘরে ঘরে আনন্দের আলো জ্বলে উঠুক, মায়ের কৃপায় পরিবারে সুখ ও ভালোবাসা চিরন্তন হোক।`
      }
    },
    elegant: {
      en: {
        opening: `Dearest ${cleanName}, Shubho Sharadiya!`,
        body: `As azure autumn skies drift with golden sunlight and the delicate scent of Shiuli blossoms heralds Maa Durga’s homecoming, may this festival grace your life with serene elegance, inspiration, and timeless joy.`
      },
      bn: {
        opening: `প্রিয় ${cleanName}, শারদীয়ার প্রীতি ও শুভেচ্ছা!`,
        body: `নীল আকাশে শিউলির সুবাস আর কাশফুলের দোলা জানান দিচ্ছে মায়ের আগমনী বার্তা। এই আনন্দময় শরৎকালে আপনার জীবন কাব্যিক সৌন্দর্য, মার্জিত প্রশান্তি এবং নির্মল স্নিগ্ধতায় উদ্ভাসিত হোক।`
      }
    },
    poetic: {
      en: {
        opening: `Dearest ${cleanName}, Shubho Sharadiya!`,
        body: `As the autumn clouds drift across the golden sky, the white Kash flowers dance in the breeze, and the sweet scent of Shiuli fills the dawn, may this Sharadotsav bring warmth, inspiration, and timeless joy to your heart.`
      },
      bn: {
        opening: `প্রিয় ${cleanName}, শারদীয়ার প্রীতি ও শুভেচ্ছা!`,
        body: `নীল আকাশে শিউলির সুবাস আর কাশফুলের দোলা জানান দিচ্ছে মায়ের আগমনী বার্তা। এই আনন্দময় শরৎকালে আপনার জীবন কাব্যিক সৌন্দর্য, আনন্দ এবং নির্মল স্নিগ্ধতায় উদ্ভাসিত হোক।`
      }
    },
    joyful: {
      en: {
        opening: `Dear ${cleanName},`,
        body: `Get ready for the electric beats of the Dhak, dazzling pandals, vibrant Dhunuchi naach, and endless festive laughter! Wishing you an unforgettable celebration brimming with energy, togetherness, and festive fun.`
      },
      bn: {
        opening: `প্রিয় ${cleanName},`,
        body: `ঢাকের গুরুগুরু বাদ্যি, ধুনুচি নাচের উন্মাদনা আর মণ্ডপে মণ্ডপে আলোর রোশনাই নিয়ে এসেছে সেরা উৎসব। আনন্দ, হুল্লোড় আর প্রিয়জনদের সাথে এক দারুণ পুজো কাটুক আপনার!`
      }
    },
    short: {
      en: {
        opening: `Dearest ${cleanName},`,
        body: `Wishing you and your loved ones a blessed and joyous Durga Puja filled with happiness, health, and prosperity.`
      },
      bn: {
        opening: `প্রিয় ${cleanName},`,
        body: `মা দুর্গার আগমনে আপনার ও আপনার পরিবারের সকলের জীবন আনন্দ, শান্তি ও সৌভাগ্যে পূর্ণ হয়ে উঠুক।`
      }
    }
  };

  const selected = (templates[mood] || templates.traditional)[isBn ? 'bn' : 'en'];
  let message = `${selected.opening}\n\n${selected.body}`;
  if (noteText) {
    message += `\n\n"${noteText}"`;
  }
  const signoff = isBn ? 'শারদীয়ার প্রীতি ও শুভেচ্ছা!' : 'Subho Sharadiya!';
  message += `\n\n${signoff}`;

  return message;
}

/**
 * Handle incoming Pujo AI HTTP requests (compatible with Vite connect middleware and standard Node servers)
 */
export async function handlePujoAiRequest(req, res, env = {}) {
  const apiKey = getApiKey(env);
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const sendJson = (statusCode, obj) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(obj));
  };

  const urlPath = req.url ? req.url.split('?')[0] : '';

  // 1. Status Check: GET /api/pujo-ai/status
  if (req.method === 'GET' && urlPath === '/api/pujo-ai/status') {
    return sendJson(200, {
      configured: Boolean(apiKey),
      provider: apiKey ? 'Google Gemini' : null,
      model: apiKey ? PRIMARY_GEMINI_MODEL : null,
      message: apiKey 
        ? `Pujo AI is active and connected with Google Gemini (${PRIMARY_GEMINI_MODEL}).`
        : 'AI service not configured. Add GEMINI_API_KEY to your server environment (.env or Render).'
    });
  }

  // Only allow POST for chat and greeting
  if (req.method !== 'POST') {
    return sendJson(405, { success: false, error: 'Method not allowed' });
  }

  // Rate limit check
  if (isRateLimited(clientIp)) {
    return sendJson(429, { 
      success: false, 
      error: 'Too many requests. Please wait a moment before asking Pujo AI again.' 
    });
  }

  // Parse JSON Body
  let bodyData;
  try {
    bodyData = await parseRequestBody(req);
  } catch {
    return sendJson(400, { success: false, error: 'Invalid JSON request payload' });
  }

  // 2. Chat Endpoint: POST /api/pujo-ai/chat
  if (urlPath === '/api/pujo-ai/chat') {
    const prompt = (bodyData.prompt || '').trim();
    const lang = bodyData.lang === 'bn' ? 'bn' : 'en';

    if (!prompt) {
      return sendJson(400, { success: false, error: 'Question prompt cannot be empty.' });
    }
    if (prompt.length > 500) {
      return sendJson(400, { success: false, error: 'Question exceeds maximum length of 500 characters.' });
    }

    if (!apiKey) {
      return sendJson(503, {
        success: false,
        configured: false,
        error: 'Pujo AI service is currently unconfigured. Please add GEMINI_API_KEY to your server environment (.env or Render environment secrets).'
      });
    }

    try {
      const languageInstruction = lang === 'bn' 
        ? 'Please answer in natural, graceful Bengali (বাংলা).' 
        : 'Please answer in articulate, friendly English.';
      const combinedPrompt = `${prompt}\n\n[Instruction: ${languageInstruction}]`;

      const aiReply = await callGeminiApi(apiKey, combinedPrompt, FESTIVAL_COMPANION_SYSTEM_PROMPT, 350);
      return sendJson(200, { success: true, reply: aiReply });
    } catch (err) {
      return sendJson(err.status || 500, {
        success: false,
        error: err.message || 'An error occurred while generating festival insights.'
      });
    }
  }

  // 3. Greeting Creator Endpoint: POST /api/pujo-ai/greeting
  if (urlPath === '/api/pujo-ai/greeting') {
    const name = (bodyData.name || '').trim();
    const lang = bodyData.lang === 'bn' ? 'bn' : 'en';
    const mood = (bodyData.mood || 'traditional').trim();
    const personalNote = (bodyData.personalNote || '').trim();

    if (!name) {
      return sendJson(400, { success: false, error: 'Recipient name is required.' });
    }
    if (name.length > 80) {
      return sendJson(400, { success: false, error: 'Recipient name exceeds 80 characters.' });
    }
    if (personalNote.length > 250) {
      return sendJson(400, { success: false, error: 'Personal note exceeds 250 characters.' });
    }

    if (!apiKey) {
      const fallbackGreeting = getFallbackGreeting({ name, lang, mood, personalNote });
      return sendJson(200, { success: true, greeting: fallbackGreeting, isFallback: true });
    }

    try {
      const moodDescriptions = {
        traditional: 'warm, devout, and deeply anchored in traditional Bengali blessings',
        poetic: 'lyrical, evocative, capturing the beauty of Shiuli flowers, Kash flowers, and autumnal clouds',
        joyful: 'energetic, upbeat, vibrant with sounds of Dhak, pandal hops, and festive excitement',
        short: 'concise, heartfelt, elegant, and directly to the point'
      };
      const moodContext = moodDescriptions[mood] || moodDescriptions.traditional;

      const greetingPrompt = `Please craft a personalized Durga Puja greeting for: "${name}".
Language requested: ${lang === 'bn' ? 'Bengali (বাংলা)' : 'English'}.
Mood/Style: ${moodContext}.
${personalNote ? `Personal message from sender to incorporate: "${personalNote}"` : ''}

Format Rules:
- Open with EXACTLY ONE clean salutation addressed to "${name}" (e.g. "Dear ${name}," or "Dearest ${name}, Shubho Sharadiya!" / in Bengali "প্রিয় ${name}," or "শ্রদ্ধাস্পদ ${name},").
- Do NOT output duplicate opening salutations, repeated greetings, or repeat the recipient's name in the greeting body.
- Follow directly with a sincere, uplifting blessing invoking Maa Durga's arrival, joy, resilience, and prosperity.
- Conclude with a classic Sharadotsav festive sign-off (such as "Subho Sharadiya!" or "শারদীয়ার প্রীতি ও শুভেচ্ছা!").
- Keep it between 50 to 120 words. Output only the greeting text itself.`;

      const generatedGreeting = await callGeminiApi(apiKey, greetingPrompt, undefined, 200);
      return sendJson(200, { success: true, greeting: generatedGreeting, isFallback: false });
    } catch (err) {
      console.warn('[Pujo AI Greeting fallback engaged]:', err.message);
      const fallbackGreeting = getFallbackGreeting({ name, lang, mood, personalNote });
      return sendJson(200, { success: true, greeting: fallbackGreeting, isFallback: true });
    }
  }

  return sendJson(404, { success: false, error: 'Endpoint not found' });
}

/**
 * Vite Plugin that registers the /api/pujo-ai endpoint in development
 */
export function pujoAiPlugin(env = {}) {
  return {
    name: 'pujo-ai-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/pujo-ai')) {
          try {
            await handlePujoAiRequest(req, res, env);
          } catch (err) {
            console.error('[Pujo AI Server Middleware Error]:', err.message);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
          }
          return;
        }
        next();
      });
    }
  };
}

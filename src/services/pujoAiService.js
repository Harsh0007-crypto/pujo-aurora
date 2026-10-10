/**
 * Pujo AI Frontend Service
 * Communicates with the secure backend endpoint at /api/pujo-ai
 */

export async function fetchAiStatus() {
  try {
    const res = await fetch('/api/pujo-ai/status');
    if (!res.ok) {
      return { configured: false, error: `Server returned HTTP ${res.status}` };
    }
    const data = await res.json();
    return data;
  } catch (err) {
    return { configured: false, error: err.message || 'Network error' };
  }
}

export async function sendChatMessage(prompt, lang = 'en', timeoutMs = 15000) {
  const cleanPrompt = (prompt || '').trim();
  if (!cleanPrompt) {
    throw new Error(lang === 'bn' ? 'অনুগ্রহ করে একটি প্রশ্ন লিখুন।' : 'Please enter a question prompt.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('/api/pujo-ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: cleanPrompt, lang }),
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data?.error || (
        response.status === 503
          ? (lang === 'bn' 
              ? 'পুজো এআই সেবাটি বর্তমানে কনফিগার করা নেই। সার্ভারে GEMINI_API_KEY সেট করুন।' 
              : 'Pujo AI service is currently not configured. Set GEMINI_API_KEY in your server environment.')
          : `Request failed (HTTP ${response.status})`
      );
      const error = new Error(errorMessage);
      error.status = response.status;
      error.configured = data?.configured ?? false;
      throw error;
    }

    return data.reply;
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutError = new Error(
        lang === 'bn'
          ? 'অনুরোধের সময়সীমা উত্তীর্ণ হয়েছে (১৫ সেকেন্ড)। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
          : 'Request timed out after 15 seconds. Please tap Retry.'
      );
      timeoutError.isTimeout = true;
      throw timeoutError;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const FALLBACK_TEMPLATES = {
  traditional: {
    en: {
      opening: (name) => `Dear ${name},`,
      body: 'May the divine presence of Maa Durga illuminate your home with peace, good health, and spiritual joy. As the sacred conch shells echo and the dhak beats resonate, may all obstacles be vanquished and divine blessings fill your life.'
    },
    bn: {
      opening: (name) => `শ্রদ্ধাস্পদ ${name},`,
      body: 'দেবী দুর্গার বোধনে ও পবিত্র ঢাকের আওয়াজে আপনার জীবন আনন্দ, সুস্বাস্থ্য এবং শান্তিতে ভরে উঠুক। মা দুর্গার দশভুজের আশীর্বাদে সমস্ত বিঘ্ন দূর হোক এবং আপনার সংসারে সুখ-সমৃদ্ধি চিরস্থায়ী হোক।'
    }
  },
  warm: {
    en: {
      opening: (name) => `Dear ${name},`,
      body: 'Sending you and your family warmest festive wishes this Sharadotsav. May the festive lights, the warmth of shared laughter, and Maa Durga’s eternal blessings bring happiness and harmony into your heart.'
    },
    bn: {
      opening: (name) => `প্রিয় ${name},`,
      body: 'আপনাকে ও আপনার প্রিয়জনদের জানাই শারদোৎসবের আন্তরিক ও উষ্ণ প্রীতি-শুভেচ্ছা। পুজো উপলক্ষে ঘরে ঘরে আনন্দের আলো জ্বলে উঠুক, মায়ের কৃপায় পরিবারে সুখ ও ভালোবাসা চিরন্তন হোক।'
    }
  },
  elegant: {
    en: {
      opening: (name) => `Dearest ${name}, Shubho Sharadiya!`,
      body: 'As azure autumn skies drift with golden sunlight and the delicate scent of Shiuli blossoms heralds Maa Durga’s homecoming, may this festival grace your life with serene elegance, inspiration, and timeless joy.'
    },
    bn: {
      opening: (name) => `প্রিয় ${name}, শারদীয়ার প্রীতি ও শুভেচ্ছা!`,
      body: 'নীল আকাশে শিউলির সুবাস আর কাশফুলের দোলা জানান দিচ্ছে মায়ের আগমনী বার্তা। এই আনন্দময় শরৎকালে আপনার জীবন কাব্যিক সৌন্দর্য, মার্জিত প্রশান্তি এবং নির্মল স্নিগ্ধতায় উদ্ভাসিত হোক।'
    }
  },
  poetic: {
    en: {
      opening: (name) => `Dearest ${name}, Shubho Sharadiya!`,
      body: 'As the autumn clouds drift across the golden sky, the white Kash flowers dance in the breeze, and the sweet scent of Shiuli fills the dawn, may this Sharadotsav bring warmth, inspiration, and timeless joy to your heart.'
    },
    bn: {
      opening: (name) => `প্রিয় ${name}, শারদীয়ার প্রীতি ও শুভেচ্ছা!`,
      body: 'নীল আকাশে শিউলির সুবাস আর কাশফুলের দোলা জানান দিচ্ছে মায়ের আগমনী বার্তা। এই আনন্দময় শরৎকালে আপনার জীবন কাব্যিক সৌন্দর্য, আনন্দ এবং নির্মল স্নিগ্ধতায় উদ্ভাসিত হোক।'
    }
  },
  joyful: {
    en: {
      opening: (name) => `Dear ${name},`,
      body: 'Get ready for the electric beats of the Dhak, dazzling pandals, vibrant Dhunuchi naach, and endless festive laughter! Wishing you an unforgettable celebration brimming with energy, togetherness, and festive fun.'
    },
    bn: {
      opening: (name) => `প্রিয় ${name},`,
      body: 'ঢাকের গুরুগুরু বাদ্যি, ধুনুচি নাচের উন্মাদনা আর মণ্ডপে মণ্ডপে আলোর রোশনাই নিয়ে এসেছে সেরা উৎসব। আনন্দ, হুল্লোড় আর প্রিয়জনদের সাথে এক দারুণ পুজো কাটুক আপনার!'
    }
  },
  short: {
    en: {
      opening: (name) => `Dearest ${name},`,
      body: 'Wishing you and your loved ones a blessed and joyous Durga Puja filled with happiness, health, and prosperity.'
    },
    bn: {
      opening: (name) => `প্রিয় ${name},`,
      body: 'মা দুর্গার আগমনে আপনার ও আপনার পরিবারের সকলের জীবন আনন্দ, শান্তি ও সৌভাগ্যে পূর্ণ হয়ে উঠুক।'
    }
  }
};

export function createFallbackGreetingText({ name, lang = 'en', mood = 'traditional', personalNote = '' }) {
  const isBn = lang === 'bn';
  const cleanName = (name || '').trim();
  const noteText = (personalNote || '').trim();
  const selected = (FALLBACK_TEMPLATES[mood] || FALLBACK_TEMPLATES.traditional)[isBn ? 'bn' : 'en'];
  
  let text = `${selected.opening(cleanName)}\n\n${selected.body}`;
  if (noteText) {
    text += `\n\n"${noteText}"`;
  }
  const signoff = isBn ? 'শারদীয়ার প্রীতি ও শুভেচ্ছা!' : 'Subho Sharadiya!';
  text += `\n\n${signoff}`;
  return text;
}

export async function generateAiGreeting({ name, lang = 'en', mood = 'traditional', personalNote = '', timeoutMs = 15000 }) {
  const cleanName = (name || '').trim();
  if (!cleanName) {
    throw new Error(lang === 'bn' ? 'অনুগ্রহ করে প্রাপকের নাম লিখুন।' : 'Please enter recipient name.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('/api/pujo-ai/greeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: cleanName, 
        lang, 
        mood, 
        personalNote: (personalNote || '').trim() 
      }),
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (data?.configured === false || response.status === 503) {
        // Fall back gracefully to local template
        return {
          greeting: createFallbackGreetingText({ name: cleanName, lang, mood, personalNote }),
          isFallback: true
        };
      }
      throw new Error(data?.error || `Greeting generation failed (HTTP ${response.status})`);
    }

    return {
      greeting: data.greeting,
      isFallback: Boolean(data.isFallback)
    };
  } catch {
    // If network failed entirely or timed out, provide clean fallback
    return {
      greeting: createFallbackGreetingText({ name: cleanName, lang, mood, personalNote }),
      isFallback: true
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

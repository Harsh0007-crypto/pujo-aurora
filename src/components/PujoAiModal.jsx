import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  Copy, 
  Check, 
  Share2, 
  AlertCircle, 
  MessageSquare, 
  RotateCcw,
  Download,
  Loader2
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { sendChatMessage, generateAiGreeting, fetchAiStatus } from '../services/pujoAiService';

const SUGGESTED_QUESTIONS = [
  {
    en: 'What is the significance of Bodhon and Mahalaya?',
    bn: 'মহালয়া ও দেবীর বোধনের তাৎপর্য কী?'
  },
  {
    en: 'Explain the 108 lotuses ritual during Sandhi Puja',
    bn: 'সন্ধিপুজোয় ১০৮টি পদ্মের বিশেষ তাৎপর্য কী?'
  },
  {
    en: 'What are the classic Bhog dishes and festive sweets?',
    bn: 'পুজোর মহাপ্রসাদ ভোগ এবং ঐতিহ্যবাহী মিষ্টি কী কী?'
  },
  {
    en: 'Why is the Dhak rhythm and Dhunuchi Naach central to Pujo?',
    bn: 'ঢাকের বাদ্যি ও ধুনুচি নাচের বিশেষ গুরুত্ব কী?'
  }
];

const GREETING_MOODS = [
  { id: 'traditional', labelEn: 'Traditional', labelBn: 'ঐতিহ্যবাহী' },
  { id: 'warm', labelEn: 'Warm', labelBn: 'উষ্ণ ও আন্তরিক' },
  { id: 'elegant', labelEn: 'Elegant', labelBn: 'মার্জিত ও কাব্যিক' }
];

/**
 * Authentic Bengali Sharadotsav Shiuli Blossom SVG Motif
 * Delicate white star petals radiating from a vibrant coral-orange calyx center
 */
/**
 * Authentic Bengali Sharadotsav Shiuli Blossom SVG Motif
 * Delicate white star petals radiating from a vibrant coral-orange calyx center
 */
const ShiuliBlossom = ({ size = 20, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`shiuli-blossom-svg ${className}`}
    aria-hidden="true"
  >
    <g transform="translate(20, 20)">
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <path
          key={i}
          d="M0,-3 C-4,-7 -5,-13 0,-17 C5,-13 4,-7 0,-3 Z"
          fill="#ffffff"
          stroke="#ffedd5"
          strokeWidth="0.6"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx="0" cy="0" r="4.2" fill="#ff5e13" />
      <circle cx="0" cy="0" r="2.2" fill="#ff8c38" />
    </g>
  </svg>
);

/**
 * Traditional Golden Alpona / Corner Filigree Motif for Greeting Card
 */
const CardCornerMotif = ({ position = 'top-left' }) => (
  <svg 
    width="28" 
    height="28" 
    viewBox="0 0 28 28" 
    fill="none" 
    className={`card-corner-motif corner-${position}`}
    aria-hidden="true"
  >
    <path 
      d="M2 26 V10 C2 5.58 5.58 2 10 2 H26" 
      stroke="#ffd670" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
    />
    <path 
      d="M6 26 V12 C6 8.68 8.68 6 12 6 H26" 
      stroke="rgba(255, 214, 112, 0.45)" 
      strokeWidth="1" 
      strokeLinecap="round" 
    />
    <circle cx="10" cy="10" r="2" fill="#ffd670" />
  </svg>
);

/**
 * Expressive Semi-Cartoon Durga Maa Eyes & Forehead Ornament
 * Features traditional Bengali almond-shaped eyes (পটলচেরা চোখ),
 * sweeping winged kajal, luminous third eye (ত্রিনয়ন), chandan bindi alpona,
 * red vermilion bindi, and golden tiara crest.
 */
const MaaDurgaEyes = ({ className = '' }) => (
  <svg
    viewBox="0 0 280 100"
    width="100%"
    height="auto"
    className={`maa-durga-eyes-svg ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Durga Maa Sacred Eyes"
  >
    <defs>
      <linearGradient id="durgaGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff3bf" />
        <stop offset="50%" stopColor="#ffd670" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <radialGradient id="durgaThirdEyeGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fffbeb" />
        <stop offset="45%" stopColor="#f59e0b" />
        <stop offset="85%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#991b1b" />
      </radialGradient>
      <radialGradient id="durgaIrisGrad" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#78350f" />
        <stop offset="40%" stopColor="#451a03" />
        <stop offset="80%" stopColor="#1c1917" />
        <stop offset="100%" stopColor="#09090b" />
      </radialGradient>
      <filter id="durgaEyeGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Golden Tiara Crest / Mukut Peak */}
    <path
      d="M 120,16 Q 140,2 160,16 Q 140,24 120,16 Z"
      fill="url(#durgaGoldGrad)"
      stroke="#ffe8a3"
      strokeWidth="0.8"
    />
    <circle cx="140" cy="9" r="3.2" fill="#dc2626" stroke="#ffd670" strokeWidth="0.8" />
    <circle cx="140" cy="9" r="1.2" fill="#fff" />

    {/* Sacred Third Eye (Trinayana) */}
    <path
      d="M 140,22 C 149,34 149,46 140,54 C 131,46 131,34 140,22 Z"
      fill="url(#durgaThirdEyeGrad)"
      stroke="#ffd670"
      strokeWidth="1.2"
      filter="url(#durgaEyeGlow)"
    />
    <ellipse cx="140" cy="38" rx="2.4" ry="4.2" fill="#450a0a" />
    <circle cx="140" cy="36" r="1.2" fill="#ffffff" />

    {/* Vermilion Kumkum Bindi */}
    <circle cx="140" cy="66" r="8" fill="#dc2626" stroke="#ffedd5" strokeWidth="1" />
    <circle cx="140" cy="66" r="3.2" fill="#ffd670" />
    <circle cx="140" cy="66" r="1.4" fill="#dc2626" />

    {/* Traditional Chandan Alpona (Sandalwood Dots) above Eyebrows */}
    {[
      [60, 48], [72, 42], [85, 38], [98, 36], [112, 38], [124, 43]
    ].map(([cx, cy], i) => (
      <g key={`cl-${i}`}>
        <circle cx={cx} cy={cy} r="2.2" fill="#ffffff" />
        <circle cx={cx} cy={cy} r="0.9" fill="#dc2626" />
      </g>
    ))}
    {[
      [220, 48], [208, 42], [195, 38], [182, 36], [168, 38], [156, 43]
    ].map(([cx, cy], i) => (
      <g key={`cr-${i}`}>
        <circle cx={cx} cy={cy} r="2.2" fill="#ffffff" />
        <circle cx={cx} cy={cy} r="0.9" fill="#dc2626" />
      </g>
    ))}

    {/* Arched Bold Eyebrows */}
    <path
      d="M 50,56 C 75,36 105,38 126,50 C 112,47 85,45 50,56 Z"
      fill="#1c1917"
      stroke="#1c1917"
      strokeWidth="0.8"
    />
    <path
      d="M 230,56 C 205,36 175,38 154,50 C 168,47 195,45 230,56 Z"
      fill="#1c1917"
      stroke="#1c1917"
      strokeWidth="0.8"
    />

    {/* Left Durga Eye (Elongated Almond with dramatic winged kajal) */}
    <path
      d="M 45,71 C 65,52 105,53 125,72 C 105,88 65,86 45,71 Z"
      fill="#fffdfa"
      stroke="#ffe4e6"
      strokeWidth="0.5"
    />
    <ellipse cx="88" cy="71" rx="13" ry="12" fill="url(#durgaIrisGrad)" />
    <circle cx="88" cy="71" r="7.5" fill="#09090b" />
    <circle cx="91.5" cy="67.5" r="3.4" fill="#ffffff" />
    <circle cx="84.5" cy="74.5" r="1.6" fill="rgba(255, 255, 255, 0.75)" />
    <path
      d="M 34,64 C 42,67 52,70 60,67 C 80,59 108,60 126,72 C 108,63 78,63 56,71 C 46,75 38,72 34,64 Z"
      fill="#09090b"
    />
    <path
      d="M 45,71 C 68,86 104,86 125,72 C 104,83 68,83 45,71 Z"
      fill="#1c1917"
    />

    {/* Right Durga Eye */}
    <path
      d="M 235,71 C 215,52 175,53 155,72 C 175,88 215,86 235,71 Z"
      fill="#fffdfa"
      stroke="#ffe4e6"
      strokeWidth="0.5"
    />
    <ellipse cx="192" cy="71" rx="13" ry="12" fill="url(#durgaIrisGrad)" />
    <circle cx="192" cy="71" r="7.5" fill="#09090b" />
    <circle cx="195.5" cy="67.5" r="3.4" fill="#ffffff" />
    <circle cx="188.5" cy="74.5" r="1.6" fill="rgba(255, 255, 255, 0.75)" />
    <path
      d="M 246,64 C 238,67 228,70 220,67 C 200,59 172,60 154,72 C 172,63 202,63 224,71 C 234,75 242,72 246,64 Z"
      fill="#09090b"
    />
    <path
      d="M 235,71 C 212,86 176,86 155,72 C 176,83 212,83 235,71 Z"
      fill="#1c1917"
    />

    {/* Sacred Tilak & Nose Ring (Nath) Hint */}
    <path
      d="M 137,88 C 137,94 140,96 140,99 C 140,96 143,94 143,88 Z"
      fill="url(#durgaGoldGrad)"
    />
    <path
      d="M 138,89 A 9 9 0 0 0 130,97"
      stroke="#ffd670"
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="130" cy="97" r="1.8" fill="#dc2626" />
  </svg>
);

/**
 * Illustrated Hanging Brass Temple Bell with Golden Highlights
 */
const HangingTempleBell = ({ className = '', side = 'left' }) => (
  <svg
    viewBox="0 0 40 76"
    width="28"
    height="53"
    className={`hanging-temple-bell ${side === 'right' ? 'bell-right' : 'bell-left'} ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id={`bellGold-${side}`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#d97706" />
        <stop offset="35%" stopColor="#fef08a" />
        <stop offset="70%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#92400e" />
      </linearGradient>
    </defs>
    <line x1="20" y1="0" x2="20" y2="28" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
    <circle cx="20" cy="29" r="3.5" stroke="#fef08a" strokeWidth="1.4" fill="none" />
    <path
      d="M 14,35 C 14,35 11,54 5,60 C 14,64 26,64 35,60 C 29,54 26,35 26,35 Z"
      fill={`url(#bellGold-${side})`}
      stroke="#ffd670"
      strokeWidth="0.8"
    />
    <ellipse cx="20" cy="60" rx="15" ry="3.5" fill={`url(#bellGold-${side})`} stroke="#ffe4e6" strokeWidth="0.6" />
    <circle cx="20" cy="67" r="3.2" fill="#ffd670" stroke="#b45309" strokeWidth="0.8" />
  </svg>
);

/**
 * Illustrated Bengali Dhak Drum with Feather Plumes (Palak) and Kathis
 */
const FestiveDhakIllustration = ({ className = '' }) => (
  <svg
    viewBox="0 0 72 68"
    width="52"
    height="49"
    className={`festive-dhak-svg ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="dhakCloth" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#dc2626" />
        <stop offset="50%" stopColor="#b91c1c" />
        <stop offset="100%" stopColor="#7f1d1d" />
      </linearGradient>
    </defs>
    {/* White Feather Plumes (Palak) protruding from the rim */}
    <g>
      <path d="M 44,18 C 50,6 64,2 70,5 C 64,12 56,16 46,20 Z" fill="#ffffff" opacity="0.95" />
      <path d="M 46,20 C 54,11 68,10 71,16 C 63,20 54,22 47,23 Z" fill="#f8fafc" opacity="0.9" />
      <path d="M 43,15 C 47,4 58,1 62,3 C 56,9 50,13 44,17 Z" fill="#ffedd5" opacity="0.85" />
    </g>
    {/* Dhak Main Barrel Body */}
    <path
      d="M 12,24 C 6,36 6,52 14,62 C 26,65 42,61 48,52 C 54,40 52,28 44,20 C 34,16 20,18 12,24 Z"
      fill="url(#dhakCloth)"
      stroke="#ffd670"
      strokeWidth="1"
    />
    <ellipse cx="28" cy="20" rx="16" ry="6" fill="#fef3c7" stroke="#b45309" strokeWidth="1" />
    <ellipse cx="28" cy="20" rx="13" ry="4.5" fill="#fffbeb" />
    {/* Tension Cords (Khore) */}
    <path d="M 16,23 L 38,59" stroke="#fef08a" strokeWidth="0.8" opacity="0.85" />
    <path d="M 26,24 L 20,62" stroke="#fef08a" strokeWidth="0.8" opacity="0.85" />
    <path d="M 38,22 L 15,52" stroke="#fef08a" strokeWidth="0.8" opacity="0.85" />
    <path d="M 44,23 L 30,62" stroke="#fef08a" strokeWidth="0.8" opacity="0.85" />
    <path d="M 9,39 C 22,44 38,42 50,33" stroke="#ffd670" strokeWidth="1.8" fill="none" />
    {/* Kathis */}
    <line x1="4" y1="48" x2="46" y2="12" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="8" y1="20" x2="52" y2="44" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/**
 * Illustrated Terracotta Diya with Glowing Flame & Shiuli Petal Accent
 */
const FestiveDiyaIllustration = ({ className = '' }) => (
  <svg
    viewBox="0 0 68 56"
    width="48"
    height="40"
    className={`festive-diya-svg ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="diyaClay" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ea580c" />
        <stop offset="50%" stopColor="#c2410c" />
        <stop offset="100%" stopColor="#7c2d12" />
      </linearGradient>
      <radialGradient id="diyaFlame" cx="50%" cy="70%" r="60%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="25%" stopColor="#fef08a" />
        <stop offset="60%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#dc2626" />
      </radialGradient>
      <radialGradient id="diyaGlowAura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(251, 191, 36, 0.45)" />
        <stop offset="100%" stopColor="rgba(251, 191, 36, 0)" />
      </radialGradient>
    </defs>
    <circle cx="34" cy="20" r="18" fill="url(#diyaGlowAura)" />
    <path
      d="M 12,35 C 12,47 22,53 34,53 C 46,53 56,47 56,35 C 44,38 24,38 12,35 Z"
      fill="url(#diyaClay)"
      stroke="#ffd670"
      strokeWidth="1"
    />
    <ellipse cx="34" cy="35" rx="22" ry="5.5" fill="#9a3412" stroke="#ffd670" strokeWidth="0.8" />
    <ellipse cx="34" cy="35" rx="18" ry="3.8" fill="#d97706" />
    <line x1="34" y1="35" x2="34" y2="28" stroke="#1c1917" strokeWidth="1.6" strokeLinecap="round" />
    <path
      d="M 34,7 C 41,18 43,26 34,29 C 25,26 27,18 34,7 Z"
      fill="url(#diyaFlame)"
    />
    <path
      d="M 34,14 C 38,20 38,24 34,27 C 30,24 30,20 34,14 Z"
      fill="#ffffff"
      opacity="0.9"
    />
    <g transform="translate(14, 46) scale(0.38)">
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <path
          key={i}
          d="M0,-3 C-4,-7 -5,-13 0,-17 C5,-13 4,-7 0,-3 Z"
          fill="#ffffff"
          stroke="#ffedd5"
          strokeWidth="0.6"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx="0" cy="0" r="4.2" fill="#ff5e13" />
    </g>
  </svg>
);

/**
 * Subtle Bengali Pandal Arch Backdrop Watermark
 */
const PandalArchSilhouette = ({ className = '' }) => (
  <svg
    viewBox="0 0 400 130"
    width="100%"
    height="auto"
    className={`pandal-arch-silhouette ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="pandalGoldArch" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="rgba(255, 214, 112, 0.02)" />
        <stop offset="50%" stopColor="rgba(255, 214, 112, 0.12)" />
        <stop offset="100%" stopColor="rgba(255, 214, 112, 0.28)" />
      </linearGradient>
    </defs>
    <path
      d="M 40,130 C 40,75 110,35 200,35 C 290,35 360,75 360,130"
      stroke="url(#pandalGoldArch)"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M 70,130 C 70,90 125,55 200,55 C 275,55 330,90 330,130"
      stroke="rgba(255, 214, 112, 0.15)"
      strokeWidth="1.2"
      strokeDasharray="4 3"
      fill="none"
    />
    <path
      d="M 200,10 L 205,35 L 195,35 Z"
      fill="rgba(255, 214, 112, 0.35)"
    />
    <circle cx="200" cy="8" r="3" fill="#ffd670" opacity="0.6" />
    {[
      [90, 98], [120, 78], [155, 62], [200, 52], [245, 62], [280, 78], [310, 98]
    ].map(([lx, ly], i) => (
      <circle key={`fl-${i}`} cx={lx} cy={ly} r="2.2" fill="#fde047" opacity="0.65" />
    ))}
  </svg>
);

/**
 * Parses greeting text into exactly one clean opening, body, and footer.
 * Prevents duplicate salutations like "Dear Harsh," followed by "Dearest Harsh, Shubho Mahalaya!".
 */
function parseGreeting(text, recipientName = '', lang = 'en') {
  if (!text) return { opening: '', body: '', footer: '' };

  const lines = text.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { opening: '', body: '', footer: '' };

  const cleanName = recipientName.trim();
  const escapedName = cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const salutationRegex = new RegExp(
    `^(?:Dear|Dearest|To\\s+(?:dear|my)?|Wishing|Warm\\s+wishes\\s+to|শ্রদ্ধাস্পদ|প্রিয়|স্নেহের|পূজনীয়|শ্রীযুক্ত|শ্রদ্ধেয়)\\s+.*${escapedName}.*`,
    'i'
  );

  let opening = '';
  let bodyLines = [];

  if (salutationRegex.test(lines[0]) || (cleanName && lines[0].toLowerCase().includes(cleanName.toLowerCase()) && lines[0].length < cleanName.length + 35)) {
    opening = lines[0];
    bodyLines = lines.slice(1);
  } else {
    if (/^(?:Dear|Dearest|শ্রদ্ধাস্পদ|প্রিয়|স্নেহের)\b/i.test(lines[0])) {
      opening = lines[0];
      bodyLines = lines.slice(1);
    } else {
      opening = lang === 'bn' ? `শ্রদ্ধাস্পদ ${cleanName},` : `Dear ${cleanName},`;
      bodyLines = lines;
    }
  }

  // Remove duplicate salutations in subsequent body lines
  while (bodyLines.length > 0) {
    const firstBody = bodyLines[0];
    const isDuplicateSalutation =
      salutationRegex.test(firstBody) ||
      (cleanName && firstBody.toLowerCase().startsWith('dear ' + cleanName.toLowerCase())) ||
      (cleanName && firstBody.toLowerCase().startsWith('dearest ' + cleanName.toLowerCase())) ||
      (cleanName && (firstBody.startsWith('প্রিয় ' + cleanName) || firstBody.startsWith('শ্রদ্ধাস্পদ ' + cleanName))) ||
      (cleanName && firstBody.includes(cleanName) && firstBody.length < cleanName.length + 35);

    if (isDuplicateSalutation) {
      if (
        firstBody.length > opening.length &&
        (firstBody.includes('Subho') || firstBody.includes('Shubho') || firstBody.includes('Mahalaya') || firstBody.includes('শারদীয়া'))
      ) {
        opening = firstBody;
      }
      bodyLines.shift();
    } else {
      break;
    }
  }

  let footer = lang === 'bn' ? '— শারদীয়ার প্রীতি ও আন্তরিক শুভেচ্ছা' : '— Warm Sharod Wishes & Blessings';
  if (bodyLines.length > 0) {
    const lastLine = bodyLines[bodyLines.length - 1];
    if (
      /^(?:—|-|~)?\s*(?:Subho|Shubho|Shubh)\s+Sharad[i|y]ya[!.]?$/i.test(lastLine) ||
      /^(?:—|-|~)?\s*শারদীয়ার\s+প্রীতি\s+ও\s+শুভেচ্ছা[!.]?$/.test(lastLine) ||
      /^(?:—|-|~)?\s*শারদীয়ার\s+প্রীতি\s+ও\s+আন্তরিক\s+শুভেচ্ছা[!.]?$/.test(lastLine) ||
      /^(?:—|-|~)?\s*Warm\s+(?:Festival|Sharod)\s+Wishes(?:\s+&\s+Blessings)?[!.]?$/i.test(lastLine)
    ) {
      footer = lastLine.startsWith('—') ? lastLine : `— ${lastLine}`;
      bodyLines.pop();
    }
  }

  return {
    opening,
    body: bodyLines.join('\n\n'),
    footer
  };
}

const PujoAiModal = ({ isOpen, onClose, lang = 'en' }) => {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'greeting'
  const [isAiConfigured, setIsAiConfigured] = useState(null); // null | boolean
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: lang === 'bn'
        ? 'নমস্কার! আমি পুজো এআই — আপনার শারদীয় উৎসব সঙ্গী। দুর্গাপুজোর ইতিহাস, রীতিনীতি, ভোগ, ঢাক কিংবা কলকাতার মণ্ডপ সংস্কৃতি সম্পর্কে যেকোনো প্রশ্ন জিজ্ঞাসা করতে পারেন!'
        : 'Namaskar! I am Pujo AI — your festival companion for Durga Puja. Ask me anything about rituals, mythology, traditional Bhog, Dhak rhythms, or pandal customs!'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [chatLang, setChatLang] = useState(lang);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [lastFailedPrompt, setLastFailedPrompt] = useState('');

  // Greeting state
  const [greetingName, setGreetingName] = useState('');
  const [greetingLang, setGreetingLang] = useState(lang);
  const [greetingMood, setGreetingMood] = useState('traditional');
  const [personalNote, setPersonalNote] = useState('');
  const [generatedGreeting, setGeneratedGreeting] = useState('');
  const [isFallbackGreeting, setIsFallbackGreeting] = useState(false);
  const [isGreetingLoading, setIsGreetingLoading] = useState(false);
  const [greetingError, setGreetingError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharingImage, setIsSharingImage] = useState(false);

  const cardRef = useRef(null);

  const [prevLang, setPrevLang] = useState(lang);
  if (lang !== prevLang) {
    setPrevLang(lang);
    setChatLang(lang);
    setGreetingLang(lang);
  }

  const messagesEndRef = useRef(null);

  // Check backend AI configuration status on open
  useEffect(() => {
    if (isOpen) {
      fetchAiStatus().then((status) => {
        setIsAiConfigured(Boolean(status?.configured));
      });
    }
  }, [isOpen]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatLoading, activeTab]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Send Chat Message
  const handleSendMessage = useCallback(async (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isChatLoading) return;

    setChatError('');
    setInputQuery('');

    // Append user message
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const reply = await sendChatMessage(query, chatLang);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: reply
      };
      setChatMessages((prev) => [...prev, aiMsg]);
      setIsAiConfigured(true);
      setLastFailedPrompt('');
    } catch (err) {
      console.warn('Pujo AI chat request caught:', err);
      setLastFailedPrompt(query);
      setChatError(err.message || 'Unable to connect to Pujo AI.');
      if (err.configured === false) {
        setIsAiConfigured(false);
      }
    } finally {
      setIsChatLoading(false);
    }
  }, [inputQuery, isChatLoading, chatLang]);

  // Retry sending the last failed chat message
  const handleRetry = useCallback(() => {
    if (lastFailedPrompt && !isChatLoading) {
      handleSendMessage(lastFailedPrompt);
    }
  }, [lastFailedPrompt, isChatLoading, handleSendMessage]);

  // Generate Greeting
  const handleGenerateGreeting = async (e) => {
    e?.preventDefault();
    if (!greetingName.trim() || isGreetingLoading) return;

    setGreetingError('');
    setDownloadError('');
    setIsGreetingLoading(true);
    setIsCopied(false);
    setShareFeedback('');

    try {
      const result = await generateAiGreeting({
        name: greetingName.trim(),
        lang: greetingLang,
        mood: greetingMood,
        personalNote: personalNote.trim()
      });
      if (typeof result === 'object' && result !== null) {
        setGeneratedGreeting(result.greeting || '');
        setIsFallbackGreeting(Boolean(result.isFallback));
      } else {
        setGeneratedGreeting(result || '');
        setIsFallbackGreeting(false);
      }
      setIsAiConfigured(true);
    } catch (err) {
      console.warn('Pujo AI greeting request caught:', err);
      setGreetingError(err.message || 'Failed to generate festive greeting.');
      if (err.configured === false) {
        setIsAiConfigured(false);
      }
    } finally {
      setIsGreetingLoading(false);
    }
  };

  // Parse generated greeting into single opening, body, and footer
  const parsedGreeting = useMemo(() => {
    return parseGreeting(generatedGreeting, greetingName, greetingLang);
  }, [generatedGreeting, greetingName, greetingLang]);

  // Download Greeting Card as a High-Quality PNG
  const handleDownloadCard = async () => {
    if (!cardRef.current || isDownloading) return;
    setIsDownloading(true);
    setDownloadError('');

    try {
      if (document.fonts) {
        await document.fonts.ready;
      }

      // Convert card element to high-res crisp PNG
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: '#0d122b'
      });

      if (typeof window !== 'undefined') {
        window.__lastExportedCardDataUrl = dataUrl;
      }

      const cleanTargetName = (greetingName || 'Sharadiya').trim().replace(/[^a-zA-Z0-9_\u0980-\u09FF]/g, '_');
      const filename = `Pujo_Greeting_${cleanTargetName}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      setShareFeedback(lang === 'bn' ? 'কার্ড ডাউনলোড সম্পন্ন হয়েছে!' : 'Greeting card downloaded!');
      setTimeout(() => setShareFeedback(''), 3500);
    } catch (err) {
      console.error('Error generating greeting card image:', err);
      setDownloadError(
        lang === 'bn'
          ? 'কার্ড ডাউনলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে টেক্সট কপি করুন বা পুনরায় চেষ্টা করুন।'
          : 'Could not generate card image. Please try again or copy the greeting text.'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy Greeting to Clipboard
  const handleCopyGreeting = async () => {
    if (!generatedGreeting) return;
    const fullText = `${parsedGreeting.opening}\n\n${parsedGreeting.body}\n\n${parsedGreeting.footer}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      setGreetingError('Could not copy to clipboard. Please copy manually.');
    }
  };

  // Share Greeting via Web Share API (Images where supported, fallback to text)
  const handleShareGreeting = async () => {
    if (!generatedGreeting || isSharingImage) return;

    const fullText = `${parsedGreeting.opening}\n\n${parsedGreeting.body}\n\n${parsedGreeting.footer}`;
    setIsSharingImage(true);
    setDownloadError('');

    try {
      const cleanTargetName = (greetingName || 'Sharadiya').trim().replace(/[^a-zA-Z0-9_\u0980-\u09FF]/g, '_');
      const filename = `Pujo_Greeting_${cleanTargetName}.png`;

      // If Web Share API supports file sharing, export card image and share file directly
      if (cardRef.current && navigator.share && navigator.canShare) {
        if (document.fonts) await document.fonts.ready;
        const dataUrl = await toPng(cardRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: '#0d122b'
        });

        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], filename, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Subho Sharadiya Greetings ✨',
            text: fullText,
            files: [file]
          });
          setShareFeedback(lang === 'bn' ? 'শুভেচ্ছা কার্ড শেয়ার সম্পন্ন হয়েছে!' : 'Greeting card shared!');
          setTimeout(() => setShareFeedback(''), 3000);
          return;
        }
      }

      // Fallback: Web Share API with text
      if (navigator.share && navigator.canShare && navigator.canShare({ text: fullText })) {
        await navigator.share({
          title: 'Subho Sharadiya Greetings ✨',
          text: fullText,
          url: window.location.href
        });
        setShareFeedback(lang === 'bn' ? 'শুভেচ্ছা শেয়ার সম্পন্ন হয়েছে!' : 'Greeting shared!');
        setTimeout(() => setShareFeedback(''), 3000);
        return;
      }

      // Fallback: Copy to clipboard
      await handleCopyGreeting();
      setShareFeedback(lang === 'bn' ? 'ক্লিপবোর্ডে কপি করা হয়েছে!' : 'Copied to clipboard for sharing!');
      setTimeout(() => setShareFeedback(''), 3000);
    } catch (err) {
      if (err.name !== 'AbortError') {
        await handleCopyGreeting();
      }
    } finally {
      setIsSharingImage(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="pujo-ai-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pujo-ai-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="pujo-ai-container">
        {/* Header Bar */}
        <header className="pujo-ai-header">
          <div className="pujo-ai-title-group">
            <div className="pujo-ai-icon-badge">
              <Bot size={17} className="bot-svg" />
            </div>
            <div>
              <h2 id="pujo-ai-modal-title" className="pujo-ai-title">
                {lang === 'bn' ? 'পুজো এআই — উৎসব সঙ্গী' : 'Pujo AI — Your Festival Companion'}
              </h2>
              <span className="pujo-ai-subtitle">
                {lang === 'bn' ? 'শারদীয় ঐতিহ্য ও শুভেচ্ছা সহকারী' : 'Durga Puja Heritage & Greetings'}
              </span>
            </div>
          </div>

          <button 
            type="button" 
            className="pujo-ai-close-btn"
            onClick={onClose}
            aria-label={lang === 'bn' ? 'বন্ধ করুন' : 'Close AI companion'}
          >
            <X size={18} />
          </button>
        </header>

        {/* Tab Switcher */}
        <nav className="pujo-ai-tabs" aria-label="AI companion modes">
          <button
            type="button"
            className={`pujo-ai-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={14} className="tab-icon" />
            <span>{lang === 'bn' ? 'উৎসব বার্তালাপ' : 'Festival Chat'}</span>
          </button>
          <button
            type="button"
            className={`pujo-ai-tab-btn ${activeTab === 'greeting' ? 'active' : ''}`}
            onClick={() => setActiveTab('greeting')}
          >
            <Sparkles size={14} className="tab-icon" />
            <span>{lang === 'bn' ? 'শুভেচ্ছা বার্তা তৈরি' : 'Greeting Creator'}</span>
          </button>
        </nav>

        {/* Configuration Notice (when server key is not configured) */}
        {isAiConfigured === false && (
          <div className="pujo-ai-alert-banner" role="status">
            <AlertCircle size={15} className="alert-icon" />
            <div className="alert-text">
              <strong>{lang === 'bn' ? 'এআই সেবা অপেক্ষমাণ:' : 'AI Service Awaiting Configuration:'}</strong>{' '}
              {lang === 'bn'
                ? 'লাইভ এআই প্রতিক্রিয়ার জন্য সার্ভার পরিবেশে GEMINI_API_KEY সেট করুন।'
                : 'Live responses require GEMINI_API_KEY set in server environment (.env).'}
            </div>
          </div>
        )}

        {/* TAB 1: FESTIVAL CHAT */}
        {activeTab === 'chat' && (
          <div className="pujo-ai-chat-view">
            {/* Messages Thread */}
            <div className="pujo-ai-messages-thread" role="log" aria-live="polite">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`chat-bubble-row ${msg.role === 'user' ? 'user-row' : 'assistant-row'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="assistant-avatar" aria-hidden="true">
                      <Bot size={13} />
                    </div>
                  )}
                  <div className={`chat-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`}>
                    <p className="bubble-text">{msg.text}</p>
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="chat-bubble-row assistant-row">
                  <div className="assistant-avatar" aria-hidden="true">
                    <Bot size={13} />
                  </div>
                  <div className="chat-bubble assistant-bubble loading-bubble">
                    <Sparkles size={13} className="thinking-sparkle" />
                    <span className="dot-pulse" />
                    <span className="dot-pulse" />
                    <span className="dot-pulse" />
                    <span className="loading-label">
                      {chatLang === 'bn' ? 'পুজো এআই ভাবছে...' : 'Pujo AI is thinking...'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Error Message with Retry */}
            {chatError && (
              <div className="chat-error-inline" role="alert">
                <div className="chat-error-text">
                  <AlertCircle size={13} />
                  <span>{chatError}</span>
                </div>
                {lastFailedPrompt && (
                  <button
                    type="button"
                    className="chat-retry-btn"
                    onClick={handleRetry}
                    disabled={isChatLoading}
                    aria-label="Retry sending message"
                  >
                    <RotateCcw size={12} />
                    <span>{chatLang === 'bn' ? 'পুনরায় চেষ্টা' : 'Retry'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Suggested Questions */}
            <div className="suggested-questions-tray">
              <span className="tray-label">
                {lang === 'bn' ? 'পরামর্শ করা প্রশ্ন:' : 'Suggested Questions:'}
              </span>
              <div className="suggested-chips-scroll">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="suggested-chip"
                    onClick={() => handleSendMessage(chatLang === 'bn' ? q.bn : q.en)}
                    disabled={isChatLoading}
                  >
                    {chatLang === 'bn' ? q.bn : q.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input Bar */}
            <form 
              className="chat-input-bar"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                type="text"
                className="chat-text-input"
                placeholder={
                  chatLang === 'bn' 
                    ? 'দুর্গাপুজো সম্পর্কে যেকোনো প্রশ্ন জিজ্ঞাসা করুন...' 
                    : 'Ask Pujo AI about traditions, rituals, food...'
                }
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                maxLength={500}
                disabled={isChatLoading}
              />

              {/* Language Switcher for Answer */}
              <button
                type="button"
                className="chat-lang-pill"
                onClick={() => setChatLang((prev) => (prev === 'en' ? 'bn' : 'en'))}
                disabled={isChatLoading}
                title="Switch response language"
              >
                {chatLang === 'bn' ? 'বাংলা' : 'EN'}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                className="chat-send-btn"
                disabled={!inputQuery.trim() || isChatLoading}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: GREETING CREATOR */}
        {activeTab === 'greeting' && (
          <div className="pujo-ai-greeting-view">
            <form className="greeting-form" onSubmit={handleGenerateGreeting}>
              <div className="greeting-form-row">
                <div className="form-field-group flex-1">
                  <label htmlFor="greeting-recipient-input" className="form-label">
                    {lang === 'bn' ? 'প্রাপকের নাম' : "Recipient's Name"} *
                  </label>
                  <input
                    id="greeting-recipient-input"
                    type="text"
                    className="form-input"
                    placeholder={lang === 'bn' ? 'যেমন: প্রিয় মা ও বাবা / অনির্বাণ' : 'e.g. My Family / Rohan'}
                    value={greetingName}
                    onChange={(e) => setGreetingName(e.target.value)}
                    maxLength={80}
                    disabled={isGreetingLoading}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="greeting-lang-select" className="form-label">
                    {lang === 'bn' ? 'ভাষা' : 'Language'}
                  </label>
                  <select
                    id="greeting-lang-select"
                    className="form-select"
                    value={greetingLang}
                    onChange={(e) => setGreetingLang(e.target.value)}
                    disabled={isGreetingLoading}
                  >
                    <option value="en">English</option>
                    <option value="bn">বাংলা (Bengali)</option>
                  </select>
                </div>
              </div>

              {/* Mood Selection */}
              <div className="form-field-group">
                <label className="form-label">
                  {lang === 'bn' ? 'বার্তার সুর' : 'Greeting Mood / Tone'}
                </label>
                <div className="mood-chips-group">
                  {GREETING_MOODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`mood-chip ${greetingMood === m.id ? 'active' : ''}`}
                      onClick={() => setGreetingMood(m.id)}
                      disabled={isGreetingLoading}
                    >
                      {lang === 'bn' ? m.labelBn : m.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Personal Note */}
              <div className="form-field-group">
                <label htmlFor="greeting-note-input" className="form-label">
                  {lang === 'bn' ? 'ব্যক্তিগত বার্তা (ঐচ্ছিক)' : 'Personal Note (Optional)'}
                </label>
                <input
                  id="greeting-note-input"
                  type="text"
                  className="form-input"
                  placeholder={
                    lang === 'bn'
                      ? 'যেমন: এই পুজোয় তোমাদের সুস্বাস্থ্য ও আনন্দ কামনা করি'
                      : 'e.g. Wishing you health and endless smiles this autumn'
                  }
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  maxLength={250}
                />
              </div>

              {/* Error Message */}
              {greetingError && (
                <div className="chat-error-inline" role="alert">
                  <AlertCircle size={13} />
                  <span>{greetingError}</span>
                </div>
              )}

              {/* Generate Button */}
              <button
                type="submit"
                className="greeting-submit-btn"
                disabled={!greetingName.trim() || isGreetingLoading}
              >
                <Sparkles size={15} />
                <span>
                  {isGreetingLoading
                    ? (lang === 'bn' ? 'শুভেচ্ছা তৈরি হচ্ছে...' : 'Generating Greeting...')
                    : (lang === 'bn' ? 'শারদীয় শুভেচ্ছা তৈরি করুন' : 'Generate Pujo Greeting')}
                </span>
              </button>
            </form>

            {/* Generated Festive Greeting Card */}
            {generatedGreeting && (
              <div className="generated-greeting-section">
                {/* Preview Status & Badges */}
                <div className="greeting-card-preview-header">
                  <div className="preview-label-group">
                    <Sparkles size={14} className="preview-icon" />
                    <span className="preview-title">
                      {lang === 'bn' ? 'শারদীয় শুভেচ্ছা কার্ড প্রিভিউ' : 'Festive Card Preview'}
                    </span>
                  </div>

                  <span 
                    className={`greeting-badge ${isFallbackGreeting ? 'template-badge' : 'ai-badge'}`}
                    title={isFallbackGreeting ? 'Festive greeting template' : 'Personalized with Gemini Flash'}
                  >
                    {isFallbackGreeting ? (
                      <>
                        <span className="badge-icon">🪷</span>
                        <span>{greetingLang === 'bn' ? 'উৎসব টেমপ্লেট' : 'Festive Template'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={11} className="badge-sparkle" />
                        <span>{greetingLang === 'bn' ? 'এআই ব্যক্তিত্ব' : 'AI Personalized'}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* THE DOWNLOADABLE PUJO GREETING CARD (Pure Artwork, Captured by toPng) */}
                <div 
                  className="downloadable-pujo-card"
                  ref={cardRef}
                  id="pujo-greeting-export-card"
                  aria-label="Festive Pujo Greeting Card"
                >
                  {/* Ornate Golden Corner Motifs */}
                  <CardCornerMotif position="top-left" />
                  <CardCornerMotif position="top-right" />
                  <CardCornerMotif position="bottom-left" />
                  <CardCornerMotif position="bottom-right" />

                  {/* Hanging Brass Temple Bells */}
                  <HangingTempleBell side="left" />
                  <HangingTempleBell side="right" />

                  {/* Subtle Bengali Pandal Temple Arch Backdrop Watermark */}
                  <PandalArchSilhouette />

                  {/* Card Header with Authentic Shiuli Blossom Flanks */}
                  <div className="card-ornate-header">
                    <div className="card-shiuli-flank">
                      <ShiuliBlossom size={22} />
                    </div>
                    <div className="card-festival-banner">
                      <span className="card-festival-title">
                        {greetingLang === 'bn' ? 'শুভ শারদীয়া' : 'SHUBHO SHARODIYA'}
                      </span>
                      <span className="card-festival-sub">
                        {greetingLang === 'bn' ? 'দেবীপক্ষ শারদোৎসব' : 'DURGA PUJA CELEBRATIONS'}
                      </span>
                    </div>
                    <div className="card-shiuli-flank">
                      <ShiuliBlossom size={22} />
                    </div>
                  </div>

                  {/* Expressive Semi-Cartoon Durga Maa Sacred Eyes & Chandan Motif */}
                  <div className="card-durga-eyes-wrap">
                    <MaaDurgaEyes />
                  </div>

                  {/* Golden Decorative Divider */}
                  <div className="card-golden-rule">
                    <span className="rule-diamond" />
                  </div>

                  {/* Single Clean Recipient Salutation */}
                  <div className="card-recipient-salutation">
                    {parsedGreeting.opening}
                  </div>

                  {/* Card Message Body */}
                  <p className="card-message-body">
                    {parsedGreeting.body}
                  </p>

                  {/* Footer Blessing Sign-off */}
                  <div className="card-blessing-footer">
                    <span className="card-blessing-sign">
                      {parsedGreeting.footer}
                    </span>
                  </div>

                  {/* Golden Decorative Divider */}
                  <div className="card-golden-rule">
                    <span className="rule-diamond" />
                  </div>

                  {/* Card Bottom Attribution Bar with Dhak, Watermark & Glowing Diya */}
                  <div className="card-bottom-bar">
                    <div className="card-footer-dhak" aria-hidden="true">
                      <FestiveDhakIllustration />
                    </div>
                    <div className="card-watermark-center">
                      <ShiuliBlossom size={13} />
                      <span className="card-watermark-text">
                        Pujo Aurora • দেবীপক্ষ শারদোৎসব
                      </span>
                      <ShiuliBlossom size={13} />
                    </div>
                    <div className="card-footer-diya" aria-hidden="true">
                      <FestiveDiyaIllustration />
                    </div>
                  </div>
                </div>

                {/* Export or Download Error Banner */}
                {downloadError && (
                  <div className="chat-error-inline" role="alert">
                    <AlertCircle size={13} />
                    <span>{downloadError}</span>
                  </div>
                )}

                {/* Actions: Download Card, Share, Copy, Regenerate & New Greeting */}
                <div className="greeting-card-actions">
                  <button
                    type="button"
                    className="card-action-btn download-action"
                    onClick={handleDownloadCard}
                    disabled={isDownloading}
                    title={lang === 'bn' ? 'কার্ডটি উচ্চ-মানের পিএনজি ছবি হিসেবে ডাউনলোড করুন' : 'Download greeting card as high-quality PNG'}
                  >
                    {isDownloading ? <Loader2 size={14} className="spin-slow" /> : <Download size={14} />}
                    <span>
                      {isDownloading
                        ? (lang === 'bn' ? 'তৈরি হচ্ছে...' : 'Generating PNG...')
                        : (lang === 'bn' ? 'কার্ড ডাউনলোড' : 'Download Card')}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="card-action-btn share-action"
                    onClick={handleShareGreeting}
                    disabled={isSharingImage}
                    title={lang === 'bn' ? 'কার্ড বা শুভেচ্ছা বার্তা শেয়ার করুন' : 'Share card image or text'}
                  >
                    {isSharingImage ? <Loader2 size={14} className="spin-slow" /> : <Share2 size={14} />}
                    <span>{lang === 'bn' ? 'শেয়ার করুন' : 'Share Greeting'}</span>
                  </button>

                  <button
                    type="button"
                    className="card-action-btn copy-action"
                    onClick={handleCopyGreeting}
                    title={lang === 'bn' ? 'টেক্সট বার্তা কপি করুন' : 'Copy greeting message text'}
                  >
                    {isCopied ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
                    <span>{isCopied ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'কপি টেক্সট' : 'Copy Text')}</span>
                  </button>

                  <button
                    type="button"
                    className="card-action-btn regen-action"
                    onClick={handleGenerateGreeting}
                    disabled={isGreetingLoading}
                    title={lang === 'bn' ? 'নতুন বার্তা পুনরায় তৈরি করুন' : 'Regenerate greeting'}
                  >
                    <Sparkles size={14} />
                    <span>{lang === 'bn' ? 'পুনরায় তৈরি' : 'Regenerate'}</span>
                  </button>

                  <button
                    type="button"
                    className="card-action-btn reset-action"
                    onClick={() => {
                      setGeneratedGreeting('');
                      setIsFallbackGreeting(false);
                      setDownloadError('');
                    }}
                    title={lang === 'bn' ? 'অন্য কাউকে শুভেচ্ছা পাঠান' : 'Create new'}
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>

                {shareFeedback && (
                  <div className="share-feedback-toast" role="status">
                    <Check size={13} />
                    <span>{shareFeedback}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(PujoAiModal);

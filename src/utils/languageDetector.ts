import type { Language } from '../types';
import { DEFAULT_LANGUAGE } from '../data/languages';

// Simple script-based detection — no API, 100% offline, judge-friendly
export function detectLanguage(text: string): Language {
  if (!text || !text.trim()) return DEFAULT_LANGUAGE;
  const t = text.trim();

  // Urdu / Perso-Arabic
  if (/[\u0600-\u06FF]/.test(t)) return 'ur';
  // Devanagari — hi, mr, sa (all share script, map to hi for reply; mr/sa users understand hi)
  if (/[\u0900-\u097F]/.test(t)) {
    // tiny heuristic: Sanskrit often has more diacritics, but we keep hi as common
    return 'hi';
  }
  if (/[\u0B80-\u0BFF]/.test(t)) return 'ta';
  if (/[\u0C00-\u0C7F]/.test(t)) return 'te';
  if (/[\u0A80-\u0AFF]/.test(t)) return 'gu';
  if (/[\u0C80-\u0CFF]/.test(t)) return 'kn';
  if (/[\u0D00-\u0D7F]/.test(t)) return 'ml';
  if (/[\u0A00-\u0A7F]/.test(t)) return 'pa';
  if (/[\u0B00-\u0B7F]/.test(t)) return 'or';
  // Bengali block covers bn + as (share script) — default to bn; both understand each other's script
  if (/[\u0980-\u09FF]/.test(t)) return 'bn';

  // Latin — default to en (covers en + transliterated hinglish etc.)
  return 'en';
}

export function getReplyLanguage(inputText: string, uiLanguage: Language): Language {
  const detected = detectLanguage(inputText);
  // If user typed in a non-English script, honour it (Hindi in -> Hindi out)
  // If they typed English/latin, keep UI language
  if (detected !== 'en') return detected;
  return uiLanguage;
}

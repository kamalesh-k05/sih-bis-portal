import type { Language } from '../types';

export interface LanguageInfo {
  code: Language;
  name: string;      // English name
  nativeName: string; // Name in its own script
  script: string;    // Writing system
  speakers: string;  // Approx number of speakers / status
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', speakers: 'Official' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', speakers: 'Official' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', speakers: 'Official' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', speakers: 'Official' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', speakers: 'Official' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', speakers: 'Official' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', speakers: 'Official' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', speakers: 'Official' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', speakers: 'Official' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', speakers: 'Official' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', speakers: 'Official' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali-Assamese', speakers: 'Official' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Perso-Arabic', speakers: 'Official' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari', speakers: 'Classical' },
];

export const DEFAULT_LANGUAGE: Language = 'en';

export function getLanguageInfo(code: string): LanguageInfo {
  return LANGUAGES.find(l => l.code === code) || LANGUAGES[0];
}

export function isLanguageSupported(code: string): boolean {
  return LANGUAGES.some(l => l.code === code);
}

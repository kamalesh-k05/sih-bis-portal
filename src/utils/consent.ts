const CONSENT_KEY = 'bis_cookie_consent';

export type ConsentChoice = 'accepted' | 'rejected' | 'pending';

export function getConsent(): ConsentChoice {
  if (typeof window === 'undefined') return 'pending';
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    return raw === 'accepted' || raw === 'rejected' ? raw : 'pending';
  } catch {
    return 'pending';
  }
}

export function setConsent(choice: Exclude<ConsentChoice, 'pending'>) {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* storage unavailable — ignore */
  }
}

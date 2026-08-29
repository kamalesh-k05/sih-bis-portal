import { useState } from 'react';
import { Cookie } from 'lucide-react';
import { getConsent, setConsent, type ConsentChoice } from '../utils/consent';

export default function CookieConsent() {
  const [choice, setChoice] = useState<ConsentChoice>(() => getConsent());

  if (choice !== 'pending') return null;

  const decide = (c: Exclude<ConsentChoice, 'pending'>) => {
    setConsent(c);
    setChoice(c);
    window.dispatchEvent(new CustomEvent('bis-consent', { detail: c }));
  };

  return (
    <div role="dialog" aria-live="polite" aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-[90] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#0d1424]/95 p-5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md sm:p-6">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-saffron-500/15 text-saffron-400">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-display font-semibold text-base text-slate-50">We value your privacy</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
              This portal is built to respect your data. We use cookies to keep the site
              working and remember your preferences. We do not use third-party tracking
              or advertising cookies. You can accept or reject non-essential storage below.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => decide('accepted')}
                className="btn-primary">Accept</button>
              <button onClick={() => decide('rejected')}
                className="btn-secondary">Reject</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

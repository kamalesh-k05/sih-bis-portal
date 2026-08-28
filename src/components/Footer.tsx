import { ExternalLink, Shield, BadgeCheck, ArrowUpRight } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { translations } from '../data/translations';

export default function Footer() {
  const { language } = useAppStore();
  const t = translations[language] || translations['en'];

  return (
    <footer className="relative mt-auto overflow-hidden bg-[#0b0f19] text-white border-t border-white/[0.08]">
      {/* top glow */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-saffron-400/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 py-14">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-saffron-400 to-amber-500">
                <span className="font-display text-sm font-bold text-black">BIS</span>
              </div>
              <div>
                <div className="font-display text-[15px] font-semibold text-white">BIS Smart Portal</div>
                <div className="text-[10px] text-white/40">{t.tagline}</div>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/45">{t.footerDesc}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">{t.quickLinks}</h3>
            <ul className="space-y-3">
              {[t.findStandards, t.verifyProduct, t.assistant, t.certificationGuide].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-white/55 transition-colors hover:text-saffron-400">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">{t.learn}</h3>
            <ul className="space-y-3">
              {[t.whatIsISI, t.whatIsHUID, t.whatIsCRS, t.whatIsQCO].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-white/55 transition-colors hover:text-saffron-400">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Official */}
          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">{t.officialResources}</h3>
            <ul className="space-y-3">
              <li>
                <a href="https://bis.gov.in" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 text-sm text-white/55 transition-colors hover:text-saffron-400">
                  {t.officialWebsite} <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://bis.gov.in" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 text-sm text-white/55 transition-colors hover:text-saffron-400">
                  {t.officialCareApp} <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="group inline-flex items-center gap-1.5 text-sm text-white/55 transition-colors hover:text-saffron-400">
                  {t.fileComplaint} <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + disclaimer */}
        <div className="mt-12 flex flex-col gap-6 border-t border-white/[0.08] pt-8 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">
            <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-saffron-400" />
            <p className="text-xs leading-relaxed text-white/45">
              <span className="font-semibold text-white/60">Disclaimer:</span> {t.disclaimer}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">
            <BadgeCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-white/45">Prototype v1.0 - SIH</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-white/30">{t.footerCopyright}</p>
          <div className="flex items-center gap-5">
            <a href="#" className="text-xs text-white/40 transition-colors hover:text-saffron-400">Privacy Policy</a>
            <a href="#" className="text-xs text-white/40 transition-colors hover:text-saffron-400">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

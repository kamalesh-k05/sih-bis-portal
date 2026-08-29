import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, User, ChevronDown, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { translations } from '../data/translations';
import { LANGUAGES } from '../data/languages';

const navLinks: { key: keyof typeof translations['en']; path: string }[] = [
  { key: 'home', path: '/' },
  { key: 'forBusiness', path: '/business' },
  { key: 'forConsumers', path: '/consumer' },
  { key: 'standards', path: '/standards' },
  { key: 'verifyProduct', path: '/verify' },
  { key: 'help', path: '/help' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage } = useAppStore();
  const t = translations[language] || translations['en'];

  return (
    <header className="sticky top-4 z-50 px-4">
      <div className="mx-auto flex max-w-[760px] items-center justify-center gap-[18px]">
        {/* Logo — BIS mark */}
        <Link to="/" className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-[0_4px_14px_rgba(0,0,0,0.16)] transition-transform duration-300 hover:scale-105" aria-label="BIS Smart Portal — Home">
          <img src="/sih-bis-portal/logo-mark.png" alt="BIS" className="h-full w-full object-contain" />
        </Link>

        {/* Desktop Nav pill */}
        <nav
          className={`hidden h-12 flex-1 items-center justify-center gap-[22px] rounded-full px-2 shadow-[0_4px_14px_rgba(0,0,0,0.16)] transition-colors duration-300 lg:flex ${
            mobileOpen ? 'bg-white/95' : 'bg-white'
          }`}
          aria-label="Primary"
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-sm font-medium tracking-[-0.01em] text-[#2e2e2e] transition-opacity duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-50 hover:opacity-80'
                }`}
              >
                {t[link.key]}
                {isActive && (
                  <span className="absolute -bottom-[6px] left-1/2 flex h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-black" style={{ boxShadow: '-5px 0 0 #000, 5px 0 0 #000' }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-[#c8c8c8] transition-colors hover:bg-white/10 lg:hidden"
              aria-label="Select language"
            >
              <Globe className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-white/10 bg-[#0c1019]/95 p-1.5 backdrop-blur-xl shadow-2xl max-h-[70vh] overflow-y-auto">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-4 py-2 text-left text-sm transition-colors ${
                      language === lang.code
                        ? 'bg-saffron-500/15 text-saffron-300'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] text-white/30">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop language pill (dark, like landing sign-in) */}
          <button
            onClick={() => { setLangOpen(true); }}
            className="hidden items-center gap-2 rounded-full bg-[#28282a] px-[18px] py-2.5 text-sm font-medium text-[#c8c8c8] shadow-[0_4px_14px_rgba(0,0,0,0.16)] transition-colors duration-250 hover:bg-[#323234] hover:text-white lg:inline-flex"
          >
            <Globe className="h-4 w-4" />
            <span>{LANGUAGES.find(l => l.code === language)?.nativeName || 'English'}</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {/* Mobile toggle */}
          <button
            onClick={() => { setMobileOpen(!mobileOpen); setLangOpen(false); }}
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#28282a] text-white shadow-[0_4px_14px_rgba(0,0,0,0.16)] transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            {!mobileOpen ? (
              <Menu className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

        {/* Mobile menu */}
        <div
          className={`grid overflow-hidden transition-all duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] lg:hidden ${
            mobileOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="min-h-0">
            <div className="space-y-1 px-4 pb-5 pt-2">
              {navLinks.map((link, i) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    style={{ transitionDelay: mobileOpen ? `${i * 40}ms` : '0ms' }}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-500 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] ${
                      mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                    } ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                  >
                    {t[link.key]}
                    <ArrowUpRight className="h-4 w-4 text-white/25" />
                  </Link>
                );
              })}
              <Link
                to="/verify"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 rounded-full bg-saffron-500 py-3 text-sm font-semibold text-white"
              >
                {t.verifyProduct}
              </Link>
            </div>
          </div>
        </div>
    </header>
  );
}

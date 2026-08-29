import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Sparkles,
  ScanLine,
  ShieldCheck,
  BookOpen,
  FileText,
  Gem,
  Scale,
  Factory,
  ShoppingCart,
} from 'lucide-react';
import { motion, AnimatePresence, type Variants, useReducedMotion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { translations } from '../data/translations';
import { BIS_EDUCATIONAL_CONTENT } from '../data/standards';
import GlareHover from '../components/GlareHover';
import Seo, { SITE_URL, SITE_NAME } from '../components/Seo';

const C = { ease: [0.32, 0.72, 0, 1] as [number, number, number, number] };

const markIcons: Record<string, typeof BadgeCheck> = {
  isi: BadgeCheck,
  'bis-licence': FileText,
  huid: Gem,
  'is-number': BookOpen,
  crs: ShieldCheck,
  qco: Scale,
};

const reveal: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, delay: 0.08 * i, ...C },
  }),
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export default function Home() {
  const { language, toggleAssistant } = useAppStore();
  const t = translations[language] || translations['en'];
  const reduceMotion = useReducedMotion();
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('bis-intro-seen')) return false;
    return true;
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const [introStarted, setIntroStarted] = useState(false);

  useEffect(() => {
    if (!showIntro) return;
    // If the video has failed to actually start playing (autoplay blocked,
    // codec/decode failure) within a generous window, reveal the hero instead
    // of leaving a frozen screen forever. Only fires when playback truly never
    // began — a playing video is never cut short.
    const stallTimer = setTimeout(() => {
      const v = videoRef.current;
      if (!v || !v.currentTime || v.currentTime <= 0) {
        if (v && (v.readyState === 0 || v.paused)) {
          setShowIntro(false);
          sessionStorage.setItem('bis-intro-seen', '1');
        }
      }
    }, 7000);
    return () => clearTimeout(stallTimer);
  }, [showIntro]);

  useEffect(() => {
    if (!showIntro) return;
    // Force playback to begin even under strict autoplay policies: retry
    // play() until the video reports it is actually playing.
    const v = videoRef.current;
    if (v) {
      const start = () => v.play().catch(() => {});
      start();
      const retry = setInterval(() => {
        if (v.paused && v.readyState >= 1) start();
        if (!v.paused) clearInterval(retry);
      }, 400);
      return () => clearInterval(retry);
    }
  }, [showIntro, introStarted]);

  const handleIntroStart = () => setIntroStarted(true);

  const handleIntroEnd = () => {
    setShowIntro(false);
    sessionStorage.setItem('bis-intro-seen', '1');
  };

  const features = [
    {
      icon: ScanLine,
      title: t.feature1Title,
      desc: t.feature1Desc,
      accent: 'text-saffron-400',
    },
    {
      icon: ShieldCheck,
      title: t.feature2Title,
      desc: t.feature2Desc,
      accent: 'text-emerald-400',
    },
    {
      icon: Sparkles,
      title: t.feature3Title,
      desc: t.feature3Desc,
      accent: 'text-saffron-400',
    },
  ];

  const stats = [
    { value: '41', label: t.statStandards, icon: '\u276E' },
    { value: '15+', label: t.statCategories, icon: '%' },
    { value: '14', label: t.statLanguages, icon: '\u2726' },
    { value: '24/7', label: t.statAssistant, icon: '#' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <Seo
        title="BIS Smart Portal — Indian Standards Made Simple"
        description="BIS Smart Portal — the AI-powered assistant for Indian Standards and BIS Services. Find the right IS code, understand BIS certification, and verify genuine products."
        path="/"
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Indian Standards Made Simple',
            url: `${SITE_URL}/`,
            description:
              'Find the right Indian Standard for your product, understand BIS certification, or verify whether a product is genuine — all in one place.',
            inLanguage: 'en',
            isPartOf: {
              '@type': 'WebSite',
              name: SITE_NAME,
              url: SITE_URL,
            },
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
              ],
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            ],
          },
        ]}
      />
      {/* Intro video overlay — full screen, no skip, reveals hero on end */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-[100] bg-black"
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onEnded={handleIntroEnd}
              onPlaying={handleIntroStart}
              onLoadedMetadata={() => videoRef.current?.play().catch(() => {})}
              onCanPlay={() => videoRef.current?.play().catch(() => {})}
              className="h-full w-full object-cover bg-black"
            >
              <source src="/sih-bis-portal/intro-vp9.webm" type="video/webm" />
              <source src="/sih-bis-portal/intro-fixed.mp4" type="video/mp4" />
            </video>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient light sources — tricolor-nod: saffron + a touch of green, never cliché */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-[8%] h-[42rem] w-[42rem] rounded-full mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(255,146,43,0.26), transparent 62%)' }} />
        <div className="absolute top-[30%] -left-48 h-[38rem] w-[38rem] rounded-full mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(19,136,8,0.16), transparent 62%)' }} />
        <div className="absolute -bottom-56 left-1/3 h-[40rem] w-[40rem] rounded-full mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(255,146,43,0.10), transparent 60%)' }} />
        {/* faint grid, kept ultra-subtle */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />
      </div>

      {/* Grain overlay — fixed, pointer-events-none */}
      {!reduceMotion && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] opacity-[0.05]"
          style={{ backgroundImage: 'url("/sih-bis-portal/grain.svg")' }} />
      )}

      {/* ============ HERO ============ */}
      <section className="relative mx-auto flex min-h-[calc(100svh-6rem)] w-full max-w-7xl flex-col items-center justify-center px-5 sm:px-6">
          {/* Editorial statement */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="relative z-10">
            <motion.div custom={0} variants={reveal}
              className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-black/70 opacity-90 sm:text-[13px]">
              {t.heroEyebrow}
            </motion.div>

            <motion.h1 custom={2} variants={reveal}
              className="font-display font-medium text-5xl leading-[1.12] tracking-tight text-black sm:text-6xl lg:text-[5rem] text-balance">
              {t.heroTitle1}
              <br />
              {t.heroTitle2}
            </motion.h1>

            <motion.p custom={3} variants={reveal}
              className="mx-auto mt-6 max-w-[500px] text-lg leading-relaxed text-black/70 opacity-90">
              {t.heroSubtitle}
            </motion.p>

            <motion.div custom={4} variants={reveal} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/business"
                className="inline-flex items-center justify-center rounded-full bg-saffron-500 px-7 py-3 text-sm font-semibold text-black shadow-[0_8px_24px_-8px_rgba(255,146,43,0.9)] transition-transform duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]">
                {t.businessCardButton}
              </Link>
              <Link to="/consumer"
                className="inline-flex items-center justify-center rounded-full border border-saffron-400/60 bg-saffron-500/15 px-7 py-3 text-sm font-semibold text-black backdrop-blur-md transition-all duration-300 hover:bg-saffron-500/30 active:scale-[0.98]">
                {t.consumerCardButton}
              </Link>
            </motion.div>

            {/* Chat with the BIS Assistant */}
            <motion.button
              custom={5}
              variants={reveal}
              onClick={toggleAssistant}
              className="group mx-auto mt-8 inline-flex items-center gap-3 rounded-full bg-saffron-500 py-2 pl-2 pr-5 text-sm font-semibold text-black shadow-[0_8px_24px_-8px_rgba(255,146,43,0.9)] transition-all duration-300 hover:bg-saffron-600 active:scale-[0.98]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/15 text-black">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-left">
                <span className="block text-sm font-semibold">{t.assistantTitle}</span>
                <span className="block text-xs text-black/60">{t.askAssistant}</span>
              </span>
              <ArrowRight className="ml-1 h-4 w-4 text-black/50 transition-transform group-hover:translate-x-0.5" />
            </motion.button>
          </motion.div>
      </section>

      {/* marks strip */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="border-t border-black/10 py-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {['ISI Mark', 'HUID', 'CRS', 'QCO', 'BIS Licence'].map((m) => (
              <span key={m} className="flex items-center gap-1.5 text-xs font-medium text-black/50">
                <BadgeCheck className="h-3.5 w-3.5 text-saffron-600/60" /> {m}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ============ STATS ============ */}
      <section className="relative border-y border-black/10 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.08, ...C }}
                className="text-center">
                <div className="font-display text-2xl text-black sm:text-3xl">{stat.icon}</div>
                <div className="mt-1 font-display text-xl font-medium tracking-tight text-black sm:text-2xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-black/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHAT DO YOU NEED ============ */}
      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ...C }}
            className="flex flex-col items-center gap-5">
            <span className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-black/70">{t.whatYouNeed}</span>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link to="/business"
                className="group inline-flex items-center gap-2 rounded-full bg-saffron-500 py-2.5 pl-5 pr-2.5 text-sm font-semibold text-black transition-all duration-300 hover:bg-saffron-600 active:scale-[0.97]">
                <Factory className="h-4 w-4" />
                {t.businessCardTitle}
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/15 transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
              <Link to="/consumer"
                className="group inline-flex items-center gap-2 rounded-full border border-saffron-400/60 bg-saffron-500/15 py-2.5 pl-5 pr-2.5 text-sm font-semibold text-black transition-all duration-300 hover:bg-saffron-500/30 active:scale-[0.97]">
                <ShoppingCart className="h-4 w-4 text-saffron-600" />
                {t.consumerCardTitle}
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ HOW WE HELP ============ */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ...C }}
            className="mb-16 max-w-2xl">
            <h2 className="font-display font-bold text-4xl sm:text-5xl tracking-tight text-balance text-black">
              {t.howWeHelpTitle}
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-black/60">
              {t.howWeHelpIntro}
            </p>
          </motion.div>

          {/* asymmetric bento */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={reduceMotion ? false : { opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.12, ...C }}
                className={`group relative h-full ${i === 0 ? 'md:col-span-1' : ''} ${i === 2 ? 'md:col-span-1' : ''}`}>
                <GlareHover
                  width="100%"
                  height="100%"
                  background="#ffffff"
                  borderRadius="1.75rem"
                  borderColor="rgba(0,0,0,0.08)"
                  glareColor="#ff9233"
                  glareOpacity={0.55}
                  glareAngle={-30}
                  glareSize={320}
                  transitionDuration={700}
                  className="p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300 hover:border-saffron-400/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
                  style={{ placeItems: 'start' }}
                >
                  <div className={`mb-10 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-black/[0.06] ${feature.accent}`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-black">{feature.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-black/60">{feature.desc}</p>
                  <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-30"
                    style={{ background: 'radial-gradient(circle, rgba(255,146,43,0.7), transparent 60%)' }} />
                </GlareHover>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LEARN ABOUT BIS MARKS ============ */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ...C }}
            className="mb-16 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <h2 className="font-display font-bold text-4xl sm:text-5xl tracking-tight text-balance text-black">
                {t.learnTitle}
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-black/60">
                {t.learnIntro}
              </p>
            </div>
            <Link to="/help" className="group inline-flex items-center gap-2 text-sm font-semibold text-saffron-400 transition-colors hover:text-saffron-300">
              {t.allGuides} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BIS_EDUCATIONAL_CONTENT.map((item, i) => {
              const Icon = markIcons[item.id] || ShieldCheck;
              return (
                <motion.div
                  key={item.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.06, ...C }}>
                  <GlareHover
                    width="100%"
                    height="100%"
                    background="#ffffff"
                    borderRadius="1.75rem"
                    borderColor="rgba(0,0,0,0.08)"
                    glareColor="#ff9233"
                    glareOpacity={0.55}
                    glareAngle={-30}
                    glareSize={320}
                    transitionDuration={700}
                    className="p-7 shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300 hover:border-saffron-400/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
                    style={{ placeItems: 'start' }}
                  >
                    <Link to={`/help#${item.id}`} className="group block h-full">
                      <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-saffron-500/12 text-saffron-600 transition-colors duration-300 group-hover:bg-saffron-500 group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-black">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-black/60">{item.summary}</p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-saffron-400 transition-all duration-300 group-hover:gap-2.5">
                        {t.learnMore} <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </GlareHover>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 text-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ...C }}>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-saffron-600 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> {t.ctaEyebrow}
            </div>
            <h2 className="font-display font-bold text-4xl tracking-tight text-balance text-black sm:text-6xl">
              {t.ctaLet} <span className="bg-gradient-to-br from-saffron-500 to-emerald-600 bg-clip-text text-transparent">{t.ctaVerify}</span> {t.ctaTogether}
            </h2>
            <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-black/60">
              {t.ctaIntro}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/business" className="group inline-flex items-center gap-3 rounded-full bg-saffron-500 py-2 pl-7 pr-2 text-sm font-semibold text-black transition-all duration-300 hover:bg-saffron-600 active:scale-[0.98] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] w-full sm:w-auto">
                <span className="inline-flex items-center gap-2">{t.businessCardButton}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/15 transition-transform duration-300 group-hover:-translate-y-[1px] group-hover:translate-x-[1px]">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link to="/consumer" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-saffron-400/60 bg-saffron-500/15 px-7 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:bg-saffron-500/30 active:scale-[0.98] sm:w-auto">
                {t.consumerCardButton}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

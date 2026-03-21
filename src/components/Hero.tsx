import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronRight, Sparkles, Activity, BookOpen } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { config, getDiscordInviteUrl, getDashboardUrl } from '../config';
import Logo from './Logo';
import { useHeavyMedia } from '../hooks/useHeavyMedia';
import StarfieldBackground from './StarfieldBackground';
import VerifiedBadge from './VerifiedBadge';

export default function Hero() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const shouldLoadVideo = useHeavyMedia(Boolean(shouldReduceMotion));
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inviteUrl = getDiscordInviteUrl();
  const dashboardUrl = getDashboardUrl();
  const canInvite = Boolean(inviteUrl);
  const hasDocs = Boolean(config.docsUrl);
  const instantReveal = { initial: false, animate: { opacity: 1 }, transition: { duration: 0.01 } };
  const fadeInUp = shouldReduceMotion
    ? instantReveal
    : { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } };
  const fadeInScale = shouldReduceMotion
    ? instantReveal
    : { initial: { opacity: 0, scale: 0.985 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.8, delay: 0.1 } };
  const fadeInBody = shouldReduceMotion
    ? instantReveal
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.2 } };

  useEffect(() => {
    if (!shouldLoadVideo || shouldReduceMotion) {
      setVideoReady(false);
      setVideoFailed(false);
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    let isMounted = true;

    const markReady = () => {
      if (!isMounted) {
        return;
      }

      setVideoReady(true);
      setVideoFailed(false);
    };

    const markFailed = () => {
      if (!isMounted) {
        return;
      }

      setVideoReady(false);
      setVideoFailed(true);
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady();
    }

    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          markReady();
          return;
        }

        markFailed();
      });
    }

    video.addEventListener('canplay', markReady);
    video.addEventListener('playing', markReady);
    video.addEventListener('error', markFailed);

    return () => {
      isMounted = false;
      video.removeEventListener('canplay', markReady);
      video.removeEventListener('playing', markReady);
      video.removeEventListener('error', markFailed);
    };
  }, [shouldLoadVideo, shouldReduceMotion]);

  const typingPhrases = t('heroTyping.phrases', { returnObjects: true }) as string[];
  const [typingIndex, setTypingIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion || !typingPhrases?.length) {
      setDisplayedText(typingPhrases?.[0] || '');
      return;
    }

    const phrase = typingPhrases[typingIndex % typingPhrases.length];
    const speed = isDeleting ? 30 : 60;

    if (!isDeleting && displayedText === phrase) {
      const pause = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(pause);
    }

    if (isDeleting && displayedText === '') {
      setIsDeleting(false);
      setTypingIndex((prev) => prev + 1);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText(isDeleting ? phrase.slice(0, displayedText.length - 1) : phrase.slice(0, displayedText.length + 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, typingIndex, shouldReduceMotion, typingPhrases]);

  const proofPoints = [t('hero.proof.one'), t('hero.proof.two'), t('hero.proof.three')];

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[92dvh] items-start justify-center overflow-hidden bg-[#000] pb-12 pt-28 md:pt-32 lg:pt-36"
    >
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <StarfieldBackground />
        <div
          className={`absolute inset-0 bg-[#02030a] bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${videoReady && !videoFailed ? 'opacity-0' : 'opacity-100'
            }`}
          style={{ backgroundImage: 'url("/hero-poster.jpg")' }}
          aria-hidden="true"
        />

        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/hero-poster.jpg"
          aria-hidden="true"
          onLoadedData={() => {
            setVideoReady(true);
            setVideoFailed(false);
          }}
          onError={() => {
            setVideoReady(false);
            setVideoFailed(true);
          }}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${videoReady && !videoFailed ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <source src="/videos/ton618-hero.webm" type="video/webm" />
          <source src="/videos/ton618-hero.mp4" type="video/mp4" />
        </video>

        <div
          className={`absolute inset-0 ${shouldReduceMotion
              ? 'bg-[radial-gradient(circle_at_50%_30%,rgba(8,10,24,0.62),transparent_36%),radial-gradient(circle_at_50%_32%,rgba(99,102,241,0.15),transparent_34%),radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.03),transparent_22%),radial-gradient(circle_at_82%_24%,rgba(34,211,238,0.08),transparent_18%),linear-gradient(180deg,rgba(5,6,15,0.8)_0%,rgba(1,2,8,0.92)_58%,rgba(0,0,0,0.985)_100%)]'
              : 'bg-[radial-gradient(circle_at_50%_34%,rgba(7,9,20,0.44),transparent_38%),radial-gradient(circle_at_50%_35%,rgba(99,102,241,0.14),transparent_36%),radial-gradient(circle_at_16%_18%,rgba(255,255,255,0.03),transparent_20%),radial-gradient(circle_at_84%_22%,rgba(34,211,238,0.08),transparent_18%),linear-gradient(180deg,rgba(5,6,15,0.38)_0%,rgba(0,0,0,0.84)_72%,rgba(0,0,0,0.97)_100%)]'
            }`}
        />
        <div className="absolute inset-x-[12%] top-[12%] h-[28rem] rounded-full bg-[radial-gradient(circle,rgba(109,40,217,0.22)_0%,rgba(67,56,202,0.16)_38%,rgba(15,23,42,0.04)_72%,transparent_100%)] blur-3xl" />
        <div className="absolute inset-x-[24%] top-[18%] h-[20rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,rgba(99,102,241,0.08)_24%,transparent_68%)] blur-[120px]" />
        <div className={`absolute inset-0 z-10 ${shouldReduceMotion ? 'bg-black/62' : 'bg-black/54'}`}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(3,4,12,0.04)_0%,rgba(3,4,12,0.18)_34%,transparent_54%),radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.36)_74%,rgba(0,0,0,0.78)_100%)] z-[15]" />
        <div className="absolute inset-0 z-20 shadow-[inset_0_0_180px_rgba(0,0,0,0.9)]" />
        <div className="absolute bottom-0 left-0 z-[25] h-32 w-full bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      <div className="relative z-30 mx-auto flex w-full max-w-7xl flex-1 items-start px-6">
        <div className="grid w-full items-center gap-14 py-4 md:py-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
          <div className="text-center lg:text-left">
            <motion.div
              {...fadeInUp}
              className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md"
            >
              <div className={`h-1.5 w-1.5 rounded-full bg-cyan-400 ${shouldReduceMotion ? '' : 'animate-pulse'}`}></div>
              <span className="text-[10px] font-bold uppercase tracking-wide-readable text-cyan-100">{t('hero.badge')}</span>
              <Activity className="h-3.5 w-3.5 text-cyan-300/70" />
            </motion.div>

            <motion.div {...fadeInUp} className="mb-4 flex justify-center lg:justify-start">
              <VerifiedBadge />
            </motion.div>

            <motion.div {...fadeInScale} className="mb-8 flex justify-center lg:justify-start">
              <Logo
                size="xl"
                subtitle="Discord Product"
                className="gap-6 md:gap-7"
                frameClassName="h-[9rem] w-[9rem] md:h-[10rem] md:w-[10rem] lg:h-[11rem] lg:w-[11rem]"
                imageClassName="drop-shadow-[0_24px_56px_rgba(99,102,241,0.24)]"
              />
            </motion.div>

            <motion.h1
              id="hero-heading"
              {...fadeInBody}
              className="mb-6 text-[14vw] font-black leading-[0.84] tracking-tightest uppercase sm:text-[11vw] md:text-[8vw] lg:text-[6.35rem]"
            >
              {t('hero.titleMain')} <br />
              <span className="headline-accent headline-accent-solid">{t('hero.titleAccent')}</span>
            </motion.h1>

            <motion.p
              {...fadeInBody}
              className="mx-auto mb-10 max-w-3xl text-base leading-relaxed text-slate-100/95 sm:text-lg md:text-xl lg:mx-0"
            >
              {t('hero.description')}
              <span className="mt-3 block text-sm font-normal text-slate-400 sm:text-base">{t('hero.descriptionSub')}</span>
              <span className="mt-2 block h-7 font-mono text-sm font-semibold text-indigo-300 sm:text-base">
                {displayedText}<span className="animate-pulse">|</span>
              </span>
            </motion.p>

            <motion.div
              {...(shouldReduceMotion
                ? instantReveal
                : { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.45 } })}
              className="flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center lg:justify-start"
            >
              {canInvite ? (
                <a href={inviteUrl} className="btn-premium-primary group w-full sm:w-auto">
                  <Sparkles className={`h-5 w-5 ${shouldReduceMotion ? '' : 'transition-transform duration-500 group-hover:rotate-12'}`} />
                  <span>{t('hero.ctaPrimary')}</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="btn-premium-primary w-full cursor-not-allowed opacity-60 sm:w-auto"
                  title={t('hero.inviteUnavailable')}
                >
                  <Sparkles className="h-5 w-5" />
                  <span>{t('hero.ctaPrimary')}</span>
                </button>
              )}

              {dashboardUrl.startsWith('/') ? (
                <Link to={dashboardUrl} className="btn-premium-outline group w-full sm:w-auto shadow-lg hover:shadow-indigo-500/10">
                  <span>{t('hero.ctaSecondary')}</span>
                  <ChevronRight className={`h-4 w-4 ${shouldReduceMotion ? '' : 'transition-all duration-300 group-hover:translate-x-1'}`} />
                </Link>
              ) : (
                <a href={dashboardUrl} className="btn-premium-outline group w-full sm:w-auto shadow-lg hover:shadow-indigo-500/10">
                  <span>{t('hero.ctaSecondary')}</span>
                  <ChevronRight className={`h-4 w-4 ${shouldReduceMotion ? '' : 'transition-all duration-300 group-hover:translate-x-1'}`} />
                </a>
              )}

              {hasDocs ? (
                <a
                  href={config.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>{t('hero.ctaTertiary')}</span>
                </a>
              ) : null}
            </motion.div>
          </div>

          <motion.aside
            {...(shouldReduceMotion
              ? instantReveal
              : { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.75, delay: 0.25 } })}
            className="cinematic-glass relative overflow-hidden rounded-[2rem] border-white/10 p-6 md:p-7"
            aria-label={t('hero.highlightsAria')}
          >
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-80"></div>
            <p className="mb-6 text-[10px] font-black uppercase tracking-wide-readable text-indigo-300">{t('hero.panelLabel')}</p>
            <div className="space-y-4">
              {proofPoints.map((point) => (
                <div key={point} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.7)]"></div>
                    <p className="text-sm font-medium leading-relaxed text-slate-200">{point}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.aside>
        </div>
      </div>

      <motion.div
        animate={shouldReduceMotion ? { opacity: 0.3 } : { y: [0, 8, 0] }}
        transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className={`pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-4 ${shouldReduceMotion ? 'opacity-30' : 'opacity-40 transition-all duration-700 hover:opacity-100'}`}
      >
        <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent"></div>
        <span className="text-[10px] font-black uppercase tracking-wide-readable text-indigo-200/60">{t('hero.scroll')}</span>
      </motion.div>
    </section>
  );
}

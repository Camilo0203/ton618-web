import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { HelpCircle, ChevronDown, Search } from 'lucide-react';
import { useState, useMemo, memo } from 'react';
import {
  accordionTransition,
  instantReveal,
  motionDurations,
  motionStagger,
  motionViewport,
  revealUp,
  sectionIntro,
  withDelay,
} from '../lib/motion';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

const FAQItem = memo(({ question, answer, isOpen, onToggle, index }: FAQItemProps) => {
  const shouldReduceMotion = useReducedMotion();
  const itemReveal = shouldReduceMotion ? instantReveal : withDelay(revealUp, index * motionStagger.tight);

  return (
    <motion.div
      variants={itemReveal}
      initial="hidden"
      whileInView="show"
      viewport={motionViewport}
      className="group"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] px-6 py-5 text-left backdrop-blur-xl transition-[border-color,box-shadow,background-color] duration-200 hover:border-white/20 hover:shadow-[0_8px_28px_rgba(99,102,241,0.08)]"
        aria-expanded={isOpen}
      >
        <span className="text-base font-semibold text-white">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={shouldReduceMotion ? { duration: 0.01 } : { duration: motionDurations.exit }}
          className="flex-shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-slate-400 transition-colors group-hover:text-indigo-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0.01 } : accordionTransition}
            className="overflow-hidden"
          >
            <div className="px-6 pb-2 pt-4">
              <p className="text-sm font-medium leading-relaxed text-slate-400">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

FAQItem.displayName = 'FAQItem';

export default function FAQ() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const introReveal = shouldReduceMotion ? instantReveal : sectionIntro;
  const searchReveal = shouldReduceMotion ? instantReveal : withDelay(sectionIntro, motionStagger.tight);

  const items = useMemo(
    () => [
      { question: t('faq.items.q1.question'), answer: t('faq.items.q1.answer') },
      { question: t('faq.items.q2.question'), answer: t('faq.items.q2.answer') },
      { question: t('faq.items.q3.question'), answer: t('faq.items.q3.answer') },
      { question: t('faq.items.q4.question'), answer: t('faq.items.q4.answer') },
      { question: t('faq.items.q5.question'), answer: t('faq.items.q5.answer') },
      { question: t('faq.items.q6.question'), answer: t('faq.items.q6.answer') },
    ],
    [t],
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q));
  }, [searchQuery, items]);

  return (
    <section id="faq" aria-labelledby="faq-heading" className="relative overflow-hidden bg-black py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <div className="mb-16 text-center">
          <motion.div
            variants={introReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-2"
          >
            <HelpCircle className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-wide-readable text-indigo-300">{t('faq.tag')}</span>
          </motion.div>

          <motion.h2
            id="faq-heading"
            variants={searchReveal}
            initial="hidden"
            whileInView="show"
            viewport={motionViewport}
            className="mb-6 text-4xl font-black uppercase leading-[0.92] tracking-tightest text-white sm:text-6xl lg:text-7xl"
          >
            {t('faq.title')} <br />
            <span className="headline-accent headline-accent-solid">{t('faq.titleAccent')}</span>
          </motion.h2>
        </div>

        <motion.div
          variants={searchReveal}
          initial="hidden"
          whileInView="show"
          viewport={motionViewport}
          className="relative mb-8"
        >
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setOpenIndex(null); }}
            placeholder={t('faqSearch.placeholder')}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm font-medium text-white placeholder-slate-500 outline-none backdrop-blur-xl transition-colors focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20"
          />
        </motion.div>

        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <p className="py-8 text-center text-sm font-medium text-slate-500">{t('faqSearch.noResults')}</p>
          ) : (
            filteredItems.map((item, index) => (
              <FAQItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                index={index}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

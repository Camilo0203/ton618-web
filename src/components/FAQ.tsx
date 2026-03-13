import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { config } from '../config';

const faqs = [
  { question: 'How do I invite the bot to my server?',      answer: 'Click the Invite Bot button at the top of the page. You will be redirected to Discord where you can select your server and authorize the bot.' },
  { question: 'What permissions does the bot need?',         answer: 'For full functionality we recommend Administrator permission. You can also grant granular permissions based on the modules you enable.' },
  { question: 'How do I configure the bot for my server?',  answer: 'After inviting the bot, run /setup in your server and continue in the dashboard for feature-level configuration.' },
  { question: 'Is the bot free to use?',                    answer: 'Yes. Core features are free. Premium plans unlock advanced analytics, priority support, and more automation options.' },
  { question: 'Can I customize commands and modules?',       answer: 'Absolutely. You can toggle modules, define behavior per channel, and customize command settings through setup and dashboard tools.' },
  { question: 'How reliable is the bot?',                   answer: 'The infrastructure is designed for high availability. Check the status section for incidents and maintenance windows.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const supportHref = config.supportServerUrl || (config.contactEmail ? `mailto:${config.contactEmail}` : '#support');
  const supportExternal = Boolean(config.supportServerUrl);
  const docsHref = config.docsUrl || '#docs';
  const docsExternal = Boolean(config.docsUrl);

  return (
    <section id="faq" className="py-24 bg-brand-50 dark:bg-surface-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-slate-400">
            Everything you need to know about getting started
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="bg-brand-100 dark:bg-surface-700 rounded-xl border border-brand-200 dark:border-surface-600 overflow-hidden hover:border-brand-400 dark:hover:border-brand-600 transition-colors duration-200"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-brand-500 dark:text-brand-400 transition-transform duration-200 flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}
                />
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}>
                <div className="px-6 pb-6 text-gray-600 dark:text-slate-400 leading-relaxed">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-slate-400 mb-4">
            Need more help? Read the{' '}
            <a href={docsHref} target={docsExternal ? '_blank' : undefined} rel={docsExternal ? 'noopener noreferrer' : undefined}
              className="text-brand-600 dark:text-brand-400 font-semibold hover:text-brand-700 dark:hover:text-brand-300">
              documentation
            </a>{' '}
            or contact support.
          </p>
          <a href={supportHref} target={supportExternal ? '_blank' : undefined} rel={supportExternal ? 'noopener noreferrer' : undefined}
            className="inline-flex px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 bg-gradient-to-r from-brand-500 to-violet-600 text-white hover:shadow-lg">
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
}

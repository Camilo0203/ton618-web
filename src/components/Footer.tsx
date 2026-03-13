import { Bot, Twitter, Github, MessageCircle, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { config } from '../config';

interface FooterProps {
  onOpenLegal: (type: 'terms' | 'privacy' | 'cookies') => void;
}

export default function Footer({ onOpenLegal }: FooterProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <footer className="bg-brand-50 dark:bg-surface-900 border-t border-brand-200 dark:border-surface-700 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8"
        >
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-brand-500 to-violet-600 rounded-lg shadow-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{config.botName}</span>
            </div>
            <p className="text-gray-500 dark:text-slate-400 leading-relaxed text-sm">
              The ultimate Discord bot for community management, engagement, and automation.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="font-bold text-base mb-4 text-gray-900 dark:text-white">Product</h3>
            <ul className="space-y-2 text-sm">
              {['features','commands','pricing','dashboard'].map((href) => (
                <li key={href}><a href={`#${href}`} className="text-gray-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors capitalize">{href}</a></li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="font-bold text-base mb-4 text-gray-900 dark:text-white">Resources</h3>
            <ul className="space-y-2 text-sm">
              {[['docs','Documentation'],['guide','Setup Guide'],['support','Support'],['status','Status'],['faq','FAQ']].map(([href, label]) => (
                <li key={href}><a href={`#${href}`} className="text-gray-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">{label}</a></li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="font-bold text-base mb-4 text-gray-900 dark:text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              {(['terms','privacy','cookies'] as const).map((type) => (
                <li key={type}><button type="button" onClick={() => onOpenLegal(type)}
                  className="text-gray-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors capitalize">{type}</button></li>
              ))}
              <li><a href="#top" className="text-gray-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Back to Top</a></li>
            </ul>
          </motion.div>
        </motion.div>

        <div className="border-t border-brand-100 dark:border-surface-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} {config.botName}. All rights reserved.
            </p>
            <div className="flex gap-3">
              {[
                { url: config.twitterUrl,      Icon: Twitter,        label: 'Twitter' },
                { url: config.githubUrl,       Icon: Github,         label: 'GitHub' },
                { url: config.supportServerUrl,Icon: MessageCircle,  label: 'Discord' },
                { url: config.contactEmail ? `mailto:${config.contactEmail}` : null, Icon: Mail, label: 'Email' },
              ].filter(s => s.url).map(({ url, Icon, label }) => (
                <a key={label} href={url!} target={label !== 'Email' ? '_blank' : undefined}
                  rel={label !== 'Email' ? 'noopener noreferrer' : undefined}
                  className="p-2 bg-brand-50 dark:bg-surface-700 rounded-lg hover:bg-brand-100 dark:hover:bg-surface-600 text-brand-600 dark:text-brand-400 transition-colors"
                  aria-label={label}>
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

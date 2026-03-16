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
    <footer className="relative bg-[#010208] border-t border-white/5 py-20 overflow-hidden">
      {/* Footer background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-amber-500/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16"
        >
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-500 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <Bot className="w-6 h-6 text-black" />
              </div>
              <span className="text-2xl font-black text-white uppercase tracking-tighter">{config.botName}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm font-medium pr-8">
              The ultimate Discord bot for community management and high-scale automation. Engineered for stability at the edge of the universe.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="font-black text-white text-xs uppercase tracking-widest mb-6">Navigation</h3>
            <ul className="space-y-4 text-sm font-bold">
              {['features', 'commands', 'pricing', 'docs'].map((item) => (
                <li key={item}>
                  <a href={`#${item}`} className="text-slate-500 hover:text-amber-500 transition-colors uppercase tracking-wider">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="font-black text-white text-xs uppercase tracking-widest mb-6">Resources</h3>
            <ul className="space-y-4 text-sm font-bold">
              {[['support','Support'],['status','Uptime'],['faq','Knowledge Base']].map(([href, label]) => (
                <li key={href}>
                  <a href={`#${href}`} className="text-slate-500 hover:text-amber-500 transition-colors uppercase tracking-wider">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="font-black text-white text-xs uppercase tracking-widest mb-6">Legal</h3>
            <ul className="space-y-4 text-sm font-bold">
              {(['terms','privacy','cookies'] as const).map((type) => (
                <li key={type}>
                  <button type="button" onClick={() => onOpenLegal(type)}
                    className="text-slate-500 hover:text-amber-500 transition-colors uppercase tracking-wider text-left">
                    {type}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            &copy; {new Date().getFullYear()} {config.botName} Project. Void Stabilized.
          </p>
          <div className="flex gap-4">
            {[
              { url: config.twitterUrl,      Icon: Twitter,        label: 'Twitter' },
              { url: config.githubUrl,       Icon: Github,         label: 'GitHub' },
              { url: config.supportServerUrl,Icon: MessageCircle,  label: 'Discord' },
              { url: config.contactEmail ? `mailto:${config.contactEmail}` : null, Icon: Mail, label: 'Email' },
            ].filter(s => s.url).map(({ url, Icon, label }) => (
              <a key={label} href={url!} target={label !== 'Email' ? '_blank' : undefined}
                rel={label !== 'Email' ? 'noopener noreferrer' : undefined}
                className="p-3 gravitational-lens rounded-xl hover:bg-white/5 text-amber-500 transition-all duration-300 hover:scale-110"
                aria-label={label}>
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

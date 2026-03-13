import { Shield, Music, Coins, TrendingUp, Zap, FileText, Bell, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Shield,    title: 'Advanced Moderation',    description: 'Keep your server safe with powerful moderation tools including auto-mod, warnings, kicks, and bans.',                   gradient: 'from-red-500 to-orange-500' },
  { icon: Zap,       title: 'Auto Moderation',         description: 'Intelligent spam detection, link filtering, and custom word blacklists that work automatically.',                       gradient: 'from-amber-400 to-orange-500' },
  { icon: Music,     title: 'Music Player',            description: 'High-quality music streaming from YouTube, Spotify, and more with advanced queue management.',                          gradient: 'from-violet-500 to-purple-600' },
  { icon: Coins,     title: 'Economy System',          description: 'Engage your community with a full economy system, virtual currency, shop, and trading.',                               gradient: 'from-emerald-400 to-teal-500' },
  { icon: TrendingUp,title: 'Leveling & XP',           description: 'Reward active members with XP, levels, and custom roles based on their activity.',                                    gradient: 'from-brand-400 to-indigo-600' },
  { icon: Bot,       title: 'Server Automation',       description: 'Automate welcome messages, role assignments, announcements, and custom workflows.',                                    gradient: 'from-brand-500 to-violet-600' },
  { icon: FileText,  title: 'Comprehensive Logging',   description: 'Track all server activities with detailed logs for messages, members, roles, and more.',                               gradient: 'from-purple-500 to-violet-600' },
  { icon: Bell,      title: 'Custom Notifications',    description: 'Set up custom alerts for Twitch, YouTube, Twitter, Reddit, and other platforms.',                                     gradient: 'from-cyan-400 to-brand-500' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Features() {
  return (
    <section id="features" className="py-24 bg-brand-100 dark:bg-surface-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Powerful Features for Every Server
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto"
          >
            Everything you need to manage, engage, and grow your Discord community in one powerful bot.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative bg-brand-50 dark:bg-surface-700 rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-brand-200 dark:border-surface-600"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

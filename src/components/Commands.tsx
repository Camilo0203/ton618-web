import { useState } from 'react';
import { Copy, Check, Shield, Music, Coins, TrendingUp, Zap, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const commandCategories = [
  {
    name: 'Moderation',
    icon: Shield,
    gradient: 'from-red-500 to-orange-500',
    commands: [
      { name: '/ban', description: 'Ban a user from the server', usage: '/ban @user [reason]' },
      { name: '/kick', description: 'Kick a user from the server', usage: '/kick @user [reason]' },
      { name: '/warn', description: 'Warn a user', usage: '/warn @user [reason]' },
      { name: '/mute', description: 'Mute a user', usage: '/mute @user [duration]' },
    ],
  },
  {
    name: 'Music',
    icon: Music,
    gradient: 'from-pink-500 to-purple-500',
    commands: [
      { name: '/play', description: 'Play a song', usage: '/play [song name or URL]' },
      { name: '/skip', description: 'Skip the current song', usage: '/skip' },
      { name: '/queue', description: 'Show the music queue', usage: '/queue' },
      { name: '/volume', description: 'Set the volume', usage: '/volume [0-100]' },
    ],
  },
  {
    name: 'Economy',
    icon: Coins,
    gradient: 'from-green-500 to-emerald-500',
    commands: [
      { name: '/balance', description: 'Check your balance', usage: '/balance [@user]' },
      { name: '/daily', description: 'Claim daily rewards', usage: '/daily' },
      { name: '/shop', description: 'Browse the shop', usage: '/shop' },
      { name: '/buy', description: 'Buy an item', usage: '/buy [item]' },
    ],
  },
  {
    name: 'Leveling',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-cyan-500',
    commands: [
      { name: '/level', description: 'Check your level', usage: '/level [@user]' },
      { name: '/leaderboard', description: 'View server leaderboard', usage: '/leaderboard' },
      { name: '/rank', description: 'Check your rank', usage: '/rank [@user]' },
    ],
  },
  {
    name: 'Utility',
    icon: Zap,
    gradient: 'from-yellow-500 to-orange-500',
    commands: [
      { name: '/serverinfo', description: 'Get server information', usage: '/serverinfo' },
      { name: '/userinfo', description: 'Get user information', usage: '/userinfo [@user]' },
      { name: '/poll', description: 'Create a poll', usage: '/poll [question]' },
    ],
  },
  {
    name: 'Configuration',
    icon: Settings,
    gradient: 'from-indigo-500 to-purple-500',
    commands: [
      { name: '/setup', description: 'Setup the bot', usage: '/setup' },
      { name: '/prefix', description: 'Change command prefix', usage: '/prefix [new prefix]' },
      { name: '/config', description: 'View bot configuration', usage: '/config' },
    ],
  },
];

export default function Commands() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="commands" className="py-24 bg-white dark:bg-gray-800 transition-colors duration-300 relative">
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-gray-900/10 to-transparent dark:from-gray-900/40 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4"
          >
            Powerful Commands at Your Fingertips
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Easy-to-use slash commands that make managing your server a breeze.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {commandCategories.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={categoryIndex}
                variants={itemVariants}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${category.gradient}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{category.name}</h3>
                </div>

                <div className="space-y-3">
                  {category.commands.map((command, commandIndex) => (
                    <div
                      key={commandIndex}
                      className="group bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <code className="text-sm font-mono font-semibold text-purple-600 dark:text-purple-400">
                          {command.name}
                        </code>
                        <button
                          onClick={() => copyCommand(command.usage)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title="Copy command"
                        >
                          {copiedCommand === command.usage ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{command.description}</p>
                      <code className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                        {command.usage}
                      </code>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

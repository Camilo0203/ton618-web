import { Bot, Settings, SlidersHorizontal, PartyPopper } from 'lucide-react';
import { getDiscordInviteUrl } from '../config';

const steps = [
  {
    icon: Bot,
    title: 'Invite the bot',
    description: 'Authorize the bot in your Discord server with the proper permissions.',
    href: '#top',
    linkLabel: 'Invite now',
  },
  {
    icon: Settings,
    title: 'Run /setup',
    description: 'Use the guided slash command to initialize categories and permissions.',
    href: '#commands',
    linkLabel: 'View commands',
  },
  {
    icon: SlidersHorizontal,
    title: 'Configure modules',
    description: 'Enable only the features your community needs from dashboard or commands.',
    href: '#dashboard',
    linkLabel: 'Open dashboard',
  },
  {
    icon: PartyPopper,
    title: 'Launch and enjoy',
    description: 'Welcome members, automate moderation, and keep engagement high.',
    href: '#support',
    linkLabel: 'Get support',
  },
];

export default function SetupGuide() {
  const inviteUrl = getDiscordInviteUrl();

  return (
    <section id="guide" className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Setup Guide</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">Invite, configure, and launch in four quick steps.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const href = index === 0 && inviteUrl ? inviteUrl : step.href;
            const external = index === 0 && Boolean(inviteUrl);
            return (
              <article key={step.title} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm transition-colors duration-300">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs uppercase tracking-wide text-purple-600 dark:text-purple-400 font-semibold mb-2">Step {index + 1}</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-5">{step.description}</p>
                <a
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="text-purple-700 dark:text-purple-400 font-semibold hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                >
                  {step.linkLabel}
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

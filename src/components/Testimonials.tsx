import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Alex Johnson', role: 'Community Manager', server: 'Gaming Hub',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'This bot has completely transformed how we manage our 50k+ member server. The auto-moderation alone has saved us countless hours.',
    rating: 5,
  },
  {
    name: 'Sarah Chen', role: 'Server Owner', server: 'Art Community',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: "The leveling system keeps our members engaged and the music player is incredibly reliable. Best Discord bot we've ever used!",
    rating: 5,
  },
  {
    name: 'Mike Rodriguez', role: 'Admin', server: 'Tech Talk',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'Easy to set up, powerful features, and excellent support. The logging feature has been invaluable for moderating our community.',
    rating: 5,
  },
  {
    name: 'Emma Wilson', role: 'Moderator', server: 'Study Group',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: "The custom commands and automation features are game-changers. We've automated so many repetitive tasks. Highly recommended!",
    rating: 5,
  },
  {
    name: 'James Park', role: 'Server Owner', server: 'Music Lovers',
    avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'The music quality is outstanding and the economy system keeps everyone engaged. Our server activity has doubled since adding this bot.',
    rating: 5,
  },
  {
    name: 'Lisa Anderson', role: 'Community Lead', server: 'Fitness Squad',
    avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'Professional, reliable, and feature-rich. The dashboard makes configuration so easy. This bot is worth every penny!',
    rating: 5,
  },
];

export default function Testimonials() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="testimonials" className="py-24 bg-brand-100 dark:bg-surface-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Loved by Server Owners Worldwide
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-slate-400 max-w-3xl mx-auto"
          >
            Don't just take our word for it. Here's what our community has to say.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-brand-50 dark:bg-surface-700 rounded-2xl p-7 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative border border-brand-200 dark:border-surface-600"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-brand-200 dark:text-brand-600/60" />

              <div className="flex items-center gap-4 mb-5 relative z-10">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-brand-200 dark:border-brand-700"
                />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{testimonial.role}</p>
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">{testimonial.server}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4 relative z-10">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-gray-700 dark:text-slate-300 leading-relaxed relative z-10 text-sm">
                "{testimonial.content}"
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

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
    <section id="testimonials" className="py-32 bg-[#010208] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter"
          >
            Stabilized <span className="text-brand-gradient">Mass</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto font-bold uppercase tracking-widest"
          >
            Trusted by the largest servers in the local cluster.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="hud-border rounded-3xl p-10 flex flex-col transition-all duration-500 hover:border-amber-500/40 relative group"
            >
              <Quote className="absolute top-10 right-10 w-10 h-10 text-white/5 group-hover:text-amber-500/10 transition-colors" />

              <div className="flex items-center gap-5 mb-8 relative z-10">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white/5 group-hover:border-amber-500/30 transition-colors shadow-2xl"
                />
                <div>
                  <h4 className="font-black text-white uppercase tracking-tight text-lg">{testimonial.name}</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{testimonial.role}</p>
                  <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em]">{testimonial.server}</p>
                </div>
              </div>

              <div className="flex gap-1.5 mb-6 relative z-10">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                ))}
              </div>

              <p className="text-slate-400 font-bold leading-relaxed relative z-10 text-sm uppercase tracking-wide opacity-80">
                "{testimonial.content}"
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

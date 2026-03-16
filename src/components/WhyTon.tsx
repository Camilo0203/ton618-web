import { motion } from 'framer-motion';
import { Target, Zap, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';

const reasons = [
  {
    icon: Target,
    title: "Unmatched Precision",
    description: "Every command is executed with absolute accuracy. No edge cases, no failures. Just pure technical dominance."
  },
  {
    icon: Zap,
    title: "Quantum Performance",
    description: "Built on a custom high-concurrency engine processing thousands of operations per second with minimal latency."
  },
  {
    icon: ShieldCheck,
    title: "Fortress Security",
    description: "Advanced threat mitigation going beyond filtering. We protect your community with corporate-grade protocols."
  },
  {
    icon: Cpu,
    title: "Neural Integration",
    description: "A modular, intelligent core designed to adapt and evolve with your server's unique ecosystem."
  }
];

export default function WhyTon() {
  return (
    <section id="why" className="py-40 bg-black relative overflow-hidden">
      {/* Structural Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-px bg-gradient-to-l from-indigo-500/20 to-transparent"></div>
      <div className="absolute top-0 right-0 h-[500px] w-px bg-gradient-to-b from-indigo-500/20 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-4 mb-8">
               <div className="h-[1px] w-12 bg-indigo-500"></div>
               <span className="text-xs font-bold uppercase tracking-[0.4em] text-indigo-500">Elite Engineering</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold text-white uppercase leading-[0.9] mb-10 tracking-tightest">
              Engineered <br/>
              <span className="text-premium-gradient">Superiority</span>
            </h2>
            
            <p className="text-xl text-slate-400 font-medium leading-relaxed mb-12 max-w-xl">
              In a universe of generic templates, TON618 is the only utility forged with the scale and power of a supermassive singularity.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Uptime Protocol', value: '99.99%', sub: 'Verified 24/7' },
                 { label: 'Processing Speed', value: '< 12ms', sub: 'Global Latency' }
               ].map((item, i) => (
                 <div key={i} className="p-6 cinematic-glass rounded-2xl border-white/5 group hover:border-indigo-500/20 transition-all duration-500">
                    <div className="text-sm text-indigo-400 font-bold tracking-widest uppercase mb-1">{item.label}</div>
                    <div className="text-3xl font-bold text-white mb-1">{item.value}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.sub}</div>
                 </div>
               ))}
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 relative">
            {/* Visual HUD Decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 border border-white/5 rounded-full opacity-20 animate-spin-slow"></div>

            {reasons.map((reason, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="tech-card overflow-hidden group"
              >
                <div className="hud-accent-corner top-left"></div>
                <div className="hud-accent-corner top-right"></div>
                <div className="hud-accent-corner bottom-left"></div>
                <div className="hud-accent-corner bottom-right"></div>

                <div className="relative z-10">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <reason.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tighter mb-3 flex items-center justify-between">
                    {reason.title}
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                  </h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{reason.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


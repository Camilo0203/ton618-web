import { Shield, Zap, Cpu, BarChart3, Lock, Globe, Layers, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { 
    icon: Shield,    
    title: 'Kinetic Moderation',    
    description: 'Neural-linked enforcement protocols that sanitize threats before they penetrate your community ecosystem.',
    status: 'ENFORCER ACTIVE'
  },
  { 
    icon: Cpu,       
    title: 'Core Autonomy', 
    description: 'Sophisticated event-loops and automated role architectures that evolve with your server\'s complexity.',
    status: 'LOGIC STABLE'
  },
  { 
    icon: Zap,       
    title: 'Sub-Zero Latency',      
    description: 'High-frequency command processing across decentralized shard clusters for near-instant execution.',
    status: 'FLOW OPTIMIZED'
  },
  { 
    icon: Lock,      
    title: 'Cryptographic Integrity',     
    description: 'Military-grade data protection and sophisticated intrusion detection to maintain total sovereign security.',
    status: 'SHIELD VERIFIED'
  },
  { 
    icon: BarChart3,  
    title: 'Neural Analytics',         
    description: 'Deep-space telemetry and interaction mapping. Visualize every data point within your digital horizon.',
    status: 'COGNITION LIVE'
  },
  { 
    icon: Globe,     
    title: 'Omni-Scale Network',    
    description: 'Architected for massive expansion. Seamlessly sustain multi-million member ecosystems with absolute stability.',
    status: 'HORIZON EXPANDED'
  },
  { 
    icon: Layers,     
    title: 'Modular DNA',   
    description: 'Granular configuration patterns. Tailor the singularity core to your server\'s specific operational requirements.',
    status: 'CORE CUSTOMIZED'
  },
  { 
    icon: Radio,       
    title: 'Unified Comms',           
    description: 'Seamless integration across the Discord API. A bridge between your community and the next generation of tools.',
    status: 'SIGNAL CLEAR'
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } as const,
};

export default function Features() {
  return (
    <section id="features" className="py-40 relative overflow-hidden bg-black/50">
      {/* ATMOSPHERIC BACKGROUND */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] nebula-blur bg-indigo-500/5 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] nebula-blur bg-purple-500/5 translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-32 gap-10">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="w-8 h-[1px] bg-indigo-500/50"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Tactical Advantage</span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tightest uppercase"
            >
              Operational <br/>
              <span className="text-premium-gradient">Superiority</span>
            </motion.h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-md"
          >
            <p className="text-lg text-slate-400 font-medium leading-relaxed border-l border-white/10 pl-8">
              A highly-calibrated utility core designed to command the next generation of complex digital infrastructures.
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="tech-card group"
              >
                {/* HUD ACCENTS */}
                <div className="hud-accent-corner top-left"></div>
                <div className="hud-accent-corner top-right"></div>
                <div className="hud-accent-corner bottom-left"></div>
                <div className="hud-accent-corner bottom-right"></div>

                {/* ICON BOX */}
                <div className="relative mb-8 w-14 h-14 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.05] group-hover:border-indigo-500/30 transition-all duration-500">
                  <Icon className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors duration-500" />
                </div>

                <h3 className="text-xl font-bold text-white mb-4 tracking-tight group-hover:text-indigo-100 transition-colors">{feature.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 group-hover:text-slate-400 transition-colors duration-500">
                  {feature.description}
                </p>
                
                <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/[0.05]">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 group-hover:text-indigo-500/60 transition-colors">
                    {feature.status}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-indigo-500 animate-pulse"></div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}


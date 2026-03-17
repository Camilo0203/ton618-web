import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Bot, ChevronRight, Zap } from 'lucide-react';
import { getDiscordInviteUrl } from '../config';

export default function FinalCTA() {
  const { t } = useTranslation();
  const inviteUrl = getDiscordInviteUrl();

  return (
    <section id="join" className="py-32 relative overflow-hidden bg-black">
      {/* Cinematic Singularity Background */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
        {/* Soft Depth Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-indigo-500/5 blur-[180px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        
        {/* ORGANIC FOCAL ACCENT VIDEO - No visible boxes */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-screen opacity-40 mix-blend-lighten"
          style={{ 
            maskImage: 'radial-gradient(circle at center, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 20%, transparent 70%)'
          }}
        >
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            preload="metadata"
            className="w-full h-full object-contain scale-125"
          >
            <source src="/videos/lensing-arc.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
        >
          <div className="inline-flex items-center gap-2 mb-10 px-4 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5">
             <Zap className="w-3 h-3 text-indigo-400 fill-indigo-400" />
             <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{t('final.tag')}</span>
          </div>

          <h2 className="text-6xl md:text-9xl font-bold text-white uppercase tracking-tightest leading-none mb-12">
            {t('final.title')} <br/>
            <span className="text-premium-gradient">{t('final.titleAccent')}</span>
          </h2>
          
          <p className="text-xl text-slate-400 font-medium mb-16 max-w-2xl mx-auto leading-relaxed">
            {t('final.description')}
          </p>

          <div className="flex justify-center items-center">
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium-primary text-lg !px-20 !py-6 group"
            >
              <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform duration-500" />
              <span>{t('final.cta')}</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="mt-24 flex flex-wrap justify-center gap-12 text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em]">
             <div className="flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:animate-ping"></div>
                <span>{t('final.nodes.active')}</span>
             </div>
             <div className="flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 group-hover:animate-ping"></div>
                <span>{t('final.nodes.encryption')}</span>
             </div>
             <div className="flex items-center gap-2 group">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:animate-ping"></div>
                <span>{t('final.nodes.stabilized')}</span>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


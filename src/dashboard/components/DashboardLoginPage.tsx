import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { useSignInWithDiscord } from '../hooks/useDashboardData';
import { config } from '../../config';

interface DashboardLoginPageProps {
  requestedGuildId?: string | null;
}

export default function DashboardLoginPage({ requestedGuildId }: DashboardLoginPageProps) {
  const { t } = useTranslation();
  const signIn = useSignInWithDiscord();
  
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg z-10"
      >
        <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-br from-[#5865F2]/30 via-indigo-500/20 to-purple-500/30 blur-2xl opacity-70" />
        
        <div className="relative rounded-[2rem] border border-white/[0.08] bg-[#0A0A0F]/80 p-10 backdrop-blur-3xl shadow-[0_0_80px_rgba(88,101,242,0.15)] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(88,101,242,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.08),transparent_40%)]" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="relative z-10">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-[#5865F2]/30 bg-[#5865F2]/10 shadow-[inset_0_0_20px_rgba(88,101,242,0.2)]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-[#5865F2]">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
            </div>

            <h2 className="text-[2rem] font-bold tracking-tight text-white mb-3">
              {t('dashboardAuth.authCard.cardTitle')}
            </h2>
            
            <p className="text-slate-300/80 mb-10 text-[0.95rem] leading-relaxed max-w-sm mx-auto">
              {t('dashboardAuth.authCard.cardDescription')}
            </p>

            <div className="relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#5865F2] to-indigo-500 opacity-40 blur transition duration-300 group-hover:opacity-70" />
              <button
                onClick={() => signIn.mutate(requestedGuildId || null)}
                disabled={signIn.isPending}
                className="relative flex w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] px-6 py-4 text-[1.05rem] font-semibold text-white transition-all duration-300 shadow-[0_0_40px_rgba(88,101,242,0.4)] disabled:opacity-70"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
                <span>{signIn.isPending ? t('dashboardAuth.authCard.loadingCta') : t('dashboardAuth.authCard.cta')}</span>
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500/80">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                <span>OAuth2 Seguro</span>
              </div>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <span>Sin Pérdida de Datos</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

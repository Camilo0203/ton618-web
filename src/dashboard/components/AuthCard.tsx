import { AlertTriangle, LockKeyhole, LogIn, ShieldCheck } from 'lucide-react';
import StateCard from './StateCard';
import Logo from '../../components/Logo';
import { config } from '../../config';

interface AuthCardProps {
  canUseDashboard: boolean;
  isLoading: boolean;
  errorMessage?: string;
  onLogin: () => void;
}

export default function AuthCard({
  canUseDashboard,
  isLoading,
  errorMessage,
  onLogin,
}: AuthCardProps) {
  const dashboardBrandLabel = `${config.botName} Dashboard`;

  if (!canUseDashboard) {
    return (
      <StateCard
        eyebrow="Configuracion requerida"
        title="Falta conectar Supabase"
        description="Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para activar el login con Discord, sincronizar servidores y guardar configuraciones del bot."
        icon={AlertTriangle}
        tone="warning"
      />
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,36,0.94),rgba(8,11,24,0.9))] px-6 py-8 text-center shadow-[0_28px_90px_rgba(2,6,23,0.52)] backdrop-blur-2xl sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_34%),radial-gradient(circle_at_bottom,rgba(139,92,246,0.12),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-14 h-36 w-36 -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />

      <div className="relative z-[1] mx-auto flex max-w-[34rem] flex-col items-center">
        <Logo
          size="lg"
          withText={false}
          className="justify-center"
          frameClassName="mx-auto"
          imageClassName="drop-shadow-[0_24px_48px_rgba(99,102,241,0.3)]"
        />

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-300/20 bg-brand-400/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-200">
          <LockKeyhole className="h-3.5 w-3.5" />
          Acceso protegido
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-400">
            {dashboardBrandLabel}
          </p>
          <h1 className="text-balance text-[2rem] font-bold tracking-[-0.05em] text-white sm:text-[2.35rem]">
            Inicia sesion para entrar al panel de control
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-7 text-slate-300 sm:text-[0.95rem]">
            {errorMessage || 'Accede con Discord para administrar tus servidores, sincronizar configuraciones y operar el dashboard con permisos reales.'}
          </p>
        </div>

        <div className="relative mt-8 w-full">
          <div className="pointer-events-none absolute inset-x-10 -inset-y-2 rounded-full bg-brand-500/25 blur-2xl" />
          <button
            type="button"
            onClick={onLogin}
            disabled={isLoading}
            className="relative inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-brand-300/25 bg-[linear-gradient(180deg,rgba(99,102,241,0.95),rgba(79,70,229,0.82))] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.34)] transition duration-300 hover:-translate-y-0.5 hover:border-brand-200/35 hover:shadow-[0_22px_52px_rgba(79,70,229,0.42)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LogIn className="h-4 w-4" />
            {isLoading ? 'Conectando...' : 'Continuar con Discord'}
          </button>
        </div>

        <p className="mt-5 text-xs leading-6 text-slate-400">
          Cifrado seguro · Sincronizacion de servidores · Acceso con Supabase
        </p>
      </div>
      <div className="relative z-[1] mt-7 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5 text-brand-300" />
        TON618 mantiene el branding y el flujo oficial de Discord OAuth
      </div>
    </section>
  );
}

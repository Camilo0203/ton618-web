import { AlertTriangle, LogIn, ShieldCheck } from 'lucide-react';
import StateCard from './StateCard';
import Logo from '../../components/Logo';

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
    <div className="space-y-5">
      <div className="dashboard-surface-soft flex items-center justify-between gap-4 rounded-[1.75rem] p-5">
        <Logo size="lg" subtitle="TON618 Dashboard" />
        <div className="hidden text-right md:block">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-300">Official Identity</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-300">Acceso centralizado a TON618 y a su configuracion operativa.</p>
        </div>
      </div>
      <StateCard
        eyebrow="Acceso protegido"
        title="Inicia sesion con Discord para administrar tu bot"
        description={errorMessage || 'El panel muestra solo los servidores donde tu cuenta tiene permisos de administracion o gestion.'}
        icon={ShieldCheck}
        actions={(
          <button
            type="button"
            onClick={onLogin}
            disabled={isLoading}
            className="dashboard-primary-button"
          >
            <LogIn className="h-4 w-4" />
            {isLoading ? 'Conectando...' : 'Continuar con Discord'}
          </button>
        )}
      />
    </div>
  );
}

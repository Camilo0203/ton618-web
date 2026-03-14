import { AlertTriangle, LogIn, ShieldCheck } from 'lucide-react';
import StateCard from './StateCard';

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
  );
}

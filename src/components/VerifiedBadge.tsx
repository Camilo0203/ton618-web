import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function VerifiedBadge({ className = '' }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide-readable text-emerald-300 ${className}`}>
      <ShieldCheck className="h-3 w-3" />
      {t('verifiedBadge.label')}
    </span>
  );
}

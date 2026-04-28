import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DashboardPartialFailure } from '../types';

interface DashboardDegradationNoticeProps {
  failures: DashboardPartialFailure[];
  title?: string;
  className?: string;
}

export default function DashboardDegradationNotice({
  failures,
  title,
  className = '',
}: DashboardDegradationNoticeProps) {
  const { t } = useTranslation();
  if (!failures.length) {
    return null;
  }

  return (
    <div
      className={`rounded-[1.6rem] border border-amber-900/40 bg-amber-950/20 p-5 text-amber-100 ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title || t('dashboard.degradationNotice.title')}</p>
          <p className="mt-1 text-sm leading-6 text-current/80">
            {t('dashboard.degradationNotice.description')}
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-current/80">
            {failures.map((failure) => (
              <li key={failure.id}>
                <strong>{failure.label}:</strong> {failure.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

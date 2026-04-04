import {
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import SaveRequestButton from './SaveRequestButton';

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function FieldShell({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const generatedId = useId();
  const fieldId = `field-${generatedId}`;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id: children.props.id ?? fieldId,
        'aria-describedby': [children.props['aria-describedby'], describedBy].filter(Boolean).join(' ') || undefined,
        'aria-invalid': error ? true : children.props['aria-invalid'],
      })
    : children;

  return (
    <label htmlFor={fieldId} className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-200">{label}</span>
      {hint ? (
        <span id={hintId} className="mb-2 block text-xs leading-5 text-slate-400">
          {hint}
        </span>
      ) : null}
      {child}
      {error ? (
        <span id={errorId} className="mt-2 block text-sm font-medium text-rose-300">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function ToggleCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <label className="dashboard-toggle-card flex items-start gap-3 focus-within:border-indigo-500/30 focus-within:bg-indigo-500/[0.06] focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.14)]">
      {children}
      <span>
        <span className="block font-semibold text-white">{title}</span>
        {description ? (
          <span className="mt-1 block text-sm text-slate-300">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

export function InventoryNotice({
  title,
  message,
  tone = 'warning',
}: {
  title: string;
  message: string;
  tone?: 'warning' | 'neutral';
}) {
  const classes =
    tone === 'warning'
      ? 'dashboard-module-notice-warning'
      : 'dashboard-module-notice-neutral';

  return (
    <div className={`rounded-[1.4rem] border p-4 ${classes}`} role="status">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6 opacity-90">{message}</p>
        </div>
      </div>
    </div>
  );
}

export function ValidationSummary({ errors }: { errors: string[] }) {
  if (!errors.length) {
    return null;
  }

  return (
    <div
      className="dashboard-module-notice-danger"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold">Hay datos que revisar antes de guardar</p>
          <ul className="mt-2 space-y-1 text-sm leading-6">
            {errors.map((error) => (
              <li key={error}>- {error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ConfigFormActions({
  isDirty,
  isSaving,
  onReset,
  saveLabel,
}: {
  isDirty: boolean;
  isSaving: boolean;
  onReset: () => void;
  saveLabel?: string;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onReset}
        disabled={!isDirty || isSaving}
        className="dashboard-secondary-button min-w-[10rem]"
      >
        <RotateCcw className="h-4 w-4" />
        Restablecer
      </button>
      <SaveRequestButton isDirty={isDirty} isSaving={isSaving} dirtyLabel={saveLabel} />
    </>
  );
}

import { Sparkles } from 'lucide-react';
import type { TicketMacro } from '../../types';
import { getMacroVisibilityLabel } from './inboxHelpers';
import type { T } from './inboxTypes';

interface InboxMacroPanelProps {
  macros: TicketMacro[];
  selectedMacroId: string;
  onSelectedMacroIdChange: (value: string) => void;
  selectedMacro: TicketMacro | null;
  macroConfirmed: boolean;
  onMacroConfirmedChange: (value: boolean) => void;
  isMutating: boolean;
  t: T;
  onPostMacro: () => void;
}

export default function InboxMacroPanel(props: InboxMacroPanelProps) {
  return (
    <div className="dashboard-surface-soft rounded-[1.6rem] p-5">
      <div className="flex items-center gap-3">
        <Sparkles className="h-4 w-4 text-brand-500" />
        <div>
          <p className="dashboard-panel-label">{props.t('dashboard.inbox.detail.ops.macrosEyebrow')}</p>
          <h3 className="mt-1 text-xl font-semibold text-white">{props.t('dashboard.inbox.detail.ops.macrosTitle')}</h3>
        </div>
      </div>

      {props.macros.length ? (
        <div className="mt-4 space-y-4">
          <select value={props.selectedMacroId} onChange={(event) => props.onSelectedMacroIdChange(event.target.value)} className="dashboard-form-field">
            <option value="">{props.t('dashboard.inbox.detail.ops.selectMacro')}</option>
            {props.macros.map((macro) => <option key={macro.macroId} value={macro.macroId}>{macro.label}</option>)}
          </select>

          {props.selectedMacro ? (
            <>
              <div className="dashboard-data-card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="dashboard-status-pill-compact dashboard-neutral-pill">{props.selectedMacro.label}</span>
                  <span className="dashboard-status-pill-compact dashboard-neutral-pill">{getMacroVisibilityLabel(props.selectedMacro, props.t)}</span>
                  {props.selectedMacro.isSystem ? <span className="dashboard-status-pill-compact dashboard-neutral-pill">System</span> : null}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{props.selectedMacro.content}</p>
              </div>

              <label className="flex items-start gap-3 rounded-[1.2rem] border border-white/[0.07] bg-white/[0.04] p-3 text-sm text-slate-700 text-slate-300">
                <input type="checkbox" checked={props.macroConfirmed} onChange={(event) => props.onMacroConfirmedChange(event.target.checked)} className="mt-1" />
                <span>{props.t('dashboard.inbox.detail.ops.macroConfirm')}</span>
              </label>

              <button type="button" onClick={props.onPostMacro} disabled={props.isMutating || !props.macroConfirmed} className="dashboard-primary-button">
                {props.t('dashboard.inbox.detail.ops.postMacro')}
              </button>
            </>
          ) : <div className="dashboard-empty-state">{props.t('dashboard.inbox.detail.ops.macroEmptySelection')}</div>}
        </div>
      ) : <div className="dashboard-empty-state mt-4">{props.t('dashboard.inbox.detail.ops.noMacros')}</div>}
    </div>
  );
}

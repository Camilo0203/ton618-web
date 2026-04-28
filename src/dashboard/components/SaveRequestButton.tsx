import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SaveRequestButtonProps {
  isDirty: boolean;
  isSaving: boolean;
  idleLabel?: string;
  savingLabel?: string;
  dirtyLabel?: string;
}

export default function SaveRequestButton({
  isDirty,
  isSaving,
  idleLabel,
  savingLabel,
  dirtyLabel,
}: SaveRequestButtonProps) {
  const { t } = useTranslation();
  return (
    <button
      type="submit"
      disabled={!isDirty || isSaving}
      className="dashboard-primary-button min-w-[11.5rem]"
    >
      <Save className="h-4 w-4" />
      {isSaving ? savingLabel || t('dashboard.saveRequestButton.saving') : isDirty ? dirtyLabel || t('dashboard.saveRequestButton.dirty') : idleLabel || t('dashboard.saveRequestButton.idle')}
    </button>
  );
}

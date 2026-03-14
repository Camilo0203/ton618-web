import { Save } from 'lucide-react';

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
  idleLabel = 'Sin cambios',
  savingLabel = 'Enviando...',
  dirtyLabel = 'Solicitar cambio',
}: SaveRequestButtonProps) {
  return (
    <button
      type="submit"
      disabled={!isDirty || isSaving}
      className="dashboard-primary-button min-w-[11.5rem]"
    >
      <Save className="h-4 w-4" />
      {isSaving ? savingLabel : isDirty ? dirtyLabel : idleLabel}
    </button>
  );
}

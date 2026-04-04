import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { dashboardSections } from '../constants';
import type { DashboardSectionId } from '../types';

interface CommandPaletteProps {
  onSelect: (sectionId: DashboardSectionId) => void;
}

export default function CommandPalette({ onSelect }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)} 
      />
      <Command 
        className="relative flex w-full max-w-[600px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#05060f]/95 shadow-[0_30px_100px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center border-b border-white/[0.08] px-4">
          <Search className="h-5 w-5 text-white/40" />
          <Command.Input 
            autoFocus 
            placeholder={t('dashboard.sections.overview.label') + "..."} 
            className="flex h-14 w-full bg-transparent px-4 py-3 outline-none placeholder:text-white/30 text-white" 
          />
        </div>
        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-white/50">
            No se encontraron resultados.
          </Command.Empty>

          <Command.Group heading="Módulos" className="text-xs font-medium text-white/40 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-white/30">
            {dashboardSections.map((section) => (
              <Command.Item
                key={section.id}
                onSelect={() => {
                  onSelect(section.id as DashboardSectionId);
                  setOpen(false);
                }}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm text-white/70 aria-selected:bg-white/[0.06] aria-selected:text-white flex-col items-start gap-0.5"
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="font-medium">{t(`dashboard.sections.${section.id}.label`)}</span>
                </div>
                <span className="text-xs text-white/40 truncate">{t(`dashboard.sections.${section.id}.description`)}</span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}

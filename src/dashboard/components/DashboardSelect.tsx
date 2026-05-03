import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useController, useFormContext } from 'react-hook-form';
import { cn } from '../utils';

interface Option {
  value: string;
  label: string;
}

interface DashboardSelectProps {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function DashboardSelect({
  name,
  value: manualValue,
  onChange: manualOnChange,
  options,
  placeholder = 'Seleccionar...',
  disabled = false,
  className,
}: DashboardSelectProps) {
  const formContext = useFormContext();
  
  // Si tenemos name y estamos dentro de un FormProvider, usamos react-hook-form
  const {
    field: { value: formValue, onChange: formOnChange },
  } = (name && formContext) 
    ? useController({ name, control: formContext.control })
    : { field: { value: manualValue, onChange: manualOnChange } };

  const value = formValue ?? manualValue;
  const onChange = formOnChange ?? manualOnChange;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'group flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all duration-300',
          'border-white/10 bg-white/5 backdrop-blur-md',
          'hover:border-indigo-500/50 hover:bg-white/10',
          'focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10',
          disabled && 'cursor-not-allowed opacity-50',
          isOpen && 'border-indigo-500 bg-white/10 ring-4 ring-indigo-500/10'
        )}
      >
        <span className={cn('truncate font-semibold tracking-tight text-white transition-colors duration-200', !selectedOption && 'text-slate-500')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-slate-400 transition-transform duration-300 group-hover:text-slate-200',
            isOpen && 'rotate-180 text-indigo-400'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-[60] mt-2 w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0d1b] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-2xl"
          >
            <div className="max-h-64 overflow-y-auto custom-scrollbar pr-0.5">
              {options.length > 0 ? (
                options.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200',
                        isSelected
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                        >
                          <Check className="h-4 w-4 text-indigo-400" />
                        </motion.div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-3.5 py-3 text-sm text-slate-500 italic">No hay opciones disponibles</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { fadeUpVariants } from '../motion';

interface ModuleEmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: ReactNode;
}

export default function ModuleEmptyState({
    icon: Icon,
    title,
    description,
    action,
}: ModuleEmptyStateProps) {
    return (
        <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="show"
            className="flex w-full flex-col items-center justify-center rounded-[2rem] border border-white/5 bg-white/[0.015] px-6 py-16 text-center"
        >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[1.25rem] border border-white/10 bg-white/5 shadow-inner">
                <Icon className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="mb-2 text-[1.15rem] font-semibold tracking-tight text-white">
                {title}
            </h3>
            <p className="max-w-md text-[0.95rem] leading-relaxed text-slate-400">
                {description}
            </p>
            {action ? <div className="mt-6">{action}</div> : null}
        </motion.div>
    );
}
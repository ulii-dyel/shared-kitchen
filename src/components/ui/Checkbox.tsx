'use client';

import { Check } from 'lucide-react';

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function Checkbox({
    checked,
    onChange,
    label,
    className = '',
    size = 'md'
}: CheckboxProps) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-7 h-7',
    };

    const iconSizes = {
        sm: 12,
        md: 14,
        lg: 18,
    };

    return (
        <label className={`inline-flex items-center gap-3 cursor-pointer group ${className}`}>
            <div
                className={`
          ${sizes[size]}
          flex items-center justify-center
          rounded-md border-2 transition-all duration-150
          ${checked
                        ? 'bg-[var(--primary)] border-[var(--primary)]'
                        : 'bg-transparent border-[var(--text-muted)] group-hover:border-[var(--primary)]'
                    }
        `}
                onClick={() => onChange(!checked)}
            >
                {checked && (
                    <Check size={iconSizes[size]} className="text-white" strokeWidth={3} />
                )}
            </div>
            {label && (
                <span className={`
          text-[var(--text-primary)] transition-all duration-150
          ${checked ? 'line-through text-[var(--text-muted)]' : ''}
        `}>
                    {label}
                </span>
            )}
        </label>
    );
}

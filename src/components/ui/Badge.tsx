'use client';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'specific' | 'global' | 'success' | 'warning';
    className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
    const variants = {
        default: 'badge',
        specific: 'badge-specific',
        global: 'badge-global',
        success: 'bg-green-500/15 text-green-400',
        warning: 'bg-yellow-500/15 text-yellow-400',
    };

    return (
        <span className={`badge ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}

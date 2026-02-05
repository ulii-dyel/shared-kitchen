'use client';

import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({
    children,
    className = '',
    onClick,
    hoverable = true,
    padding = 'md'
}: CardProps) {
    const paddingStyles = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    };

    return (
        <div
            className={`
        card
        ${paddingStyles[padding]}
        ${hoverable ? 'cursor-pointer' : ''}
        ${!hoverable ? 'hover:bg-[var(--bg-card)] hover:border-[var(--border-color)] hover:shadow-none' : ''}
        ${className}
      `}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

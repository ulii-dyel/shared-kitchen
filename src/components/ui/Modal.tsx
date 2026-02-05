'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showClose?: boolean;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showClose = true
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw] h-[90vh]',
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                ref={modalRef}
                className={`
          relative w-full ${sizes[size]}
          bg-[var(--bg-card)] border border-[var(--border-color)]
          rounded-2xl shadow-2xl
          animate-slide-up
          ${size === 'full' ? 'flex flex-col' : ''}
        `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {(title || showClose) && (
                    <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                        {title && (
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                {title}
                            </h2>
                        )}
                        {showClose && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="ml-auto -mr-2"
                            >
                                <X size={20} />
                            </Button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className={`${size === 'full' ? 'flex-1 overflow-auto' : ''} p-4`}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}

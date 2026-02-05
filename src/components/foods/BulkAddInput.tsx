'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

interface BulkAddInputProps {
    onParse: (foodNames: string[]) => void;
    isLoading?: boolean;
}

export default function BulkAddInput({ onParse, isLoading }: BulkAddInputProps) {
    const [input, setInput] = useState('');

    const handleParse = () => {
        if (!input.trim()) return;

        // Split by newlines or commas
        const names = input
            .split(/[\n,]/)
            .map(s => s.trim())
            .filter(s => s.length > 0);

        if (names.length > 0) {
            onParse(names);
            setInput('');
        }
    };

    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-[var(--primary)] font-medium">
                <Sparkles size={18} />
                <h3>Quick Add</h3>
            </div>

            <p className="text-sm text-[var(--text-secondary)]">
                Paste a list of meals separated by commas or new lines.
            </p>

            <textarea
                className="w-full h-24 bg-[var(--bg-darker)] border border-[var(--border-color)] rounded-lg p-3 text-sm focus:outline-none focus:border-[var(--primary)] resize-none"
                placeholder="e.g. Spaghetti Carbonara, Greek Salad, Beef Tacos..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                        handleParse();
                    }
                }}
            />

            <div className="flex justify-end">
                <Button
                    onClick={handleParse}
                    disabled={!input.trim()}
                    isLoading={isLoading}
                    size="sm"
                >
                    Add {input.split(/[\n,]/).filter(s => s.trim()).length > 0 ? `${input.split(/[\n,]/).filter(s => s.trim()).length} Foods` : ''}
                    <ArrowRight size={16} className="ml-2" />
                </Button>
            </div>
        </div>
    );
}

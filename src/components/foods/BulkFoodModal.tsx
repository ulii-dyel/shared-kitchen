'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useCalendar } from '@/context/CalendarContext';
import { FoodWithDetails } from '@/types/database';

interface BulkFoodModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BulkFoodModal({ isOpen, onClose }: BulkFoodModalProps) {
    const [text, setText] = useState('');
    const { addFood } = useCalendar();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSave = async () => {
        setIsProcessing(true);
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        for (const line of lines) {
            // Basic parsing: Just the name for now.
            // Future: Parse "Name #tag1 #tag2"
            const newFood: FoodWithDetails = {
                id: '', // Context handles ID generation usually or API return
                household_id: 'h1', // Context handles
                name: line,
                recipe_markdown: '',
                image_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                tags: [],
                ingredients: [],
                favorites: []
            };

            // We call addFood sequentially. 
            // Optimally we'd have a bulkInsert endpoint, but this works for MVP.
            await addFood(newFood);
        }

        setText('');
        setIsProcessing(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Bulk Add Foods">
            <div className="space-y-4">
                <p className="text-sm text-[var(--text-secondary)]">
                    Enter one food name per line. They will be added to your library instantly.
                </p>
                <textarea
                    className="w-full h-64 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] resize-none"
                    placeholder="Spaghetti Bolognese&#10;Grilled Chicken Salad&#10;Tacos"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isProcessing}
                />

                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} disabled={isProcessing}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isProcessing || !text.trim()}>
                        {isProcessing ? 'Adding...' : `Add ${text.split('\n').filter(l => l.trim()).length} Foods`}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

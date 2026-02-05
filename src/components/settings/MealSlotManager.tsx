'use client';

import { useState } from 'react';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useCalendar } from '@/context/CalendarContext';

interface MealSlotManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MealSlotManager({ isOpen, onClose }: MealSlotManagerProps) {
    const { slots, addSlot, removeSlot } = useCalendar();
    const [newSlotName, setNewSlotName] = useState('');

    const handleAdd = () => {
        if (newSlotName.trim()) {
            addSlot(newSlotName.trim());
            setNewSlotName('');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage Meal Slots">
            <div className="space-y-6">
                <div className="space-y-3">
                    {slots.sort((a, b) => a.sort_order - b.sort_order).map((slot) => (
                        <div key={slot.id} className="flex items-center gap-3 p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg group animate-fade-in-up">
                            <GripVertical size={16} className="text-[var(--text-muted)] cursor-grab" />
                            <span className="flex-1 font-medium text-[var(--text-primary)]">{slot.name}</span>
                            <button
                                onClick={() => removeSlot(slot.id)}
                                className="p-2 text-[var(--text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete slot"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    {slots.length === 0 && (
                        <p className="text-center text-[var(--text-muted)] italic py-4">No slots defined</p>
                    )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-[var(--border-color)]">
                    <Input
                        placeholder="New slot name (e.g. Snack)"
                        value={newSlotName}
                        onChange={(e) => setNewSlotName(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <Button onClick={handleAdd}>
                        <Plus size={16} className="mr-2" />
                        Add
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

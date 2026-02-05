import { useDroppable } from '@dnd-kit/core';
import { CalendarEntryWithFood, MealSlot } from '@/types/database';
import DraggableFood from './DraggableFood';
import { X, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface MealSlotProps {
    slot: MealSlot;
    date: Date;
    entries: CalendarEntryWithFood[];
    onRemoveEntry: (entryId: string) => void;
}

export default function DroppableMealSlot({ slot, date, entries, onRemoveEntry }: MealSlotProps) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const slotId = `slot-${dateStr}-${slot.id}`;

    const { setNodeRef, isOver } = useDroppable({
        id: slotId,
        data: {
            type: 'slot',
            slotId: slot.id,
            date: dateStr,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={`
        relative min-h-[120px] p-2 rounded-xl transition-all duration-200 flex flex-col
        ${isOver ? 'bg-[var(--primary-light)] border-2 border-[var(--primary)]' : 'bg-[var(--bg-card)] border border-[var(--border-color)]'}
        ${entries.length === 0 && !isOver ? 'hover:border-[var(--border-glow)]' : ''}
      `}
        >
            {/* Slot Header */}
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase font-bold text-[var(--text-muted)] tracking-wider">
                    {slot.name}
                </span>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col gap-2">
                {entries.length > 0 ? (
                    entries.map(entry => (
                        <div key={entry.id} className="relative group">
                            {entry.food ? (
                                <DraggableFood
                                    food={entry.food}
                                    id={`entry-${entry.id}`}
                                    entry={entry}
                                />
                            ) : (
                                <div className="p-3 bg-[var(--bg-darker)] rounded-lg text-sm italic text-[var(--text-muted)] border border-dashed border-[var(--border-color)]">
                                    Leftovers
                                </div>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveEntry(entry.id);
                                }}
                                className="absolute -top-2 -right-2 p-1 bg-[var(--bg-dark)] border border-[var(--border-color)] rounded-full text-[var(--text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className={`
                        flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] opacity-20 transition-opacity
                        ${isOver ? 'opacity-50' : ''}
                    `}>
                        <Plus size={24} />
                    </div>
                )}
            </div>
        </div>
    );
}

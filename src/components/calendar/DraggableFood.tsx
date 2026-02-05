'use client';

import { useDraggable } from '@dnd-kit/core';
import FoodCard from '@/components/foods/FoodCard';
import { FoodWithDetails, CalendarEntryWithFood } from '@/types/database';

interface DraggableFoodProps {
    food: FoodWithDetails;
    id: string; // Unique ID for dnd context
    entry?: CalendarEntryWithFood; // Optional: if this is an existing calendar entry
    onClick?: () => void;
    onFavoriteToggle?: () => void;
}

export default function DraggableFood({ food, id, entry, onClick, onFavoriteToggle }: DraggableFoodProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: {
            type: 'food',
            food: food,
            entry: entry, // Pass entry if it exists
        },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
            <FoodCard
                food={food}
                isDragging={isDragging}
                onClick={onClick}
                onFavoriteToggle={onFavoriteToggle}
                compact
            />
        </div>
    );
}

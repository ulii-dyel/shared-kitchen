'use client';

import { useRef } from 'react';
import { Heart, MoreHorizontal } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { FoodWithDetails } from '@/types/database';
import { useUser } from '@/context/UserContext';

interface FoodCardProps {
    food: FoodWithDetails;
    isDragging?: boolean;
    onClick?: () => void;
    onFavoriteToggle?: () => void;
    compact?: boolean;
}

export default function FoodCard({
    food,
    isDragging,
    onClick,
    onFavoriteToggle,
    compact = false
}: FoodCardProps) {
    const { currentUser, partner } = useUser();

    // Determine favorite state
    const isMyFav = food.favorites?.some(f => f.user_id === currentUser?.id);
    const isPartnerFav = food.favorites?.some(f => f.user_id === partner?.id);
    const isMutual = isMyFav && isPartnerFav;

    const favColor = isMutual ? 'text-purple-500 fill-purple-500' :
        isMyFav ? `text-[${currentUser?.color}] fill-[${currentUser?.color}]` :
            isPartnerFav ? `text-[${partner?.color}] fill-[${partner?.color}]` :
                'text-[var(--text-muted)] group-hover:text-[var(--primary)]';

    // Inline style for dynamic colors if using hex
    const heartStyle = isMutual ? { color: '#a855f7', fill: '#a855f7' } :
        isMyFav && currentUser ? { color: currentUser.color, fill: currentUser.color } :
            isPartnerFav && partner ? { color: partner.color, fill: partner.color } : undefined;

    return (
        <Card
            onClick={onClick}
            className={`
        relative group transition-all duration-200
        ${isDragging ? 'rotate-2 scale-105 shadow-xl ring-2 ring-[var(--primary)] z-50 cursor-grabbing' : 'cursor-grab active:cursor-grabbing'}
        ${compact ? 'p-2' : 'p-3'}
        hover:border-[var(--border-glow)]
      `}
            padding="none"
        >
            <div className="flex flex-col gap-2">
                {/* Header: Name and Actions */}
                <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-medium text-[var(--text-primary)] leading-tight ${compact ? 'text-xs' : 'text-sm'}`}>
                        {food.name}
                    </h3>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onFavoriteToggle?.();
                        }}
                        className={`
              opacity-0 group-hover:opacity-100 transition-opacity
              ${isMyFav || isPartnerFav ? 'opacity-100' : ''}
            `}
                    >
                        <Heart
                            size={14}
                            style={heartStyle}
                            className={!heartStyle ? 'text-[var(--text-muted)] hover:text-[var(--primary)]' : ''}
                        />
                    </button>
                </div>

                {/* Tags - Only show in non-compact mode */}
                {!compact && food.tags && food.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {food.tags.slice(0, 3).map(tag => (
                            <Badge
                                key={tag.id}
                                variant={tag.type === 'specific' ? 'specific' : 'global'}
                                className="text-[10px] px-1.5 py-0.5 h-5"
                            >
                                {tag.name}
                            </Badge>
                        ))}
                        {food.tags.length > 3 && (
                            <span className="text-[10px] text-[var(--text-muted)] flex items-center">
                                +{food.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Footer info (optional for future: cook time, calories, etc) */}
            </div>
        </Card>
    );
}

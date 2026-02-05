'use client';

import { useState, useMemo } from 'react';
import { ShoppingCart, CalendarRange } from 'lucide-react';
import { useCalendar } from '@/context/CalendarContext';
import { aggregateIngredients } from '@/lib/shopping-utils';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import { startOfWeek, endOfWeek, addWeeks, isWithinInterval, parseISO, format } from 'date-fns';

export default function ShoppingPage() {
    const { entries } = useCalendar();
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [rangeType, setRangeType] = useState<'current' | 'next'>('current');

    // Date Range Logic
    const dateRange = useMemo(() => {
        const today = new Date();
        const start = startOfWeek(rangeType === 'next' ? addWeeks(today, 1) : today, { weekStartsOn: 1 }); // Monday start
        const end = endOfWeek(rangeType === 'next' ? addWeeks(today, 1) : today, { weekStartsOn: 1 });
        return { start, end };
    }, [rangeType]);

    const shoppingList = useMemo(() => {
        const filteredEntries = entries.filter(e => {
            if (!e.date) return false;
            try {
                return isWithinInterval(parseISO(e.date), {
                    start: dateRange.start,
                    end: dateRange.end
                });
            } catch (err) {
                return false;
            }
        });
        return aggregateIngredients(filteredEntries);
    }, [entries, dateRange]);

    const toggleCheck = (id: string) => {
        setCheckedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const clearChecked = () => {
        setCheckedItems({});
    };

    const sortedList = [...shoppingList].sort((a, b) => {
        // Sort checked items to bottom
        const aChecked = checkedItems[a.id] || false;
        const bChecked = checkedItems[b.id] || false;
        if (aChecked === bChecked) return a.name.localeCompare(b.name);
        return aChecked ? 1 : -1;
    });

    const progress = shoppingList.length > 0
        ? Math.round((Object.values(checkedItems).filter(Boolean).length / shoppingList.length) * 100)
        : 0;

    return (
        <div className="container py-6 space-y-6 max-w-md mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-display flex items-center gap-2">
                    <ShoppingCart className="text-[var(--primary)]" />
                    Shopping List
                </h1>
                {Object.keys(checkedItems).length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearChecked}>
                        Reset
                    </Button>
                )}
            </div>

            {/* Date Range Selector */}
            <div className="bg-[var(--bg-card)] p-1 rounded-lg flex border border-[var(--border-color)]">
                <button
                    onClick={() => setRangeType('current')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${rangeType === 'current' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                >
                    This Week <br />
                    <span className="text-[10px] opacity-80">{format(dateRange.start, 'MMM d')} - {format(dateRange.end, 'MMM d')}</span>
                </button>
                <button
                    onClick={() => setRangeType('next')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${rangeType === 'next' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                >
                    Next Week <br />
                    <span className="text-[10px] opacity-80">{format(addWeeks(dateRange.start, 7), 'MMM d')} - {format(addWeeks(dateRange.end, 7), 'MMM d')}</span>
                </button>
            </div>

            {/* Progress Bar */}
            {shoppingList.length > 0 && (
                <div className="w-full bg-[var(--bg-darker)] h-2 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--primary)] transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* List */}
            <div className="space-y-3 bg-[var(--bg-card)] rounded-xl p-4 shadow-sm border border-[var(--border-color)] min-h-[300px]">
                {sortedList.length > 0 ? (
                    sortedList.map((item) => (
                        <div
                            key={item.id}
                            className={`
                flex items-center justify-between p-3 rounded-lg transition-colors border-b border-[var(--border-color)] last:border-0
                ${checkedItems[item.id] ? 'bg-[var(--bg-darker)]/50 opacity-60' : 'hover:bg-[var(--bg-darker)]/30'}
              `}
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <Checkbox
                                    checked={checkedItems[item.id] || false}
                                    onChange={() => toggleCheck(item.id)}
                                    size="lg"
                                    className="shopping-list-item"
                                />
                                <div className="flex flex-col">
                                    <span className={`font-medium ${checkedItems[item.id] ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                                        {item.name}
                                    </span>
                                    <span className="text-sm text-[var(--text-secondary)]">
                                        {item.quantity} {item.unit}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-[var(--text-muted)] flex flex-col items-center">
                        <CalendarRange size={48} className="mb-4 opacity-20" />
                        <p className="mb-2 font-medium">No items needed</p>
                        <p className="text-sm max-w-[200px]">
                            No meals scheduled for {rangeType === 'current' ? 'this' : 'next'} week yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

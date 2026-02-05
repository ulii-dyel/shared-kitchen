'use client';

import { useState } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isToday, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Copy, Settings } from 'lucide-react';
import Button from '@/components/ui/Button';
import DroppableMealSlot from './DroppableMealSlot';
import { MealSlot } from '@/types/database';
import { useCalendar } from '@/context/CalendarContext';
import DefrostAlert from '@/components/dashboard/DefrostAlert';
import MealSlotManager from '@/components/settings/MealSlotManager';


export default function WeekView() {
    const { entries, removeEntry, slots, copyWeek } = useCalendar();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });

    const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    const handlePrevWeek = () => setCurrentDate(prev => addDays(prev, -7));
    const handleNextWeek = () => setCurrentDate(prev => addDays(prev, 7));
    const handleToday = () => setCurrentDate(new Date());

    const handleCopyPreviousWeek = () => {
        if (confirm('Copy meal plan from the previous week to this week?')) {
            copyWeek(addDays(startDate, -7), startDate);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-dark)]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-card)] sticky top-0 z-10 glass">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold font-display text-[var(--text-primary)]">
                        {format(startDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex bg-[var(--bg-darker)] rounded-lg p-1 border border-[var(--border-color)]">
                        <button onClick={handlePrevWeek} className="p-1 hover:text-[var(--primary)] rounded transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={handleToday} className="px-3 text-sm font-medium hover:text-[var(--primary)] transition-colors">
                            Today
                        </button>
                        <button onClick={handleNextWeek} className="p-1 hover:text-[var(--primary)] rounded transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(true)}>
                        <Settings size={16} className="mr-2" />
                        Manage Slots
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleCopyPreviousWeek}>
                        <Copy size={16} className="mr-2" />
                        Copy Prev Week
                    </Button>
                </div>
            </div>

            <MealSlotManager isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            {/* Week Grid */}
            <div className="flex-1 overflow-auto custom-scrollbar p-4">
                <DefrostAlert />

                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 min-w-[300px] md:min-w-0">
                    {days.map((day) => {
                        const isCurrentDay = isToday(day);
                        const dateStr = format(day, 'yyyy-MM-dd'); // Matches mock data format in context? ISO string usually ok but need to be consistent. Context uses ISO string split logic or explicit date.

                        return (
                            <div
                                key={day.toISOString()}
                                className={`
                  flex flex-col gap-3 min-w-[200px] md:min-w-0
                  ${isCurrentDay ? 'bg-[var(--bg-card)]/50 rounded-xl p-2 -m-2' : ''}
                `}
                            >
                                {/* Day Header */}
                                <div className={`text-center pb-2 border-b ${isCurrentDay ? 'border-[var(--primary)]' : 'border-[var(--border-color)]'}`}>
                                    <p className={`text-xs font-medium uppercase tracking-wider ${isCurrentDay ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}>
                                        {format(day, 'EEE')}
                                    </p>
                                    <p className={`text-lg font-bold ${isCurrentDay ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
                                        {format(day, 'd')}
                                    </p>
                                </div>

                                {/* Slots */}
                                <div className="space-y-3 flex-1">
                                    {slots.filter(s => s.is_visible).sort((a, b) => a.sort_order - b.sort_order).map((slot) => {
                                        // Find entries for this slot and day
                                        const slotEntries = entries.filter(e =>
                                            e.meal_slot_id === slot.id &&
                                            (e.date === dateStr || e.date.startsWith(dateStr))
                                        );

                                        return (
                                            <DroppableMealSlot
                                                key={slot.id}
                                                slot={slot}
                                                date={day}
                                                entries={slotEntries}
                                                onRemoveEntry={(id) => removeEntry(id)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

'use client';

import { useMemo } from 'react';
import { ThermometerSnowflake } from 'lucide-react';
import { useCalendar } from '@/context/CalendarContext';
import { addDays, startOfToday, format } from 'date-fns';

export default function DefrostAlert({ className }: { className?: string }) {
    const { entries } = useCalendar();

    const defrostItems = useMemo(() => {
        const tomorrow = addDays(startOfToday(), 1);
        const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

        return entries.filter(entry => {
            // Check if entry is for tomorrow
            if (entry.date !== tomorrowStr) return false;

            // Check tags (mock logic: implicit meat/fish or explicit 'frozen' tag)
            // Real app would check a consistent boolean or tag system
            const tags = entry.food?.tags || [];
            const isMeatOrFish = entry.food?.name.toLowerCase().includes('chicken') ||
                entry.food?.name.toLowerCase().includes('beef') ||
                entry.food?.name.toLowerCase().includes('fish') ||
                entry.food?.name.toLowerCase().includes('salmon');

            const hasFrozenTag = tags.some(t =>
                t.name.toLowerCase() === 'frozen' ||
                t.name.toLowerCase() === 'meat' ||
                t.name.toLowerCase() === 'fish'
            );

            return isMeatOrFish || hasFrozenTag;
        });
    }, [entries]);

    if (defrostItems.length === 0) return null;

    return (
        <div className={`mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3 animate-fade-in ${className}`}>
            <div className="p-2 bg-blue-500/20 rounded-full text-blue-400 shrink-0">
                <ThermometerSnowflake size={20} />
            </div>
            <div>
                <h3 className="font-semibold text-blue-100 text-sm">Defrost Reminder</h3>
                <p className="text-xs text-blue-200/80 mt-1">
                    For tomorrow ({format(addDays(startOfToday(), 1), 'EEE, MMM d')}):{' '}
                    <span className="font-medium text-white">
                        {defrostItems.map(e => e.food?.name).join(', ')}
                    </span>
                </p>
            </div>
        </div>
    );
}

'use client';

import WeekView from '@/components/calendar/WeekView';

export default function Home() {
  return (
    <div className="h-full flex flex-col">
      <WeekView />
    </div>
  );
}

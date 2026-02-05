'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

interface AppShellProps {
    children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
    return (
        <div className="flex min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)]">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 relative overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar h-full">
                    {children}
                </div>
            </main>

            {/* Mobile Navigation */}
            <MobileNav />
        </div>
    );
}

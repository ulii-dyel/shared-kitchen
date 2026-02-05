'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, ShoppingCart, Utensils, User } from 'lucide-react';

export default function MobileNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Plan', icon: Calendar },
        { href: '/foods', label: 'Foods', icon: Utensils },
        { href: '/shopping', label: 'Shop', icon: ShoppingCart },
        { href: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[var(--z-sticky)] bg-[var(--bg-card)] border-t border-[var(--border-color)] md:hidden safe-area-bottom">
            <div className="flex items-center justify-around h-16">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`
                flex flex-col items-center justify-center w-full h-full space-y-1
                transition-colors duration-200
                ${isActive
                                    ? 'text-[var(--primary)]'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }
              `}
                        >
                            <Icon
                                size={20}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={isActive ? 'animate-pulse' : ''}
                            />
                            <span className="text-[10px] font-medium">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

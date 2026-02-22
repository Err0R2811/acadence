'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavTab } from '@/types';

interface NavItem {
    tab: NavTab;
    label: string;
    href: string;
    icon: (active: boolean) => React.ReactNode;
}

const navItems: NavItem[] = [
    {
        tab: 'home',
        label: 'Home',
        href: '/home',
        icon: (active) => (
            <svg width="22" height="22" viewBox="0 0 24 24"
                fill={active ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
    },
    {
        tab: 'timetable',
        label: 'Timetable',
        href: '/timetable',
        icon: (active) => (
            <svg width="22" height="22" viewBox="0 0 24 24"
                fill={active ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
    },
    {
        tab: 'history',
        label: 'History',
        href: '/history',
        icon: (active) => (
            <svg width="22" height="22" viewBox="0 0 24 24"
                fill={active ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
    },
    {
        tab: 'settings',
        label: 'Settings',
        href: '/settings',
        icon: (active) => (
            <svg width="22" height="22" viewBox="0 0 24 24"
                fill={active ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        ),
    },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{
                background: 'rgba(11, 31, 47, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: '1px solid var(--border-color)',
            }}
        >
            <div className="max-w-lg mx-auto flex items-center justify-around py-2 pb-[env(safe-area-inset-bottom,8px)]">
                {navItems.map(({ tab, label, href, icon }) => {
                    const isActive =
                        pathname === href || (tab === 'home' && pathname === '/');

                    return (
                        <Link
                            key={tab}
                            href={href}
                            className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200"
                            style={{
                                color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                                background: isActive
                                    ? 'var(--gold-5)'
                                    : 'transparent',
                            }}
                        >
                            {icon(isActive)}
                            <span
                                className="text-[10px] font-medium"
                                style={{
                                    color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                                }}
                            >
                                {label}
                            </span>
                            {isActive && (
                                <span
                                    className="w-1 h-1 rounded-full mt-0.5"
                                    style={{ background: 'var(--gold)' }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

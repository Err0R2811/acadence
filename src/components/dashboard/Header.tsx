'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAttendanceStore } from '@/stores/attendance-store';
import { DIVISIONS } from '@/lib/divisions';
import { STRATEGY_MODES } from '@/types';

/** Inline SVG monogram — simplified bold A in gold */
function AcadenceMonogram({ size = 28 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#0B1F2F" />
            <path
                d="M32 12L18 52H24L27 44H37L40 52H46L32 12ZM29 38L32 28L35 38H29Z"
                fill="#C6A84A"
                stroke="#C6A84A"
                strokeWidth="1"
            />
            {/* Left bar */}
            <rect x="14" y="16" width="3" height="32" rx="1.5" fill="#C6A84A" opacity="0.7" />
            {/* Right bar */}
            <rect x="47" y="16" width="3" height="32" rx="1.5" fill="#C6A84A" opacity="0.7" />
        </svg>
    );
}

export default function Header() {
    const { division, setDivision, target, strategyMode } = useAttendanceStore();
    const modeInfo = STRATEGY_MODES.find((m) => m.id === strategyMode)!;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className="px-5 pt-12 pb-4 transition-all duration-300"
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 40,
                background: scrolled
                    ? 'rgba(11, 31, 47, 0.95)'
                    : 'transparent',
                backdropFilter: scrolled ? 'blur(16px)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
                borderBottom: scrolled ? '1px solid var(--border-color)' : 'none',
            }}
        >
            {/* Top Row — Logo */}
            <div className="flex items-center justify-center mb-1">
                <div
                    className="flex items-center transition-all duration-300 group cursor-default"
                    style={{ gap: scrolled ? '0px' : '20px' }}
                >
                    {/* Monogram */}
                    <div
                        className="transition-all duration-300"
                        style={{
                            borderRadius: 'var(--radius)',
                        }}
                    >
                        <AcadenceMonogram size={scrolled ? 24 : 28} />
                    </div>

                    {/* Wordmark — hidden on scroll */}
                    <div
                        className="transition-all duration-300 overflow-hidden"
                        style={{
                            maxWidth: scrolled ? '0px' : '200px',
                            opacity: scrolled ? 0 : 1,
                        }}
                    >
                        <h1
                            className="text-xl font-bold whitespace-nowrap"
                            style={{
                                color: 'var(--gold)',
                                letterSpacing: '2.4px',
                                fontWeight: 800,
                            }}
                        >
                            ACADENCE
                        </h1>
                        <p
                            className="text-[9px] mt-0.5 uppercase tracking-widest whitespace-nowrap"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Academic Strategy Engine
                        </p>
                    </div>
                </div>
            </div>

            {/* Division, Target & Mode Row */}
            <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                {/* Division Dropdown */}
                <div className="relative">
                    <select
                        value={division}
                        onChange={(e) => setDivision(e.target.value)}
                        className="appearance-none pl-3.5 pr-8 py-2 rounded-xl text-sm font-medium cursor-pointer outline-none transition-all duration-200"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                        }}
                    >
                        {DIVISIONS.map((d) => (
                            <option key={d} value={d}>
                                Division {d}
                            </option>
                        ))}
                    </select>
                    <svg
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>

                {/* Target Badge — Gold */}
                <span
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold"
                    style={{
                        background: 'var(--gold-8)',
                        color: 'var(--gold)',
                        border: '1px solid var(--gold-20)',
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    Target: {target}%
                </span>

                {/* Strategy Mode Badge — Gold hierarchy */}
                <span
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide"
                    style={{
                        background: strategyMode === 'hard'
                            ? 'var(--gold-12)'
                            : strategyMode === 'medium'
                                ? 'var(--gold-8)'
                                : 'transparent',
                        color: 'var(--gold)',
                        border: `1px solid var(--gold-${strategyMode === 'easy' ? '20' : '40'})`,
                    }}
                >
                    {modeInfo.emoji} {modeInfo.label}
                </span>
            </div>
        </header>
    );
}

'use client';

import { useMemo } from 'react';
import { useAttendanceStore } from '@/stores/attendance-store';
import { generateGlobalPlan } from '@/lib/attendance-strategy';
import { STRATEGY_MODES } from '@/types';
import type { StrategyMode } from '@/types';

const MODE_MESSAGES: Record<StrategyMode, { speed: string }> = {
    easy: { speed: 'Relaxed' },
    medium: { speed: 'Balanced' },
    hard: { speed: 'Maximum' },
};

function ProgressRing({
    percentage,
    color,
    size = 80,
    strokeWidth = 6,
    label,
    useGoldGlow,
}: {
    percentage: number;
    color: string;
    size?: number;
    strokeWidth?: number;
    label: string;
    useGoldGlow?: boolean;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const clamped = Math.min(Math.max(percentage, 0), 100);
    const offset = circumference - (clamped / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-1">
            <div
                className="relative flex items-center justify-center rounded-full"
                style={{
                    background: useGoldGlow ? 'radial-gradient(circle at center, rgba(198,168,74,0.15), transparent 70%)' : 'none',
                    width: size,
                    height: size
                }}
            >
                <svg width={size} height={size} className="transform -rotate-90 absolute top-0 left-0">
                    <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(198,168,74,0.08)" strokeWidth={strokeWidth} fill="none" />
                    <circle cx={size / 2} cy={size / 2} r={radius} stroke={useGoldGlow ? "url(#goldGradient)" : color} strokeWidth={strokeWidth} fill="none"
                        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 0.8s ease-out', filter: useGoldGlow ? 'drop-shadow(0 0 8px rgba(198,168,74,0.35))' : 'none' }} />
                </svg>
                <svg width="0" height="0" className="absolute">
                    <defs>
                        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#C6A84A" />
                            <stop offset="100%" stopColor="#E0C36E" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="flex flex-col items-center justify-center z-10" style={{ width: size, height: size }}>
                    <span className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{Math.round(clamped)}%</span>
                </div>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
        </div>
    );
}

export default function StrategyPanel() {
    const division = useAttendanceStore((s) => s.division);
    const target = useAttendanceStore((s) => s.target);
    const mode = useAttendanceStore((s) => s.strategyMode);
    const setMode = useAttendanceStore((s) => s.setStrategyMode);
    const conductedStr = useAttendanceStore((s) => s.conducted);
    const attendedStr = useAttendanceStore((s) => s.attended);

    const conducted = parseInt(conductedStr, 10) || 0;
    const attended = parseInt(attendedStr, 10) || 0;

    const plan = useMemo(() => {
        if (conducted === 0) return null;
        return generateGlobalPlan(conducted, attended, target, division, mode);
    }, [conducted, attended, target, division, mode]);

    const modeInfo = STRATEGY_MODES.find((m) => m.id === mode)!;
    const modeMsg = MODE_MESSAGES[mode];
    const summary = plan?.summary;

    return (
        <div
            className="p-4 rounded-2xl"
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                backdropFilter: 'blur(12px)',
            }}
        >
            {/* Header with monogram */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {/* 16px Monogram */}
                    <svg width="16" height="16" viewBox="0 0 64 64" fill="none">
                        <path
                            d="M32 10L16 54H23L27 44H37L40 54H47L32 10ZM29 38L32 26L35 38H29Z"
                            fill="var(--gold)"
                        />
                    </svg>
                    <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Strategy Engine
                    </h3>
                </div>

                {/* Mode Selector */}
                <div
                    className="flex gap-0.5 p-0.5 rounded-lg"
                    style={{
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-color)',
                    }}
                >
                    {STRATEGY_MODES.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setMode(m.id as StrategyMode)}
                            className="text-[10px] px-2 py-1 rounded-md font-bold transition-all duration-200"
                            style={{
                                background: mode === m.id ? 'var(--gold-12)' : 'transparent',
                                color: mode === m.id ? 'var(--gold)' : 'var(--text-muted)',
                                border: mode === m.id ? '1px solid var(--gold-20)' : '1px solid transparent',
                            }}
                        >
                            {m.emoji} {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Gold divider */}
            <div className="gold-divider mb-4" />

            {!plan ? (
                <div className="text-center py-8">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Enter your attendance to see the strategy plan.
                    </p>
                </div>
            ) : (
                <>
                    {/* Academic Requirement — CONSTANT */}
                    <div
                        className="p-3 rounded-xl mb-3"
                        style={{
                            background: 'var(--gold-5)',
                            border: '1px solid var(--gold-12)',
                        }}
                    >
                        <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                            Academic Requirement
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            Required to reach target: <strong style={{ color: 'var(--gold)' }}>
                                {summary!.requiredLectures === Infinity ? '∞' : summary!.requiredLectures}
                            </strong> lectures
                        </p>
                    </div>

                    {/* Strategy Plan — MODE-SPECIFIC */}
                    <div
                        className="p-3 rounded-xl mb-4"
                        style={{
                            background: mode === 'hard' ? 'var(--gold-8)' : 'var(--gold-5)',
                            border: `1px solid var(--gold-${mode === 'easy' ? '12' : '20'})`,
                        }}
                    >
                        <p className="text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--gold)' }}>
                            {modeInfo.emoji} {modeInfo.label} Mode Strategy
                        </p>
                        <div className="space-y-1">
                            <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                                We schedule <strong style={{ color: 'var(--gold)' }}>{summary!.scheduledCount}</strong> lectures
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {mode === 'hard'
                                    ? 'Skipping is not recommended.'
                                    : `You can skip ${summary!.skipCount} lectures.`}
                            </p>
                            {summary!.daysToRecover !== null && summary!.daysToRecover > 0 && (
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    You will reach your target in <strong style={{ color: 'var(--gold-light)' }}>{summary!.daysToRecover} days</strong>.
                                </p>
                            )}
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Intensity:</span>
                                <span className="text-[10px] font-bold" style={{ color: 'var(--gold)' }}>{modeMsg.speed}</span>
                            </div>
                        </div>
                    </div>

                    {/* Visual Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="relative flex justify-center">
                            <ProgressRing
                                percentage={summary!.currentPercentage}
                                color={summary!.currentPercentage >= target ? 'var(--gold)' : 'var(--text-muted)'}
                                label="Current"
                            />
                        </div>
                        <div className="relative flex justify-center">
                            <ProgressRing
                                percentage={summary!.projectedPercentage}
                                color="#C6A84A"
                                label="Projected"
                                useGoldGlow={true}
                            />
                        </div>
                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className="p-2.5 rounded-lg text-center w-full" style={{ background: 'var(--bg-input)' }}>
                                <p className="text-lg font-bold" style={{ color: 'var(--gold)' }}>
                                    {summary!.daysToRecover !== null ? summary!.daysToRecover : '—'}
                                </p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {summary!.daysToRecover !== null ? 'Days' : 'No slots'}
                                </p>
                                <p className="text-[7px] mt-1.5 opacity-60 italic whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                                    Based on actual timetable capacity
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-2">
                        <div className="p-2 rounded-lg text-center" style={{ background: 'var(--gold-5)' }}>
                            <div className="text-sm font-black" style={{ color: 'var(--gold)' }}>
                                {summary!.requiredLectures === Infinity ? '∞' : summary!.requiredLectures}
                            </div>
                            <div className="text-[8px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Required</div>
                        </div>
                        <div className="p-2 rounded-lg text-center" style={{ background: 'var(--gold-5)' }}>
                            <div className="text-sm font-black" style={{ color: 'var(--gold)' }}>{summary!.scheduledCount}</div>
                            <div className="text-[8px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Scheduled</div>
                        </div>
                        <div className="p-2 rounded-lg text-center" style={{ background: 'var(--gold-5)' }}>
                            <div className="text-sm font-black" style={{ color: 'var(--gold-light)' }}>{summary!.skipCount}</div>
                            <div className="text-[8px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Skippable</div>
                        </div>
                        <div className="p-2 rounded-lg text-center" style={{ background: 'var(--gold-5)' }}>
                            <div className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{summary!.safeSkipAllowance}</div>
                            <div className="text-[8px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Safe Skip</div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

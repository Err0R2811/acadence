'use client';

import { useMemo } from 'react';
import { useAttendanceStore } from '@/stores/attendance-store';
import { generateGlobalPlan, calculateModeStats, computeRequiredLectures, computeSkipAllowance, getFutureSlots } from '@/lib/attendance-strategy';
import { STRATEGY_MODES } from '@/types';
import type { StrategyMode } from '@/types';

const SPEED_LABELS: Record<StrategyMode, { emoji: string; label: string }> = {
    easy: { emoji: '🧘', label: 'Slow & Relaxed' },
    medium: { emoji: '⚡', label: 'Balanced' },
    hard: { emoji: '🚀', label: 'Fastest' },
};

export default function ModeComparison() {
    const conductedStr = useAttendanceStore((s) => s.conducted);
    const attendedStr = useAttendanceStore((s) => s.attended);
    const noAttendanceStr = useAttendanceStore((s) => s.noAttendance);
    const target = useAttendanceStore((s) => s.target);
    const division = useAttendanceStore((s) => s.division);
    const mode = useAttendanceStore((s) => s.strategyMode);
    const setMode = useAttendanceStore((s) => s.setStrategyMode);

    const conducted = parseInt(conductedStr, 10) || 0;
    const attended = parseInt(attendedStr, 10) || 0;
    const noAttendance = parseInt(noAttendanceStr, 10) || 0;

    const comparison = useMemo(() => {
        if (conducted === 0) return null;

        const effectiveConducted = conducted - noAttendance;
        const required = computeRequiredLectures(attended, effectiveConducted, target);
        const availableSlots = getFutureSlots(division);
        const totalSlots = availableSlots.length;

        return (['easy', 'medium', 'hard'] as StrategyMode[]).map((m) => {
            const stats = calculateModeStats(m, required, availableSlots, attended, effectiveConducted, division);
            return {
                mode: m,
                required,
                scheduled: stats.scheduledCount,
                skip: stats.skipCount,
                days: stats.daysToRecover,
                finalPct: stats.projectedPercentage,
                actualAttend: stats.actualAttend,
                speed: SPEED_LABELS[m],
                modeInfo: STRATEGY_MODES.find((s) => s.id === m)!,
                totalSlots,
            };
        });
    }, [conducted, attended, noAttendance, target, division]);

    if (!comparison) return null;

    // Constant across all modes
    const requiredLectures = comparison[0].required;
    const totalSlots = comparison[0].totalSlots;

    // Edge case: target already achieved
    const targetAchieved = requiredLectures === 0;
    // Edge case: not enough future slots
    const notEnoughSlots = requiredLectures > 0 && totalSlots < requiredLectures;

    return (
        <div
            className="p-4 rounded-2xl"
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
            }}
        >
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    📊 Mode Comparison
                </h3>
                <span className="text-[10px] font-bold" style={{ color: 'var(--gold)' }}>
                    Required: {requiredLectures === Infinity ? '∞' : requiredLectures}
                </span>
            </div>

            {/* Safety Messages */}
            {targetAchieved && (
                <div
                    className="p-3 rounded-xl mb-3 text-center"
                    style={{
                        background: 'var(--gold-5)',
                        border: '1px solid var(--gold-12)',
                    }}
                >
                    <p className="text-sm font-bold" style={{ color: 'var(--gold)' }}>
                        ✓ Target already achieved
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Your attendance is at or above {target}%
                    </p>
                </div>
            )}

            {notEnoughSlots && (
                <div
                    className="p-3 rounded-xl mb-3 text-center"
                    style={{
                        background: 'rgba(220, 80, 60, 0.08)',
                        border: '1px solid rgba(220, 80, 60, 0.2)',
                    }}
                >
                    <p className="text-sm font-bold" style={{ color: '#dc503c' }}>
                        ⚠ No room to skip
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Need {requiredLectures} lectures but only {totalSlots} available
                    </p>
                </div>
            )}

            <div
                className="overflow-hidden rounded-xl"
                style={{ border: '1px solid var(--border-color)' }}
            >
                {/* Header */}
                <div
                    className="grid grid-cols-6 text-[9px] font-bold uppercase tracking-wider"
                    style={{
                        background: 'var(--bg-input)',
                        color: 'var(--text-muted)',
                    }}
                >
                    <div className="p-2">Mode</div>
                    <div className="p-2 text-center">Attend</div>
                    <div className="p-2 text-center">Skip</div>
                    <div className="p-2 text-center">Days</div>
                    <div className="p-2 text-center">Final %</div>
                    <div className="p-2 text-center">Speed</div>
                </div>

                {/* Rows */}
                {comparison.map((row) => {
                    const isActive = row.mode === mode;

                    // Skip color logic
                    let skipColor = 'var(--text-muted)';
                    if (row.skip > 0) skipColor = 'var(--gold)';
                    else if (row.skip < 0) skipColor = '#dc503c';

                    return (
                        <div
                            key={row.mode}
                            onClick={() => setMode(row.mode)}
                            className="grid grid-cols-6 text-xs cursor-pointer transition-all duration-300"
                            style={{
                                borderTop: '1px solid var(--border-color)',
                                background: isActive ? 'var(--gold-5)' : 'transparent',
                                borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
                            }}
                        >
                            <div className="p-2.5 flex items-center gap-1.5">
                                <span className="text-sm">{row.modeInfo.emoji}</span>
                                <span
                                    className="font-bold"
                                    style={{ color: isActive ? 'var(--gold)' : 'var(--text-secondary)' }}
                                >
                                    {row.modeInfo.label}
                                </span>
                            </div>
                            <div
                                className="p-2.5 text-center font-bold tabular-nums"
                                style={{ color: 'var(--gold)' }}
                            >
                                {row.scheduled}
                            </div>
                            <div
                                className="p-2.5 text-center font-bold tabular-nums"
                                style={{ color: skipColor }}
                            >
                                {row.skip}
                            </div>
                            <div
                                className="p-2.5 text-center font-bold tabular-nums"
                                style={{ color: 'var(--gold-light)' }}
                            >
                                {row.days !== null ? `${row.days}d` : '—'}
                            </div>
                            <div
                                className="p-2.5 text-center font-bold tabular-nums"
                                style={{ color: 'var(--gold)' }}
                            >
                                {row.finalPct}%
                            </div>
                            <div className="p-2.5 text-center">
                                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                    {row.speed.emoji} {row.speed.label}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <p
                className="text-[9px] mt-2 text-center"
                style={{ color: 'var(--text-muted)' }}
            >
                Click a row to switch mode • Required lectures stay constant
            </p>
        </div>
    );
}

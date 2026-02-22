'use client';

import { useMemo } from 'react';
import { useAttendanceStore } from '@/stores/attendance-store';
import { generateGlobalPlan } from '@/lib/attendance-strategy';
import { STRATEGY_MODES } from '@/types';
import type { StrategyMode } from '@/types';

export default function RecommendationCard() {
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
    const summary = plan?.summary;

    if (!plan || plan.recommendedSlots.length === 0) {
        return (
            <div
                className="p-4 rounded-2xl"
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                }}
            >
                <h3 className="text-sm font-bold tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
                    📋 Recommended Schedule
                </h3>
                <div className="text-center py-6">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {conducted === 0
                            ? 'Enter your attendance to get recommendations.'
                            : 'You\'re on track! No additional lectures needed.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="p-4 rounded-2xl"
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    📋 Recommended Schedule
                </h3>
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
                            }}
                        >
                            {m.emoji}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Strip */}
            {summary && (
                <div className="flex gap-4 mt-2 mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>Required: <strong style={{ color: 'var(--gold)' }}>{summary.requiredLectures}</strong></span>
                    <span>Scheduled: <strong style={{ color: 'var(--gold)' }}>{summary.scheduledCount}</strong></span>
                    <span>Days: <strong style={{ color: 'var(--gold)' }}>
                        {summary.daysToRecover !== null ? `${summary.daysToRecover}d` : '—'}
                    </strong></span>
                </div>
            )}

            {/* Slot Cards */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {plan.recommendedSlots.slice(0, 8).map((slot, i) => (
                    <div
                        key={`${slot.day}-${slot.time}-${i}`}
                        className="flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200"
                        style={{
                            background: i < 3 ? 'var(--gold-5)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${i < 3 ? 'var(--gold-12)' : 'var(--border-color)'}`,
                        }}
                    >
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                            style={{ background: 'var(--gold-12)', color: 'var(--gold)' }}
                        >
                            {slot.index}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                                    {slot.subjectShort}
                                </span>
                                <span
                                    className="text-[8px] font-black px-1 py-0.5 rounded-full"
                                    style={{
                                        background: slot.type === 'Lab' ? 'var(--gold-12)' : 'var(--gold-5)',
                                        color: slot.type === 'Lab' ? 'var(--gold-light)' : 'var(--gold)',
                                    }}
                                >
                                    {slot.type}
                                </span>
                            </div>
                            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                {slot.day} • {slot.time} • {slot.faculty}
                            </div>
                        </div>
                        <div className="text-[9px] font-bold flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{slot.room}</div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            {summary && (
                <div className="flex items-center gap-3 text-[11px] mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <span><strong style={{ color: 'var(--gold)' }}>{modeInfo.label}</strong> mode</span>
                    <span>·</span>
                    <span><strong style={{ color: 'var(--gold)' }}>
                        {summary.daysToRecover !== null ? `${summary.daysToRecover}d plan` : 'Schedule unavailable'}
                    </strong></span>
                </div>
            )}
        </div>
    );
}

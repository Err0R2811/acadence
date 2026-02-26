'use client';

import { useMemo, useState } from 'react';
import { useAttendanceStore } from '@/stores/attendance-store';
import { generateGlobalPlan, computeRequiredLectures } from '@/lib/attendance-strategy';
import { STRATEGY_MODES } from '@/types';

export default function SimulationSlider() {
    const conductedStr = useAttendanceStore((s) => s.conducted);
    const attendedStr = useAttendanceStore((s) => s.attended);
    const noAttendanceStr = useAttendanceStore((s) => s.noAttendance);
    const target = useAttendanceStore((s) => s.target);
    const division = useAttendanceStore((s) => s.division);
    const mode = useAttendanceStore((s) => s.strategyMode);

    const conducted = parseInt(conductedStr, 10) || 0;
    const attended = parseInt(attendedStr, 10) || 0;
    const noAttendance = parseInt(noAttendanceStr, 10) || 0;

    const effectiveConducted = conducted - noAttendance;

    const plan = useMemo(() => {
        if (conducted === 0) return null;
        return generateGlobalPlan(conducted, attended, target, division, mode, noAttendance);
    }, [conducted, attended, noAttendance, target, division, mode]);

    const maxSlots = plan?.recommendedSlots.length ?? 0;
    const totalAvailable = Math.max(maxSlots, computeRequiredLectures(attended, effectiveConducted, target), 50);

    const [simValue, setSimValue] = useState(0);

    const projectedPct = useMemo(() => {
        if (effectiveConducted === 0) return 100;
        return ((attended + simValue) / (effectiveConducted + simValue)) * 100;
    }, [attended, conducted, simValue]);

    const remainingRequired = useMemo(() => {
        const needed = computeRequiredLectures(attended + simValue, conducted + simValue, target);
        return Math.max(needed, 0);
    }, [attended, conducted, simValue, target]);

    const targetAchieved = projectedPct >= target;

    const modeInfo = STRATEGY_MODES.find((m) => m.id === mode)!;

    if (conducted === 0) return null;

    const pctProgress = totalAvailable > 0 ? (simValue / totalAvailable) * 100 : 0;

    return (
        <div className="p-4 rounded-2xl border border-slate-700/50 bg-slate-900/30 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white tracking-tight">🎚️ Attendance Simulator</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${modeInfo.color}15`, color: modeInfo.color }}>
                    {modeInfo.label} Mode
                </span>
            </div>

            {/* Slider */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-slate-400">Simulate attending next <strong className="text-white">{simValue}</strong> lectures</label>
                    <span className="text-xs font-bold" style={{ color: targetAchieved ? '#22c55e' : '#ef4444' }}>
                        {targetAchieved ? '✓ Target Met' : `${remainingRequired} more needed`}
                    </span>
                </div>
                <div className="relative">
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-200"
                            style={{ width: `${pctProgress}%`, background: `linear-gradient(90deg, ${modeInfo.color}, ${modeInfo.color}90)` }}
                        />
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={totalAvailable}
                        value={simValue}
                        onChange={(e) => setSimValue(parseInt(e.target.value, 10))}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                </div>
                <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-slate-600">0</span>
                    <span className="text-[9px] text-slate-600">{totalAvailable}</span>
                </div>
            </div>

            {/* Results Row */}
            <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-800/40 text-center">
                    <div className="text-lg font-black transition-all duration-300" style={{ color: targetAchieved ? '#22c55e' : '#f59e0b' }}>
                        {projectedPct.toFixed(1)}%
                    </div>
                    <div className="text-[8px] font-bold text-slate-500 uppercase">Projected</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 text-center">
                    <div className="text-lg font-black text-white transition-all duration-300">
                        {remainingRequired === Infinity ? '∞' : remainingRequired}
                    </div>
                    <div className="text-[8px] font-bold text-slate-500 uppercase">Still Need</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 text-center">
                    <div className="text-lg font-black text-white">{simValue}</div>
                    <div className="text-[8px] font-bold text-slate-500 uppercase">Simulated</div>
                </div>
            </div>
        </div>
    );
}

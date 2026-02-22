'use client';

import { useMemo, useState } from 'react';
import { useAttendanceStore } from '@/stores/attendance-store';
import { computeRequiredLectures } from '@/lib/attendance-strategy';

export default function SkipImpactCalculator() {
    const conductedStr = useAttendanceStore((s) => s.conducted);
    const attendedStr = useAttendanceStore((s) => s.attended);
    const target = useAttendanceStore((s) => s.target);

    const conducted = parseInt(conductedStr, 10) || 0;
    const attended = parseInt(attendedStr, 10) || 0;

    const [skipCount, setSkipCount] = useState(0);

    const currentPct = conducted > 0 ? (attended / conducted) * 100 : 100;

    const impact = useMemo(() => {
        const newConducted = conducted + skipCount;
        const newPct = newConducted > 0 ? (attended / newConducted) * 100 : 100;
        const currentRequired = computeRequiredLectures(attended, conducted, target);
        const newRequired = computeRequiredLectures(attended, newConducted, target);
        const extraRequired = Math.max(0, (newRequired === Infinity ? 999 : newRequired) - (currentRequired === Infinity ? 999 : currentRequired));
        const isRecoveryDifficult = newRequired > 50 || newRequired === Infinity;

        return { newPct, newRequired, extraRequired, isRecoveryDifficult };
    }, [attended, conducted, target, skipCount]);

    if (conducted === 0) return null;

    const dropPct = currentPct - impact.newPct;

    return (
        <div className="p-4 rounded-2xl border border-slate-700/50 bg-slate-900/30 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-white tracking-tight mb-3">⚠️ Skip Impact Calculator</h3>

            {/* Input */}
            <div className="mb-3">
                <label className="block text-xs text-slate-400 mb-1.5">
                    How many lectures will you skip?
                </label>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSkipCount(Math.max(0, skipCount - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold text-sm flex items-center justify-center hover:bg-slate-700 transition-colors"
                    >−</button>
                    <input
                        type="number"
                        value={skipCount}
                        onChange={(e) => setSkipCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="flex-1 h-8 text-center rounded-lg bg-slate-800/60 border border-slate-700 text-white font-bold text-sm outline-none"
                        min={0}
                        max={200}
                    />
                    <button
                        onClick={() => setSkipCount(skipCount + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold text-sm flex items-center justify-center hover:bg-slate-700 transition-colors"
                    >+</button>
                </div>
            </div>

            {skipCount > 0 && (
                <div className="space-y-2 animate-fade-in-up">
                    {/* Impact Stats */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded-lg bg-slate-800/40 text-center">
                            <div className="text-sm font-black text-red-400">{impact.newPct.toFixed(1)}%</div>
                            <div className="text-[8px] font-bold text-slate-500 uppercase">New Att.</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-800/40 text-center">
                            <div className="text-sm font-black text-amber-400">-{dropPct.toFixed(1)}%</div>
                            <div className="text-[8px] font-bold text-slate-500 uppercase">Drop</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-800/40 text-center">
                            <div className="text-sm font-black text-white">+{impact.extraRequired}</div>
                            <div className="text-[8px] font-bold text-slate-500 uppercase">Extra Needed</div>
                        </div>
                    </div>

                    {/* Warning */}
                    {impact.isRecoveryDifficult && (
                        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                            <span className="text-sm">🚨</span>
                            <span className="text-[11px] font-bold text-red-400">
                                Recovery will be very difficult. Skipping {skipCount} lectures requires {impact.newRequired === Infinity ? '∞' : impact.newRequired} additional lectures.
                            </span>
                        </div>
                    )}

                    {!impact.isRecoveryDifficult && impact.extraRequired > 0 && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                            <span className="text-sm">⚡</span>
                            <span className="text-[11px] font-bold text-amber-400">
                                Skipping {skipCount} adds {impact.extraRequired} extra lectures to your recovery plan.
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

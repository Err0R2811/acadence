'use client';

import { useMemo } from 'react';
import { useAttendanceStore } from '@/stores/attendance-store';
import { generateGlobalPlan, computeRequiredLectures } from '@/lib/attendance-strategy';
import { STRATEGY_MODES } from '@/types';
import type { StrategyMode } from '@/types';

export default function RiskGraph() {
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

    const graphData = useMemo(() => {
        if (conducted === 0) return null;

        const effectiveConducted = conducted - noAttendance;
        const required = computeRequiredLectures(attended, effectiveConducted, target);
        const maxN = Math.min(Math.max(required * 1.5, 30), 200);
        const steps = 60;

        // Generate curve points
        const points: { n: number; pct: number }[] = [];
        for (let i = 0; i <= steps; i++) {
            const n = Math.round((i / steps) * maxN);
            const pct = ((attended + n) / (effectiveConducted + n)) * 100;
            points.push({ n, pct });
        }

        // Mode endpoints
        const modeEndpoints = (['easy', 'medium', 'hard'] as StrategyMode[]).map((m) => {
            const plan = generateGlobalPlan(conducted, attended, target, division, m, noAttendance);
            const slots = plan.recommendedSlots.length;
            const pct = ((attended + slots) / (effectiveConducted + slots)) * 100;
            return { mode: m, n: slots, pct, info: STRATEGY_MODES.find((s) => s.id === m)! };
        });

        return { points, modeEndpoints, maxN, required };
    }, [conducted, attended, noAttendance, target, division]);

    if (!graphData) return null;

    const { points, modeEndpoints, maxN } = graphData;

    // SVG dimensions
    const W = 500;
    const H = 200;
    const PAD = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    // Scales
    const minPct = Math.max(0, Math.min(...points.map((p) => p.pct)) - 5);
    const maxPct = Math.min(100, Math.max(...points.map((p) => p.pct)) + 5);
    const xScale = (n: number) => PAD.left + (n / maxN) * chartW;
    const yScale = (pct: number) => PAD.top + chartH - ((pct - minPct) / (maxPct - minPct)) * chartH;

    // Build path
    const pathD = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.n).toFixed(1)} ${yScale(p.pct).toFixed(1)}`)
        .join(' ');

    // Color zones
    const targetY = yScale(target);
    const warningY = yScale(Math.max(minPct, target - 10));

    return (
        <div className="p-4 rounded-2xl border border-slate-700/50 bg-slate-900/30 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-white tracking-tight mb-3">📈 Attendance Risk Curve</h3>

            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
                {/* Color zones */}
                {/* Gold — above target */}
                <rect x={PAD.left} y={PAD.top} width={chartW} height={Math.max(0, targetY - PAD.top)} fill="var(--gold-8)" />
                {/* Yellow — near target */}
                <rect x={PAD.left} y={targetY} width={chartW} height={Math.max(0, warningY - targetY)} fill="rgba(245, 158, 11, 0.06)" />
                {/* Red — below target */}
                <rect x={PAD.left} y={warningY} width={chartW} height={Math.max(0, PAD.top + chartH - warningY)} fill="rgba(239, 68, 68, 0.06)" />

                {/* Grid lines */}
                {[0.25, 0.5, 0.75].map((frac) => {
                    const pct = minPct + frac * (maxPct - minPct);
                    return (
                        <g key={frac}>
                            <line x1={PAD.left} y1={yScale(pct)} x2={PAD.left + chartW} y2={yScale(pct)} stroke="rgba(148,163,184,0.08)" strokeDasharray="4 4" />
                            <text x={PAD.left - 4} y={yScale(pct) + 3} textAnchor="end" fill="#64748b" fontSize={8}>{pct.toFixed(0)}%</text>
                        </g>
                    );
                })}

                {/* Target line */}
                <line x1={PAD.left} y1={targetY} x2={PAD.left + chartW} y2={targetY} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6 3" />
                <text x={PAD.left + chartW + 2} y={targetY + 3} fill="#f59e0b" fontSize={8} fontWeight="bold">T={target}%</text>

                {/* X-axis labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                    const n = Math.round(frac * maxN);
                    return (
                        <text key={frac} x={xScale(n)} y={H - 8} textAnchor="middle" fill="#64748b" fontSize={8}>{n}</text>
                    );
                })}
                <text x={PAD.left + chartW / 2} y={H - 0} textAnchor="middle" fill="#475569" fontSize={7}>Lectures Attended →</text>

                {/* Curve */}
                <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

                {/* Gradient fill under curve */}
                <defs>
                    <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`${pathD} L ${xScale(points[points.length - 1].n)} ${PAD.top + chartH} L ${PAD.left} ${PAD.top + chartH} Z`} fill="url(#curveGrad)" />

                {/* Mode endpoint markers */}
                {modeEndpoints.map(({ mode: m, n, pct, info }) => {
                    const cx = xScale(n);
                    const cy = yScale(pct);
                    const isActive = m === mode;

                    return (
                        <g key={m} onClick={() => setMode(m)} style={{ cursor: 'pointer' }}>
                            {/* Glow */}
                            {isActive && <circle cx={cx} cy={cy} r={10} fill={`${info.color}20`} />}
                            {/* Marker */}
                            <circle cx={cx} cy={cy} r={isActive ? 6 : 4} fill={info.color} stroke="white" strokeWidth={isActive ? 2 : 1} />
                            {/* Label */}
                            <text x={cx} y={cy - 10} textAnchor="middle" fill={info.color} fontSize={8} fontWeight="bold">
                                {info.label}
                            </text>
                        </g>
                    );
                })}

                {/* Current point */}
                <circle cx={xScale(0)} cy={yScale(points[0].pct)} r={3} fill="#94a3b8" stroke="white" strokeWidth={1} />
                <text x={xScale(0) + 4} y={yScale(points[0].pct) - 6} fill="#94a3b8" fontSize={7}>Now</text>
            </svg>

            <p className="text-[9px] text-slate-600 mt-1 text-center">Click a mode marker to switch • Curve shows projected attendance over upcoming lectures</p>
        </div>
    );
}

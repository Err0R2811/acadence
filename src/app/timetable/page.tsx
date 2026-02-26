'use client';

import { useMemo, useState } from 'react';
import { useAttendanceStore } from '@/stores/attendance-store';
import {
    getUpcomingLectures,
    buildTimetableGrid,
    getFacultyFullName,
    getSubjectFullName,
    type SubjectInfo,
    type ScheduleEntry,
    FACULTY_MAP,
    DAYS
} from '@/lib/timetable';
import { generateGlobalPlan } from '@/lib/attendance-strategy';
import { STRATEGY_MODES, type StrategyMode } from '@/types';
import SimulationSlider from '@/components/dashboard/SimulationSlider';
import SkipImpactCalculator from '@/components/dashboard/SkipImpactCalculator';
import ModeComparison from '@/components/dashboard/ModeComparison';
import RiskGraph from '@/components/dashboard/RiskGraph';
import { DevValidationPanel } from '@/components/dashboard/DevValidationPanel';
import FacultyDirectory from '@/components/dashboard/FacultyDirectory';
import MobileTimetable from '@/components/dashboard/MobileTimetable';

const BREAK_SLOTS = [
    { after: '10:25 - 11:20', label: '11:20 - 12:20', name: 'RECESS' },
    { after: '01:15 - 02:10', label: '02:10 - 02:30', name: 'LUNCH' },
];

const ALL_SLOTS_ORDERED = [
    '09:30 - 10:25',
    '10:25 - 11:20',
    'RECESS',
    '12:20 - 01:15',
    '01:15 - 02:10',
    'LUNCH',
    '02:30 - 03:25',
    '03:25 - 04:20',
];

const SUBJECT_COLORS: Record<string, string> = {
    CD: 'subj-core',
    ML: 'subj-core',
    MSWD: 'subj-core',
    MAD: 'subj-practical',
    QR: 'subj-skill',
    ES: 'subj-skill',
    'Project - 1': 'subj-project',
};

export default function TimetablePage() {
    const division = useAttendanceStore((s) => s.division);
    const mode = useAttendanceStore((s) => s.strategyMode);
    const setMode = useAttendanceStore((s) => s.setStrategyMode);
    const target = useAttendanceStore((s) => s.target);
    const conductedStr = useAttendanceStore((s) => s.conducted);
    const attendedStr = useAttendanceStore((s) => s.attended);
    const noAttendanceStr = useAttendanceStore((s) => s.noAttendance);

    // Parse global attendance from store
    const conducted = parseInt(conductedStr, 10) || 0;
    const attended = parseInt(attendedStr, 10) || 0;
    const noAttendance = parseInt(noAttendanceStr, 10) || 0;

    // Filtering State
    const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);
    const [focusMode, setFocusMode] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const grid = useMemo(() => buildTimetableGrid(division), [division]);

    // Get all unique faculties for filter
    const allFaculties = useMemo(() => {
        const facs = new Set<string>();
        Object.values(grid).forEach(day => {
            Object.values(day).forEach(slot => {
                if (slot?.faculty) facs.add(slot.faculty);
            });
        });
        return Array.from(facs).sort();
    }, [grid]);

    // Global strategy plan — mode is in dep array
    const plan = useMemo(() => {
        if (conducted === 0) return null;
        return generateGlobalPlan(conducted, attended, target, division, mode, noAttendance);
    }, [conducted, attended, noAttendance, target, division, mode]);

    // Build recommended slot lookup map
    const recommendedMap = useMemo(() => {
        const rMap = new Map<string, { index: number; priority: string }>();
        if (!plan) return rMap;

        plan.recommendedSlots.forEach((slot, i) => {
            const key = `${slot.day}_${slot.time}`;
            let priority = 'Normal';
            if (i < 3) priority = 'Critical';
            else if (i < 7) priority = 'High';
            rMap.set(key, { index: slot.index, priority });
        });

        return rMap;
    }, [plan]);

    const modeInfo = STRATEGY_MODES.find((m) => m.id === mode)!;

    const toggleFaculty = (f: string) => {
        setSelectedFaculties(prev =>
            prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
        );
    };

    return (
        <div className="px-4 min-h-screen flex flex-col items-center justify-start py-4 w-full">
            {/* Header + Mode Selector */}
            <div className="w-full max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 px-2 overflow-visible">
                <div>
                    <h1
                        className="text-2xl font-bold tracking-tight mb-1"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Academic Dashboard
                    </h1>
                    <div className="flex items-center gap-2">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Division {division} • {modeInfo.label} Mode
                        </p>
                        {plan && plan.summary.daysToRecover !== null && plan.summary.daysToRecover > 0 && (
                            <span
                                className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                                style={{
                                    background: 'var(--gold-5)',
                                    border: '1px solid var(--gold-12)',
                                    color: 'var(--gold-light)',
                                }}
                            >
                                ~{plan.summary.daysToRecover}d plan
                            </span>
                        )}
                        {plan && plan.summary.daysToRecover === null && plan.summary.requiredLectures > 0 && (
                            <span
                                className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                                style={{
                                    background: 'rgba(220, 80, 60, 0.08)',
                                    border: '1px solid rgba(220, 80, 60, 0.2)',
                                    color: '#dc503c',
                                }}
                            >
                                Not enough future slots
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Faculty Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium"
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            <span>👨‍🏫 Faculty Filter</span>
                            {selectedFaculties.length > 0 && (
                                <span
                                    className="px-1.5 rounded-full text-[10px] font-bold"
                                    style={{
                                        background: 'var(--gold-12)',
                                        color: 'var(--gold)',
                                    }}
                                >
                                    {selectedFaculties.length}
                                </span>
                            )}
                        </button>

                        {isFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                                <div
                                    className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl z-50 p-3 animate-scale-in"
                                    style={{
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--border-color)',
                                    }}
                                >
                                    <h4
                                        className="text-[10px] uppercase tracking-wider font-bold mb-2 px-1"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        Instructors
                                    </h4>
                                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                        {allFaculties.map(f => (
                                            <div
                                                key={f}
                                                onClick={() => toggleFaculty(f)}
                                                className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors"
                                                style={{
                                                    background: selectedFaculties.includes(f) ? 'var(--gold-5)' : 'transparent',
                                                }}
                                            >
                                                <div
                                                    className="w-3 h-3 rounded border flex items-center justify-center transition-colors"
                                                    style={{
                                                        background: selectedFaculties.includes(f) ? 'var(--gold)' : 'transparent',
                                                        borderColor: selectedFaculties.includes(f) ? 'var(--gold)' : 'var(--border-color)',
                                                    }}
                                                >
                                                    {selectedFaculties.includes(f) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                </div>
                                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                    {getFacultyFullName(division, f)}
                                                    <span className="ml-1 opacity-50">({f})</span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-3 flex flex-col gap-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                                        <div className="flex items-center justify-between px-1">
                                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Focus Mode</span>
                                            <div
                                                onClick={() => setFocusMode(!focusMode)}
                                                className="w-8 h-4 rounded-full relative transition-colors cursor-pointer"
                                                style={{
                                                    background: focusMode ? 'var(--gold)' : 'var(--bg-input)',
                                                }}
                                            >
                                                <div
                                                    className="absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform"
                                                    style={{ left: focusMode ? '16px' : '2px' }}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedFaculties([])}
                                            className="text-[10px] font-bold"
                                            style={{ color: 'var(--gold)' }}
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="h-8 w-px" style={{ background: 'var(--border-color)' }} />

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
                                className="text-xs px-2.5 py-1.5 rounded-md font-medium transition-all duration-200"
                                style={{
                                    background: mode === m.id ? 'var(--gold-12)' : 'transparent',
                                    color: mode === m.id ? 'var(--gold)' : 'var(--text-muted)',
                                }}
                                title={m.description}
                            >
                                {m.emoji}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Timetable Accordion */}
            <MobileTimetable grid={grid} division={division} />

            {/* Main Content Layout (Desktop) */}
            <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-6 items-stretch hidden md:flex">
                {/* Timetable Grid Container */}
                <div
                    className="relative w-full rounded-xl p-6 overflow-x-auto flex-1"
                    style={{
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                    }}
                >
                    <div className="timetable-grid">
                        <div className="timetable-header timetable-time">Slots</div>
                        {DAYS.map((day) => (
                            <div key={day} className="timetable-header">{day.slice(0, 3)}</div>
                        ))}

                        {ALL_SLOTS_ORDERED.map((slot, slotIndex) => {
                            const isBreak = slot === 'RECESS' || slot === 'LUNCH';
                            if (isBreak) {
                                const info = BREAK_SLOTS.find((b) => b.name === slot)!;
                                return (
                                    <div key={slot} className="timetable-break">
                                        {info.label} • {info.name}
                                    </div>
                                );
                            }

                            return (
                                <div key={slot} style={{ display: 'contents' }}>
                                    <div
                                        className="timetable-time text-sm font-bold"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        {slot.split(' - ')[0]}
                                    </div>

                                    {DAYS.map((day, dayIndex) => {
                                        const entry = grid[day]?.[slot];
                                        const isEmpty = !entry;
                                        const isLab = entry?.type === 'Lab';
                                        const entryKey = entry ? `${day}_${entry.startTime} - ${entry.endTime}` : '';
                                        const recInfo = recommendedMap.get(entryKey);
                                        const isRecommended = !!recInfo;

                                        // Faculty filtering logic
                                        const isFacultySelected = selectedFaculties.length > 0 && entry?.faculty && selectedFaculties.includes(entry.faculty);
                                        const shouldFade = selectedFaculties.length > 0 && !isFacultySelected;
                                        const shouldHide = focusMode && shouldFade;

                                        if (isEmpty) return <div key={`${day}-${slot}`} className="bg-transparent border border-white/5 opacity-10 flex items-center justify-center min-h-[72px]">—</div>;
                                        if (shouldHide) return <div key={`${day}-${slot}`} className="opacity-0 min-h-[72px]" style={{ background: 'var(--bg-input)' }} />;

                                        const categoryClass = SUBJECT_COLORS[entry.subjectShort] || 'subj-other';
                                        const facultyFull = getFacultyFullName(division, entry.faculty);

                                        // Strategy Overlay — gold ring system
                                        let overlayStyle: React.CSSProperties = {};
                                        if (isRecommended) {
                                            overlayStyle = {
                                                boxShadow: mode === 'hard'
                                                    ? '0 0 0 2px var(--gold), 0 0 8px rgba(198,168,74,0.3)'
                                                    : '0 0 0 2px var(--gold)',
                                                borderColor: 'var(--gold)',
                                            };
                                        }

                                        // Smart Tooltip Placement Logic
                                        let tooltipDirectionClass = "";
                                        const isTopRow = slotIndex < 2;
                                        const isBottomRow = slotIndex >= ALL_SLOTS_ORDERED.length - 2;
                                        const isFirstColumn = dayIndex === 0;
                                        const isLastColumn = dayIndex === DAYS.length - 1;

                                        // Vertical Placement
                                        if (isTopRow) {
                                            tooltipDirectionClass += "top-[calc(100%+8px)] ";
                                        } else {
                                            tooltipDirectionClass += "bottom-[calc(100%+8px)] ";
                                        }

                                        // Horizontal Placement
                                        if (isFirstColumn) {
                                            tooltipDirectionClass += "left-0 ";
                                        } else if (isLastColumn) {
                                            tooltipDirectionClass += "right-0 ";
                                        } else {
                                            tooltipDirectionClass += "left-1/2 -translate-x-1/2 ";
                                        }

                                        return (
                                            <div
                                                key={`${day}-${slot}`}
                                                className={`timetable-cell-group relative flex flex-col items-center justify-center p-2 cursor-default transition-all duration-200 ease-out min-h-[72px] ${categoryClass} hover:z-50 hover:scale-105`}
                                                style={{
                                                    opacity: shouldFade ? 0.3 : 1,
                                                    zIndex: isRecommended ? 10 : 1,
                                                    ...overlayStyle,
                                                }}
                                            >
                                                {/* Subject */}
                                                <div
                                                    className="text-sm font-semibold uppercase tracking-tight leading-none mb-0.5"
                                                    style={{ color: 'var(--text-primary)' }}
                                                >
                                                    {entry.subjectShort} {isLab && '🔬'}
                                                </div>
                                                {/* Faculty Short Code */}
                                                <div
                                                    className="text-xs font-medium leading-tight text-center opacity-80"
                                                    style={{ color: 'var(--text-secondary)' }}
                                                >
                                                    {entry.faculty}
                                                </div>
                                                {/* Room — tiny label */}
                                                <div
                                                    className="text-[10px] mt-0.5 opacity-60 font-mono"
                                                    style={{ color: 'var(--text-muted)' }}
                                                >
                                                    R{entry.room}
                                                </div>

                                                {/* Strategy Indicator dot */}
                                                {isRecommended && (
                                                    <div
                                                        className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full shadow-sm ${mode === 'hard' ? 'animate-ping' : ''}`}
                                                        style={{ background: 'var(--gold)' }}
                                                    />
                                                )}

                                                {/* Hover Expanded Tooltip */}
                                                <div
                                                    className={`detail-card absolute ${tooltipDirectionClass} min-w-[260px] p-3 rounded-xl pointer-events-none transition-all shadow-2xl z-[100]`}
                                                    style={{
                                                        background: '#0B1F2F',
                                                        border: '1px solid #C6A84A',
                                                    }}
                                                >
                                                    {/* Type + Room */}
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span
                                                            className="text-[8px] font-black px-1.5 py-0.5 rounded-full"
                                                            style={{
                                                                background: isLab ? 'var(--gold-12)' : 'var(--gold-5)',
                                                                color: 'var(--gold)',
                                                            }}
                                                        >
                                                            {entry.type.toUpperCase()}
                                                        </span>
                                                        <span
                                                            className="text-[8px] font-bold"
                                                            style={{ color: 'var(--text-muted)' }}
                                                        >
                                                            ROOM {entry.room}
                                                        </span>
                                                    </div>

                                                    {/* Full Subject Name */}
                                                    <h4
                                                        className="text-[11px] font-bold mb-0.5 leading-tight"
                                                        style={{ color: 'var(--text-primary)' }}
                                                    >
                                                        {getSubjectFullName(division, entry.subjectShort)}
                                                    </h4>

                                                    {/* Faculty Full Name */}
                                                    <p className="text-[10px] mb-1" style={{ color: 'var(--gold-light)' }}>
                                                        {facultyFull}
                                                    </p>

                                                    {/* Division */}
                                                    <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                                        Division: {division}
                                                    </p>

                                                    {/* Strategy info */}
                                                    {isRecommended && (
                                                        <div
                                                            className="mt-2 pt-2 flex items-center justify-between"
                                                            style={{ borderTop: '1px solid var(--border-color)' }}
                                                        >
                                                            <div className="flex flex-col">
                                                                <span
                                                                    className="text-[7px] font-bold uppercase"
                                                                    style={{ color: 'var(--text-muted)' }}
                                                                >
                                                                    Priority
                                                                </span>
                                                                <span
                                                                    className="text-[10px] font-black"
                                                                    style={{ color: 'var(--gold)' }}
                                                                >
                                                                    {recInfo!.priority}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                <span
                                                                    className="text-[7px] font-bold uppercase"
                                                                    style={{ color: 'var(--text-muted)' }}
                                                                >
                                                                    Mode
                                                                </span>
                                                                <span
                                                                    className="text-[10px] font-black"
                                                                    style={{ color: 'var(--text-primary)' }}
                                                                >
                                                                    {modeInfo.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <FacultyDirectory uniqueFaculties={allFaculties} />
            </div>

            {/* Legend Component */}
            <div className="w-full max-w-[1400px] mx-auto mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
                <div
                    className="p-3 rounded-xl"
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                    }}
                >
                    <h5
                        className="text-[9px] font-bold uppercase tracking-wider mb-2"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Subject Groups
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded" style={{ background: 'var(--gold-12)', border: '1px solid var(--gold-20)' }} />
                            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Core</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded" style={{ background: 'var(--gold-8)', border: '1px solid var(--gold-12)' }} />
                            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Lab</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded" style={{ background: 'var(--gold-5)', border: '1px solid var(--gold-8)' }} />
                            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Skill</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded" style={{ background: 'var(--gold-20)', border: '1px solid var(--gold)' }} />
                            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Project</span>
                        </div>
                    </div>
                </div>

                <div
                    className="p-3 rounded-xl"
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                    }}
                >
                    <h5
                        className="text-[9px] font-bold uppercase tracking-wider mb-2"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Strategy Overlay
                    </h5>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Active Mode</span>
                            <span className="text-[10px] font-black" style={{ color: 'var(--gold)' }}>{modeInfo.label.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Highlighted</span>
                            <span className="text-[10px] font-black" style={{ color: 'var(--text-primary)' }}>{plan?.recommendedSlots?.length ?? 0} Slots</span>
                        </div>
                    </div>
                </div>

                {plan && (
                    <div
                        className="col-span-2 p-3 rounded-xl flex items-center justify-around transition-transform duration-200 hover:translate-y-[-2px]"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                        }}
                    >
                        <div className="text-center">
                            <div className="text-sm font-black" style={{ color: 'var(--gold)' }}>{plan.summary.requiredLectures}</div>
                            <div className="text-[9px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Required</div>
                        </div>
                        <div className="w-px h-8" style={{ background: 'var(--border-color)' }} />
                        <div className="text-center">
                            <div className="text-sm font-black" style={{ color: 'var(--gold)' }}>{plan.summary.scheduledCount}</div>
                            <div className="text-[9px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Scheduled</div>
                        </div>
                        <div className="w-px h-8" style={{ background: 'var(--border-color)' }} />
                        <div className="text-center">
                            <div className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                                {plan.summary.daysToRecover !== null ? `${plan.summary.daysToRecover}d` : '—'}
                            </div>
                            <div className="text-[9px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Est. Recovery</div>
                        </div>
                        <div className="w-px h-8" style={{ background: 'var(--border-color)' }} />
                        <div className="text-center">
                            <div className="text-sm font-black" style={{ color: 'var(--gold)' }}>{plan.summary.projectedPercentage}%</div>
                            <div className="text-[9px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Projected Att.</div>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Analytics Panels ─────────────────────── */}
            <div className="w-full max-w-[1400px] mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
                <SimulationSlider />
                <SkipImpactCalculator />
            </div>

            <div className="w-full max-w-[1400px] mx-auto mt-4 px-2">
                <RiskGraph />
            </div>

            <div className="w-full max-w-[1400px] mx-auto mt-4 px-2">
                <ModeComparison />
            </div>

            {/* Mobile Helper */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 md:hidden">
                <div
                    className="backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 text-[10px]"
                    style={{
                        background: 'rgba(11, 31, 47, 0.9)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-muted)',
                    }}
                >
                    <span>Scroll horizontally to view week →</span>
                </div>
            </div>

            <DevValidationPanel />
        </div>
    );
}

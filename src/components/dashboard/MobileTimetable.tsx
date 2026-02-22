import React, { useState } from 'react';
import { type ScheduleEntry, DAYS, FACULTY_MAP } from '@/lib/timetable';

interface MobileTimetableProps {
    grid: Record<string, Record<string, ScheduleEntry | null>>;
    division: string;
}

export default function MobileTimetable({ grid, division }: MobileTimetableProps) {
    const [expandedDay, setExpandedDay] = useState<string>(
        new Date().toLocaleDateString('en-US', { weekday: 'long' }) || 'Monday'
    );

    const toggleDay = (day: string) => {
        setExpandedDay(prev => prev === day ? '' : day);
    };

    return (
        <div className="w-full max-w-[1200px] mx-auto md:hidden flex flex-col gap-2 px-2 mt-4">
            <h3 className="text-sm font-bold text-[#C6A84A] uppercase tracking-widest pl-2 mb-2">
                📱 Schedule
            </h3>

            {DAYS.map(day => {
                const daySlots = Object.entries(grid[day] || {}).filter(([_, entry]) => entry !== null);
                const isExpanded = expandedDay === day;

                return (
                    <div
                        key={day}
                        className="bg-[#0F2C44] border border-white/5 rounded-xl overflow-hidden transition-all duration-300 shadow-lg"
                    >
                        {/* Accordion Header */}
                        <div
                            onClick={() => toggleDay(day)}
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#163C5A] active:bg-[#112a40] transition-colors"
                            style={{
                                borderBottom: isExpanded && daySlots.length > 0 ? '1px solid rgba(198,168,74,0.2)' : 'none'
                            }}
                        >
                            <h4 className="font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
                                {day}
                                {daySlots.length > 0 && (
                                    <span className="bg-[#C6A84A]/10 text-[#C6A84A] text-[10px] px-2 py-0.5 rounded-full border border-[#C6A84A]/20">
                                        {daySlots.length} Classes
                                    </span>
                                )}
                            </h4>
                            <span className="text-[#C6A84A] font-bold text-lg transform transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                                ▼
                            </span>
                        </div>

                        {/* Accordion Body */}
                        {isExpanded && (
                            <div className="p-3 bg-[#0B1F2F]/50 flex flex-col gap-2">
                                {daySlots.length === 0 ? (
                                    <div className="text-center py-4 text-xs font-bold text-slate-500 uppercase tracking-widest border border-dashed border-white/10 rounded-lg">
                                        No classes scheduled
                                    </div>
                                ) : (
                                    daySlots.sort((a, b) => a[0].localeCompare(b[0])).map(([slotTime, entry]) => {
                                        if (!entry) return null;
                                        const isLab = entry.type === 'Lab';

                                        return (
                                            <div
                                                key={slotTime}
                                                className="flex items-start justify-between p-3 rounded-lg border border-white/5 bg-[#0F2C44]"
                                            >
                                                {/* Left: Time & Room */}
                                                <div className="flex flex-col w-24 flex-shrink-0 border-r border-white/5 pr-3">
                                                    <span className="text-xs font-black text-[#C6A84A] leading-tight">
                                                        {entry.startTime}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold mb-1">
                                                        {entry.endTime}
                                                    </span>
                                                    <span className="text-[9px] font-mono text-slate-500 bg-black/20 px-1 py-0.5 rounded w-max">
                                                        R{entry.room}
                                                    </span>
                                                </div>

                                                {/* Right: Subject & Faculty */}
                                                <div className="flex-1 pl-3">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h5 className="font-bold text-sm text-white tracking-tight leading-none uppercase flex items-center gap-1.5">
                                                            {entry.subjectShort}
                                                            {isLab && <span className="text-[10px]">🔬</span>}
                                                        </h5>
                                                        <span
                                                            className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm"
                                                            style={{
                                                                background: isLab ? '#50411a' : '#1a3328',
                                                                color: isLab ? '#C6A84A' : '#4ade80'
                                                            }}
                                                        >
                                                            {entry.type}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className="bg-[#163C5A] text-[#93c5fb] text-[10px] font-bold px-1.5 py-0.5 rounded">
                                                            {entry.faculty}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

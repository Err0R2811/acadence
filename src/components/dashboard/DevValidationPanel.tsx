"use client";

import { useState, useMemo } from "react";
import { validateFacultyMapping, type ValidationStats } from "@/lib/timetable";

export function DevValidationPanel() {
    const [isOpen, setIsOpen] = useState(false);

    // Use useMemo instead of useEffect to avoid setState in effect
    const stats = useMemo<ValidationStats | null>(() => {
        // Only run in development
        if (process.env.NODE_ENV !== "development") return null;
        return validateFacultyMapping();
    }, []);

    // If not in development or no stats generated, do not render
    if (process.env.NODE_ENV !== "development" || !stats) return null;

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 bg-red-900/80 hover:bg-red-800 text-red-100 text-xs px-3 py-1.5 rounded-full border border-red-500/30 shadow-2xl z-50 flex items-center gap-2 backdrop-blur-sm transition-all"
            >
                ⚠️ <span>Validation: {stats.matchPercentage}%</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] bg-[#0B1F2F] border border-[#C6A84A]/30 rounded-xl shadow-2xl z-[100] flex flex-col overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between p-3 border-b border-[#C6A84A]/20 bg-[#0F2C44]">
                <h3 className="text-sm font-bold text-[#C6A84A] flex items-center gap-2">
                    🛠️ Faculty Validation Engine
                </h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#0F2C44] p-3 rounded-lg border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Match Rate</div>
                        <div className={`text-xl font-black ${stats.matchPercentage === 100 ? 'text-[#E7D48B]' : 'text-red-400'}`}>
                            {stats.matchPercentage}%
                        </div>
                    </div>
                    <div className="bg-[#0F2C44] p-3 rounded-lg border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Entries</div>
                        <div className="text-xl font-bold text-white">{stats.totalEntries}</div>
                    </div>
                    {stats.worstDivision && (
                        <div className="col-span-2 bg-[#0F2C44] p-3 rounded-lg border border-white/5 flex justify-between items-center">
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Highest Errors</div>
                                <div className="text-sm font-bold text-white">Div {stats.worstDivision.id}</div>
                            </div>
                            <div className="text-red-400 font-bold">{stats.worstDivision.count} errors</div>
                        </div>
                    )}
                </div>

                {/* Mismatches List */}
                {stats.mismatches.length > 0 ? (
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">
                            Missing Mappings ({stats.mismatches.length})
                        </h4>
                        <div className="space-y-2">
                            {stats.mismatches.map((m, i) => (
                                <div key={i} className="bg-red-900/10 border border-red-500/20 rounded p-2 text-xs">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-red-300">{m.facultyShort}</span>
                                        <span className="text-[10px] text-gray-500 bg-gray-900/50 px-1.5 rounded">Div {m.division} • {m.subject}</span>
                                    </div>
                                    <div className="text-gray-400 text-[10px]">
                                        Type: <span className="text-gray-300">{m.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 text-[#E7D48B] border border-[#C6A84A]/20 bg-[#C6A84A]/10 rounded-lg">
                        <div className="text-2xl mb-2">✅</div>
                        <div className="text-sm font-bold">All Faculties Mapped Successfully</div>
                        <div className="text-xs opacity-70 mt-1">100% database integrity</div>
                    </div>
                )}
            </div>
        </div>
    );
}

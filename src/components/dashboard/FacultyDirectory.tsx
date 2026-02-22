import React from 'react';
import { FACULTY_MAP } from '@/lib/timetable';

interface FacultyDirectoryProps {
    uniqueFaculties: string[];
}

export default function FacultyDirectory({ uniqueFaculties }: FacultyDirectoryProps) {
    if (!uniqueFaculties || uniqueFaculties.length === 0) return null;

    // Filter out 'LAB' if you want, or keep it. Let's keep all.
    const sortedFaculties = [...uniqueFaculties].sort();

    return (
        <div className="w-full bg-[#0F2C44] border border-[#C6A84A]/30 rounded-xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-[#C6A84A] uppercase tracking-widest mb-4 flex items-center gap-2">
                👨‍🏫 Faculty Directory
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {sortedFaculties.map(shortCode => {
                    if (!shortCode) return null;
                    const canonicalFull = FACULTY_MAP[shortCode.toUpperCase()] ?? FACULTY_MAP[shortCode];
                    // If missing full name, safely fallback to showing short code twice
                    const displayName = canonicalFull || shortCode;

                    return (
                        <div
                            key={shortCode}
                            className="flex items-center gap-4 p-3.5 bg-[#0B1F2F]/50 border border-white/5 rounded-xl hover:bg-[#163C5A] transition-colors shadow-sm"
                        >
                            <div className="bg-[#C6A84A]/10 text-[#C6A84A] font-mono text-sm font-bold px-3 py-1.5 rounded-md border border-[#C6A84A]/20 min-w-[50px] text-center">
                                {shortCode}
                            </div>
                            <div className="text-sm text-slate-200 font-medium truncate">
                                {displayName}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

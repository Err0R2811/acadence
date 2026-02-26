// Timetable service — queries schedule data
import {
    SCHEDULE_DATA,
    SUBJECT_DATA,
    FACULTY_MAP,
    DAYS,
    TEACHING_SLOTS,
    type ScheduleEntry,
    type SubjectInfo,
    type DivisionId,
} from './timetable-data';

export type { ScheduleEntry, SubjectInfo };

/** Get the full weekly schedule for a division */
export function getScheduleForDivision(divisionId: string): ScheduleEntry[] {
    return SCHEDULE_DATA[divisionId] ?? [];
}

/** Get subject metadata for a division */
export function getSubjectsForDivision(divisionId: string): SubjectInfo[] {
    return SUBJECT_DATA[divisionId] ?? [];
}

/** Get full subject name from short code for a division */
export function getSubjectFullName(divisionId: string, shortName: string): string {
    const subjects = SUBJECT_DATA[divisionId] ?? [];
    const match = subjects.find(
        (s) => s.short.toLowerCase() === shortName.toLowerCase()
    );
    return match?.full ?? shortName;
}

/**
 * Get faculty full name from short code.
 * Uses FACULTY_MAP (relational lookup) — independent of division.
 */
export function getFacultyFullName(_divisionId: string, shortName: string): string {
    if (!shortName) return shortName;
    return FACULTY_MAP[shortName.toUpperCase()] ?? FACULTY_MAP[shortName] ?? shortName;
}

/** Build a grid: day → slot → entry (or null) */
function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

export function buildTimetableGrid(
    divisionId: string
): Record<string, Record<string, ScheduleEntry | null>> {
    const schedule = getScheduleForDivision(divisionId);
    const grid: Record<string, Record<string, ScheduleEntry | null>> = {};

    for (const day of DAYS) {
        grid[day] = {};
        for (const slot of TEACHING_SLOTS) {
            grid[day][slot] = null;
        }
    }

    for (const entry of schedule) {
        const exactSlotKey = `${entry.startTime} - ${entry.endTime}`;
        
        // Try exact match first
        if (grid[entry.day]?.[exactSlotKey] !== undefined) {
            grid[entry.day][exactSlotKey] = entry;
            continue;
        }

        // For labs spanning multiple slots (e.g., 02:30 - 04:20), 
        // find the first slot that falls within the lab time range
        const entryStart = timeToMinutes(entry.startTime);
        const entryEnd = timeToMinutes(entry.endTime);
        
        for (const slot of TEACHING_SLOTS) {
            const [slotStartStr, slotEndStr] = slot.split(' - ');
            const slotStart = timeToMinutes(slotStartStr);
            const slotEnd = timeToMinutes(slotEndStr);
            
            if (entryStart <= slotStart && entryEnd >= slotEnd) {
                grid[entry.day][slot] = entry;
                break;
            }
        }
    }

    return grid;
}

const DAY_ORDER: Record<string, number> = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
};

/** Get upcoming lectures within the next N days from a given day */
export function getUpcomingLectures(
    divisionId: string,
    fromDay: string,
    withinDays: number = 3
): ScheduleEntry[] {
    const schedule = getScheduleForDivision(divisionId);
    const startIdx = DAY_ORDER[fromDay] ?? 0;
    const upcoming: ScheduleEntry[] = [];

    for (let offset = 0; offset < withinDays; offset++) {
        const dayIdx = (startIdx + offset) % 6; // Mon-Sat
        const dayName = Object.keys(DAY_ORDER).find((k) => DAY_ORDER[k] === dayIdx);
        if (!dayName) continue;

        const dayEntries = schedule
            .filter((e) => e.day === dayName)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
        upcoming.push(...dayEntries);
    }

    return upcoming;
}

/** Get unique subject shorts from a division's schedule */
export function getUniqueSubjects(divisionId: string): string[] {
    const schedule = getScheduleForDivision(divisionId);
    const shorts = new Set(schedule.map((e) => e.subjectShort));
    return Array.from(shorts).sort();
}

export { DAYS, TEACHING_SLOTS, FACULTY_MAP };

// ═══════════════════════════════════════════════════════════════
// Faculty Validation Engine
// ═══════════════════════════════════════════════════════════════

export interface MismatchReport {
    division: string;
    subject: string;
    facultyShort: string;
    expected: string;
    found: string;
    type: 'unmapped' | 'mismatch' | 'blank_short_code';
}

export interface ValidationStats {
    totalEntries: number;
    validEntries: number;
    matchPercentage: number;
    mismatches: MismatchReport[];
    worstDivision: { id: string; count: number } | null;
}

/**
 * Validates all schedule entries across all divisions against the FACULTY_MAP.
 * Returns detailed statistics and a list of mismatch/missing reports.
 */
export function validateFacultyMapping(): ValidationStats {
    const reports: MismatchReport[] = [];
    let totalEntries = 0;
    let validEntries = 0;
    const errorCountByDivision: Record<string, number> = {};

    Object.entries(SCHEDULE_DATA).forEach(([divisionId, schedule]) => {
        if (!errorCountByDivision[divisionId]) errorCountByDivision[divisionId] = 0;

        schedule.forEach((entry) => {
            totalEntries++;
            const shortCode = entry.faculty?.trim();

            if (!shortCode) {
                errorCountByDivision[divisionId]++;
                reports.push({
                    division: divisionId,
                    subject: entry.subjectShort,
                    facultyShort: '(blank)',
                    expected: '(Valid short code)',
                    found: '(blank)',
                    type: 'blank_short_code',
                });
                return;
            }

            const expectedFullName = FACULTY_MAP[shortCode.toUpperCase()] ?? FACULTY_MAP[shortCode];

            // In a fully extracted system, we might compare expectedFullName against a parsed field.
            // Since our JSON only contains short codes in schedule, we check if it is unmapped in the FACULTY_MAP.
            if (!expectedFullName) {
                errorCountByDivision[divisionId]++;
                reports.push({
                    division: divisionId,
                    subject: entry.subjectShort,
                    facultyShort: shortCode,
                    expected: '(Must exist in FACULTY_MAP)',
                    found: 'Unmapped',
                    type: 'unmapped',
                });
            } else {
                validEntries++;
            }
        });
    });

    const matchPercentage = totalEntries === 0 ? 100 : Math.round((validEntries / totalEntries) * 100);

    let worstDivId = '';
    let maxErrors = -1;
    Object.entries(errorCountByDivision).forEach(([divId, count]) => {
        if (count > maxErrors) {
            maxErrors = count;
            worstDivId = divId;
        }
    });

    return {
        totalEntries,
        validEntries,
        matchPercentage,
        mismatches: reports,
        worstDivision: maxErrors > 0 ? { id: worstDivId, count: maxErrors } : null,
    };
}

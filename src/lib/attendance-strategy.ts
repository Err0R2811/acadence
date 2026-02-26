/**
 * attendance-strategy.ts — Stateless, global strategy engine.
 * 
 * No subject tracking. No weekly frequency. No database.
 * Pure math + timetable density + mode selection.
 * 
 * KEY INVARIANT:
 *   requiredLectures is CONSTANT across all modes.
 *   Only scheduledCount, skipCount, daysToRecover, and projectedPercentage differ per mode.
 * 
 * MODE DIFFERENTIATION:
 *   EASY:     Attend exactly `required` lectures, spread out (every 3rd slot)
 *   MEDIUM:   Attend `required + 10% buffer`, balanced pace (every 2nd slot)
 *   HARD:     Attend all consecutive slots until required is met, compressed into fewest days
 */

import { getUpcomingLectures, getLecturesUntilTeachingEnd, getScheduleForDivision, getDaysUntilTeachingEnd, type ScheduleEntry } from './timetable';
import { SCHEDULE_DATA } from './timetable-data';

// ─── Types ──────────────────────────────────────────────────────

export type StrategyMode = 'easy' | 'medium' | 'hard';

export interface FutureSlot {
    day: string;
    time: string;
    room: string;
    type: 'Lecture' | 'Lab';
    faculty: string;
    subjectShort: string;
}

export interface RecommendedSlot {
    day: string;
    time: string;
    room: string;
    type: 'Lecture' | 'Lab';
    faculty: string;
    subjectShort: string;
    index: number;
}

export interface GlobalStrategyPlan {
    mode: StrategyMode;
    summary: {
        /** Mathematical requirement — CONSTANT across all modes */
        requiredLectures: number;
        /** Mode-dependent: how many lectures this mode schedules */
        scheduledCount: number;
        /** Mode-dependent: totalAvailableSlots - scheduledCount */
        skipCount: number;
        /** Mode-dependent: calendar days to reach last scheduled slot */
        daysToRecover: number | null;
        /** Math-based: how many you can skip while staying >= target (only if above target) */
        safeSkipAllowance: number;
        /** After executing this mode's plan */
        projectedPercentage: number;
        currentPercentage: number;
        /** Total future slots available */
        totalAvailableSlots: number;
        /** Lectures this mode actually attends (may exceed required for Medium buffer) */
        actualAttend: number;
    };
    recommendedSlots: RecommendedSlot[];
}

// ─── Core Math (Pure) ───────────────────────────────────────────

/**
 * Global required lectures formula.
 * 
 * Given: C = conducted, A = attended, T = target (as percentage, e.g. 75)
 * Solve: (A + x) / (C + x) >= T/100
 * Result: x = ceil((T/100 * C - A) / (1 - T/100))
 * 
 * INVARIANT: This value does NOT change with mode.
 */
export function computeRequiredLectures(attended: number, conducted: number, target: number): number {
    if (conducted === 0) return 0;

    const currentPct = (attended / conducted) * 100;
    if (currentPct >= target) return 0;

    if (target >= 100) {
        return attended < conducted ? Infinity : 0;
    }

    const T = target / 100;
    const x = (T * conducted - attended) / (1 - T);
    return Math.ceil(x);
}

/**
 * How many lectures can be skipped while staying >= target.
 * Only meaningful when currently above target.
 */
export function computeSkipAllowance(attended: number, conducted: number, target: number): number {
    if (conducted === 0) return 0;

    const currentPct = (attended / conducted) * 100;
    if (currentPct < target) return 0;

    const T = target / 100;
    const x = (attended - T * conducted) / T;
    return Math.floor(x);
}

/**
 * Project attendance after attending `lecturesAttended` more out of `lecturesConducted` more.
 */
export function projectAfterPlan(attended: number, conducted: number, lecturesAttended: number, lecturesConducted: number): number {
    const newA = attended + lecturesAttended;
    const newC = conducted + lecturesConducted;
    if (newC === 0) return 100;
    return (newA / newC) * 100;
}

export function getRiskLevel(percentage: number, target: number): 'Safe' | 'Warning' | 'Critical' {
    if (percentage >= target) return 'Safe';
    if (percentage >= target - 10) return 'Warning';
    return 'Critical';
}

// ─── Timetable Slot Flattening ──────────────────────────────────

export function getFutureSlots(divisionId: string): FutureSlot[] {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = dayNames[new Date().getDay()];
    
    // Use academic calendar to limit lectures to teaching end date
    const upcoming = getLecturesUntilTeachingEnd(divisionId, today);

    return upcoming.map(entry => ({
        day: entry.day,
        time: `${entry.startTime} - ${entry.endTime}`,
        room: entry.room,
        type: entry.type,
        faculty: entry.faculty,
        subjectShort: entry.subjectShort,
    }));
}

// ─── Mode-Based Slot Selection ──────────────────────────────────

/**
 * Compute how many lectures a mode actually attends.
 * 
 * EASY:     exactly `required` (minimum needed)
 * MEDIUM:   `required + ceil(required * 0.10)` (10% safety buffer)
 * HARD:     `required` but all consecutive (no filtering) — fewest days
 */
function computeActualAttend(required: number, mode: StrategyMode, totalSlots: number): number {
    if (required <= 0) return 0;

    switch (mode) {
        case 'easy':
            return Math.min(required, totalSlots);
        case 'medium': {
            const buffer = Math.ceil(required * 0.10);
            return Math.min(required + buffer, totalSlots);
        }
        case 'hard':
            return Math.min(required, totalSlots);
    }
}

/**
 * Select recommended slots based on mode.
 * 
 * ◇ EASY:     Every 3rd slot (spread out) → more calendar days, more skips
 * ◆ MEDIUM:   Every 2nd slot (balanced)  → balanced days, some skips
 * ⬥ HARD:     Consecutive slots          → fewest calendar days, fewest skips
 */
export function selectSlotsByMode(availableSlots: FutureSlot[], actualAttend: number, mode: StrategyMode): RecommendedSlot[] {
    if (actualAttend <= 0 || availableSlots.length === 0) return [];

    let filtered: FutureSlot[];

    switch (mode) {
        case 'easy':
            // Take every 3rd slot to spread recovery
            filtered = availableSlots.filter((_, i) => i % 3 === 0);
            break;
        case 'medium':
            // Take every 2nd slot for balanced pace
            filtered = availableSlots.filter((_, i) => i % 2 === 0);
            break;
        case 'hard':
            // Take consecutive slots for fastest recovery
            filtered = availableSlots;
            break;
    }

    return filtered.slice(0, actualAttend).map((slot, i) => ({
        ...slot,
        index: i + 1,
    }));
}

export function getDailyLecturePattern(divisionId: string): Record<string, number> {
    const pattern: Record<string, number> = {};
    const schedule = SCHEDULE_DATA[divisionId] || [];

    schedule.forEach(slot => {
        if (!slot.subjectShort) return;
        const upper = slot.subjectShort.toUpperCase();
        if (upper.includes("LIBRARY") || upper.includes("SELF STUDY")) return;

        pattern[slot.day] = (pattern[slot.day] || 0) + 1;
    });

    return pattern;
}

export function calculateTargetDays(requiredLectures: number, dailyPattern: Record<string, number>): number {
    if (requiredLectures <= 0) return 0;

    const orderedDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    let remaining = requiredLectures;
    let days = 0;

    let pointer = 0;
    let safeGuard = 0;
    const hasCapacity = orderedDays.some(d => (dailyPattern[d] || 0) > 0);

    if (!hasCapacity) return 0;

    while (remaining > 0 && safeGuard < 1000) {
        const today = orderedDays[pointer % orderedDays.length];
        const capacity = dailyPattern[today] || 0;

        remaining -= capacity;
        days++;
        pointer++;
        safeGuard++;
    }

    return days;
}

// ─── Pure Reactive Calculation ──────────────────────────────────

/**
 * calculateModeStats — Pure function that derives ALL mode-specific values.
 * Called by generateGlobalPlan for each mode change.
 * No cached state, no side effects.
 */
export function calculateModeStats(
    mode: StrategyMode,
    required: number,
    availableSlots: FutureSlot[],
    attended: number,
    conducted: number,
    divisionId: string
) {
    const totalSlots = availableSlots.length;
    const actualAttend = computeActualAttend(required, mode, totalSlots);
    const recommended = selectSlotsByMode(availableSlots, actualAttend, mode);
    const scheduledCount = recommended.length;
    const skipCount = totalSlots - scheduledCount;

    const dailyPattern = getDailyLecturePattern(divisionId);
    const daysToRecover = calculateTargetDays(actualAttend, dailyPattern);

    const projected = projectAfterPlan(attended, conducted, scheduledCount, scheduledCount);

    return {
        actualAttend,
        scheduledCount,
        skipCount,
        daysToRecover,
        projectedPercentage: Math.round(projected * 10) / 10,
        recommendedSlots: recommended,
    };
}

// ─── Main Strategy Processor ────────────────────────────────────

export function generateGlobalPlan(
    conducted: number,
    attended: number,
    target: number,
    divisionId: string,
    mode: StrategyMode,
    noAttendance: number = 0
): GlobalStrategyPlan {
    // Calculate effective conducted (excluding no attendance)
    const effectiveConducted = conducted - noAttendance;
    
    // 1. Compute global required lectures — CONSTANT across all modes
    const requiredLectures = computeRequiredLectures(attended, effectiveConducted, target);
    const safeSkipAllowance = computeSkipAllowance(attended, effectiveConducted, target);
    const currentPct = effectiveConducted > 0 ? (attended / effectiveConducted) * 100 : 100;

    // 2. Get all future timetable slots
    const availableSlots = getFutureSlots(divisionId);

    // 3. Pure reactive calculation for this mode
    const stats = calculateModeStats(mode, requiredLectures, availableSlots, attended, effectiveConducted, divisionId);

    return {
        mode,
        summary: {
            requiredLectures,
            scheduledCount: stats.scheduledCount,
            skipCount: stats.skipCount,
            daysToRecover: requiredLectures === 0 ? 0 : stats.daysToRecover,
            safeSkipAllowance,
            projectedPercentage: stats.projectedPercentage,
            currentPercentage: Math.round(currentPct * 10) / 10,
            totalAvailableSlots: availableSlots.length,
            actualAttend: stats.actualAttend,
        },
        recommendedSlots: stats.recommendedSlots,
    };
}

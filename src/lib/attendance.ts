/**
 * Core attendance calculation engine.
 * All formulas are mathematically correct with proper edge-case handling.
 */

export class AttendanceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AttendanceError';
    }
}

/**
 * Validates inputs and throws descriptive errors for invalid data.
 */
function validateInputs(attended: number, conducted: number, target?: number, noAttendance: number = 0): void {
    if (!Number.isFinite(attended) || !Number.isFinite(conducted) || !Number.isFinite(noAttendance)) {
        throw new AttendanceError('Inputs must be finite numbers.');
    }
    if (attended < 0 || conducted < 0 || noAttendance < 0) {
        throw new AttendanceError('Lecture counts cannot be negative.');
    }
    if (!Number.isInteger(attended) || !Number.isInteger(conducted) || !Number.isInteger(noAttendance)) {
        throw new AttendanceError('Lecture counts must be whole numbers.');
    }
    if (noAttendance > conducted) {
        throw new AttendanceError('No attendance cannot exceed conducted lectures.');
    }
    const effectiveConducted = conducted - noAttendance;
    if (attended > effectiveConducted) {
        throw new AttendanceError('Attended lectures cannot exceed effective conducted lectures.');
    }
    if (target !== undefined) {
        if (!Number.isFinite(target)) {
            throw new AttendanceError('Target must be a finite number.');
        }
        if (target <= 0 || target > 100) {
            throw new AttendanceError('Target must be between 1% and 100%.');
        }
    }
}

/**
 * Calculate current attendance percentage.
 * Returns 0 if effective_conducted is 0, to ensure strict mathematical scaling.
 */
export function calculateAttendance(attended: number, conducted: number, noAttendance: number = 0): number {
    validateInputs(attended, conducted, undefined, noAttendance);
    const effectiveConducted = conducted - noAttendance;
    if (effectiveConducted === 0) return 0;
    return (attended / effectiveConducted) * 100;
}

/**
 * Calculate how many consecutive lectures a student must attend
 * to reach the target percentage.
 *
 * Formula: (attended + x) / (effectiveConducted + x) >= target/100
 * Solving: x >= (target * effectiveConducted - 100 * attended) / (100 - target)
 *
 * Returns 0 if already at or above target.
 * Returns Infinity if target is 100% and student has missed any class.
 */
export function lecturesNeeded(
    attended: number,
    conducted: number,
    target: number,
    noAttendance: number = 0
): number {
    validateInputs(attended, conducted, target, noAttendance);
    const effectiveConducted = conducted - noAttendance;

    if (effectiveConducted === 0) {
        return target > 0 ? 1 : 0;
    }

    const current = (attended / effectiveConducted) * 100;
    if (current >= target) return 0;

    // target === 100 means student can never recover missed lectures
    if (target === 100) {
        return attended < effectiveConducted ? Infinity : 0;
    }

    const targetFraction = target / 100;
    const x = (targetFraction * effectiveConducted - attended) / (1 - targetFraction);
    // Add small epsilon to handle float precision issues 
    // e.g., 15.000000000000002 should ceil to 15, not 16
    return Math.max(0, Math.ceil(x - 1e-9));
}

/**
 * Calculate how many consecutive lectures a student can miss
 * while staying at or above the target percentage.
 *
 * Formula: attended / (effectiveConducted + x) >= target/100
 * Solving: x <= (100 * attended - target * effectiveConducted) / target
 *
 * Returns 0 if already below target.
 */
export function lecturesMissable(
    attended: number,
    conducted: number,
    target: number,
    noAttendance: number = 0
): number {
    validateInputs(attended, conducted, target, noAttendance);
    const effectiveConducted = conducted - noAttendance;

    if (effectiveConducted === 0) return 0; // No lectures yet, can't miss any

    const current = (attended / effectiveConducted) * 100;
    if (current < target) return 0;

    const targetFraction = target / 100;
    const x = (attended - targetFraction * effectiveConducted) / targetFraction;
    return Math.floor(x);
}

/**
 * Full calculation — returns everything the UI needs.
 */
export function fullCalculation(
    attended: number,
    conducted: number,
    target: number,
    noAttendance: number = 0
) {
    const currentPercentage = calculateAttendance(attended, conducted, noAttendance);
    const isAboveTarget = currentPercentage >= target;
    const needed = lecturesNeeded(attended, conducted, target, noAttendance);
    const missable = lecturesMissable(attended, conducted, target, noAttendance);

    return {
        currentPercentage: Math.round(currentPercentage * 100) / 100,
        isAboveTarget,
        target,
        lecturesNeeded: needed,
        lecturesMissable: missable,
        conducted,
        attended,
        noAttendance,
    };
}

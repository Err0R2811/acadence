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
function validateInputs(attended: number, conducted: number, target?: number): void {
    if (!Number.isFinite(attended) || !Number.isFinite(conducted)) {
        throw new AttendanceError('Inputs must be finite numbers.');
    }
    if (attended < 0 || conducted < 0) {
        throw new AttendanceError('Lecture counts cannot be negative.');
    }
    if (!Number.isInteger(attended) || !Number.isInteger(conducted)) {
        throw new AttendanceError('Lecture counts must be whole numbers.');
    }
    if (attended > conducted) {
        throw new AttendanceError('Attended lectures cannot exceed conducted lectures.');
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
 * Returns 100 if no lectures have been conducted (benefit of the doubt).
 */
export function calculateAttendance(attended: number, conducted: number): number {
    validateInputs(attended, conducted);
    if (conducted === 0) return 100;
    return (attended / conducted) * 100;
}

/**
 * Calculate how many consecutive lectures a student must attend
 * to reach the target percentage.
 *
 * Formula: (attended + x) / (conducted + x) >= target/100
 * Solving: x >= (target*conducted - 100*attended) / (100 - target)
 *
 * Returns 0 if already at or above target.
 * Returns Infinity if target is 100% and student has missed any class.
 */
export function lecturesNeeded(
    attended: number,
    conducted: number,
    target: number
): number {
    validateInputs(attended, conducted, target);

    if (conducted === 0) return 0; // 100% by default

    const current = (attended / conducted) * 100;
    if (current >= target) return 0;

    // target === 100 means student can never recover missed lectures
    if (target === 100) {
        return attended < conducted ? Infinity : 0;
    }

    const targetFraction = target / 100;
    const x = (targetFraction * conducted - attended) / (1 - targetFraction);
    return Math.ceil(x);
}

/**
 * Calculate how many consecutive lectures a student can miss
 * while staying at or above the target percentage.
 *
 * Formula: attended / (conducted + x) >= target/100
 * Solving: x <= (100*attended - target*conducted) / target
 *
 * Returns 0 if already below target.
 */
export function lecturesMissable(
    attended: number,
    conducted: number,
    target: number
): number {
    validateInputs(attended, conducted, target);

    if (conducted === 0) return 0; // No lectures yet, can't miss any

    const current = (attended / conducted) * 100;
    if (current < target) return 0;

    const targetFraction = target / 100;
    const x = (attended - targetFraction * conducted) / targetFraction;
    return Math.floor(x);
}

/**
 * Full calculation — returns everything the UI needs.
 */
export function fullCalculation(
    attended: number,
    conducted: number,
    target: number
) {
    const currentPercentage = calculateAttendance(attended, conducted);
    const isAboveTarget = currentPercentage >= target;
    const needed = lecturesNeeded(attended, conducted, target);
    const missable = lecturesMissable(attended, conducted, target);

    return {
        currentPercentage: Math.round(currentPercentage * 100) / 100,
        isAboveTarget,
        target,
        lecturesNeeded: needed,
        lecturesMissable: missable,
        conducted,
        attended,
    };
}

import { describe, it, expect } from 'vitest';
import {
    calculateAttendance,
    lecturesNeeded,
    lecturesMissable,
    fullCalculation,
    AttendanceError,
} from '../src/lib/attendance';

// ─── calculateAttendance ────────────────────────────────────────────────────

describe('calculateAttendance', () => {
    it('calculates basic percentage correctly', () => {
        expect(calculateAttendance(80, 100)).toBe(80);
    });

    it('returns 0% when no lectures conducted', () => {
        expect(calculateAttendance(0, 0)).toBe(0);
    });

    it('returns 0% when no lectures attended', () => {
        expect(calculateAttendance(0, 50)).toBe(0);
    });

    it('returns 100% when all lectures attended', () => {
        expect(calculateAttendance(100, 100)).toBe(100);
    });

    it('handles fractional percentages', () => {
        const result = calculateAttendance(33, 40);
        expect(result).toBeCloseTo(82.5);
    });

    it('throws on negative attended', () => {
        expect(() => calculateAttendance(-1, 10)).toThrow(AttendanceError);
    });

    it('throws on negative conducted', () => {
        expect(() => calculateAttendance(5, -1)).toThrow(AttendanceError);
    });

    it('throws when attended > conducted', () => {
        expect(() => calculateAttendance(11, 10)).toThrow(AttendanceError);
    });

    it('throws on non-integer inputs', () => {
        expect(() => calculateAttendance(5.5, 10)).toThrow(AttendanceError);
    });

    it('throws on NaN inputs', () => {
        expect(() => calculateAttendance(NaN, 10)).toThrow(AttendanceError);
    });

    it('throws on Infinity inputs', () => {
        expect(() => calculateAttendance(Infinity, 10)).toThrow(AttendanceError);
    });

    it('handles noAttendance properly', () => {
        // Conducted: 40, Attended: 30, NoAttendance: 5 => Effective: 35
        // 30 / 35 = 85.714...
        expect(calculateAttendance(30, 40, 5)).toBeCloseTo(85.714);
    });

    it('returns 0% when effective conducted is 0', () => {
        expect(calculateAttendance(0, 5, 5)).toBe(0);
    });

    it('throws when noAttendance exceeds conducted', () => {
        expect(() => calculateAttendance(5, 10, 11)).toThrow(AttendanceError);
    });
});

// ─── lecturesNeeded ─────────────────────────────────────────────────────────

describe('lecturesNeeded', () => {
    it('returns 0 when already above target', () => {
        expect(lecturesNeeded(80, 100, 75)).toBe(0);
    });

    it('returns 0 when exactly at target', () => {
        expect(lecturesNeeded(75, 100, 75)).toBe(0);
    });

    it('calculates correct lectures needed for 60% with 75% target', () => {
        // (60 + x) / (100 + x) >= 0.75 → x >= 60
        expect(lecturesNeeded(60, 100, 75)).toBe(60);
    });

    it('calculates correct lectures needed for 50% with 75% target', () => {
        // (50 + x) / (100 + x) >= 0.75 → x = (75 - 50) / (100 - 75) * 100... let me compute
        // 0.75(100+x) <= 50+x → 75 + 0.75x <= 50 + x → 25 <= 0.25x → x >= 100
        expect(lecturesNeeded(50, 100, 75)).toBe(100);
    });

    it('returns 1 when no lectures conducted and target > 0', () => {
        expect(lecturesNeeded(0, 0, 75)).toBe(1);
    });

    it('returns Infinity when target is 100% and classes missed', () => {
        expect(lecturesNeeded(99, 100, 100)).toBe(Infinity);
    });

    it('returns 0 when target is 100% and all attended', () => {
        expect(lecturesNeeded(100, 100, 100)).toBe(0);
    });

    it('throws when target > 100', () => {
        expect(() => lecturesNeeded(80, 100, 101)).toThrow(AttendanceError);
    });

    it('throws when target is 0', () => {
        expect(() => lecturesNeeded(80, 100, 0)).toThrow(AttendanceError);
    });

    it('handles noAttendance mathematically correctly', () => {
        // Conducted: 40, Attended: 30, NoAttendance: 5 => Target: 90%
        // Effective: 35, Attended: 30
        // (30 + x) / (35 + x) >= 0.9 => 30 + x >= 31.5 + 0.9x => 0.1x >= 1.5 => x >= 15
        expect(lecturesNeeded(30, 40, 90, 5)).toBe(15);
    });
});

// ─── lecturesMissable ───────────────────────────────────────────────────────

describe('lecturesMissable', () => {
    it('returns correct missable count above target', () => {
        // 80 / (100 + x) >= 0.75 → 100 + x <= 80/0.75 = 106.67 → x <= 6.67 → floor = 6
        expect(lecturesMissable(80, 100, 75)).toBe(6);
    });

    it('returns 0 when below target', () => {
        expect(lecturesMissable(60, 100, 75)).toBe(0);
    });

    it('returns 0 when no lectures conducted', () => {
        expect(lecturesMissable(0, 0, 75)).toBe(0);
    });

    it('returns 0 when exactly at target', () => {
        // 75 / (100 + x) >= 0.75 → x <= 0
        expect(lecturesMissable(75, 100, 75)).toBe(0);
    });

    it('returns high count for very high attendance', () => {
        // 95 / (100 + x) >= 0.50 → x <= 90
        expect(lecturesMissable(95, 100, 50)).toBe(90);
    });

    it('handles noAttendance properly', () => {
        // Conducted: 40, Attended: 30, NoAttendance: 5 => Target: 75%
        // Effective: 35, Attended: 30
        // 30 / (35 + x) >= 0.75 => 30 >= 26.25 + 0.75x => 3.75 >= 0.75x => x <= 5
        expect(lecturesMissable(30, 40, 75, 5)).toBe(5);
    });
});

// ─── fullCalculation ────────────────────────────────────────────────────────

describe('fullCalculation', () => {
    it('returns complete result for above-target scenario', () => {
        const result = fullCalculation(80, 100, 75);
        expect(result.currentPercentage).toBe(80);
        expect(result.isAboveTarget).toBe(true);
        expect(result.lecturesNeeded).toBe(0);
        expect(result.lecturesMissable).toBe(6);
    });

    it('returns complete result for below-target scenario', () => {
        const result = fullCalculation(60, 100, 75);
        expect(result.currentPercentage).toBe(60);
        expect(result.isAboveTarget).toBe(false);
        expect(result.lecturesNeeded).toBe(60);
        expect(result.lecturesMissable).toBe(0);
    });

    it('rounds percentage to 2 decimal places', () => {
        const result = fullCalculation(33, 40, 75);
        expect(result.currentPercentage).toBe(82.5);
    });

    it('incorporates noAttendance accurately into the full result', () => {
        const result = fullCalculation(30, 40, 80, 5);
        expect(result.currentPercentage).toBe(85.71); // 30/35
        expect(result.isAboveTarget).toBe(true);
        expect(result.lecturesNeeded).toBe(0);
        expect(result.lecturesMissable).toBe(2); // 30 / (35+2) = 0.8108 => 30/(35+3) = 0.789
        expect(result.noAttendance).toBe(5);
    });
});

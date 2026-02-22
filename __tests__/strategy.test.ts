import { describe, it, expect } from 'vitest';
import {
    computeRequiredLectures,
    computeSkipAllowance,
    projectAfterPlan,
    getRiskLevel,
} from '../src/lib/attendance-strategy';

describe('attendance-strategy — Stateless Global Engine', () => {
    // ─── Core Formula Tests ─────────────────────────────────

    it('computeRequiredLectures: x = ceil((T*C - A) / (1 - T))', () => {
        // C=100, A=50, T=75% → x = ceil((0.75*100 - 50) / 0.25) = ceil(25/0.25) = 100
        expect(computeRequiredLectures(50, 100, 75)).toBe(100);

        // Already above target
        expect(computeRequiredLectures(80, 100, 75)).toBe(0);

        // Exact target
        expect(computeRequiredLectures(75, 100, 75)).toBe(0);

        // No lectures conducted → 0
        expect(computeRequiredLectures(0, 0, 75)).toBe(0);

        // Small case: C=10, A=5, T=75 → ceil((7.5 - 5) / 0.25) = ceil(10) = 10
        expect(computeRequiredLectures(5, 10, 75)).toBe(10);

        // 100% target with missed lectures → Infinity
        expect(computeRequiredLectures(9, 10, 100)).toBe(Infinity);
    });

    it('computeSkipAllowance: correct skip calculations', () => {
        // C=100, A=80, T=75 → floor((80 - 75) / 0.75) = floor(6.66) = 6
        expect(computeSkipAllowance(80, 100, 75)).toBe(6);

        // Below target → 0
        expect(computeSkipAllowance(50, 100, 75)).toBe(0);

        // No lectures → 0
        expect(computeSkipAllowance(0, 0, 75)).toBe(0);
    });

    it('projectAfterPlan: correct projected percentage', () => {
        // A=50, C=100, attend 100 more → (50+100)/(100+100) = 75%
        expect(projectAfterPlan(50, 100, 100, 100)).toBe(75);

        // No additional → same percentage (80/100 = 80%)
        expect(projectAfterPlan(80, 100, 0, 0)).toBe(80);
    });

    it('getRiskLevel: correct risk classification', () => {
        expect(getRiskLevel(80, 75)).toBe('Safe');
        expect(getRiskLevel(70, 75)).toBe('Warning');
        expect(getRiskLevel(50, 75)).toBe('Critical');
    });

    // ─── Validation Tests ───────────────────────────────────

    it('no 999 values anywhere', () => {
        // Required should never be 999
        const req = computeRequiredLectures(50, 100, 75);
        expect(req).not.toBe(999);

        const skip = computeSkipAllowance(50, 100, 75);
        expect(skip).not.toBe(999);
    });

    it('required lectures are always non-negative', () => {
        expect(computeRequiredLectures(100, 100, 75)).toBe(0);
        expect(computeRequiredLectures(80, 100, 75)).toBe(0);
        expect(computeRequiredLectures(50, 100, 75)).toBeGreaterThan(0);
    });
});

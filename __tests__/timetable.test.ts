import { describe, it, expect } from 'vitest';
import {
    getScheduleForDivision,
    getSubjectsForDivision,
    getSubjectFullName,
    buildTimetableGrid,
    getUpcomingLectures,
    getUniqueSubjects,
} from '@/lib/timetable';
import { DIVISIONS } from '@/lib/timetable-data';

describe('Timetable Service', () => {
    describe('getScheduleForDivision', () => {
        it('returns entries for a valid division', () => {
            const schedule = getScheduleForDivision('6A22');
            expect(schedule.length).toBeGreaterThan(0);
        });

        it('returns empty array for invalid division', () => {
            const schedule = getScheduleForDivision('INVALID');
            expect(schedule).toEqual([]);
        });

        it('each entry has required fields', () => {
            const schedule = getScheduleForDivision('6A22');
            for (const entry of schedule) {
                expect(entry.day).toBeTruthy();
                expect(entry.startTime).toBeTruthy();
                expect(entry.endTime).toBeTruthy();
                expect(entry.subjectShort).toBeTruthy();
                expect(['Lecture', 'Lab']).toContain(entry.type);
            }
        });
    });

    describe('getSubjectsForDivision', () => {
        it('returns subject metadata for 6A22', () => {
            const subjects = getSubjectsForDivision('6A22');
            expect(subjects.length).toBeGreaterThan(0);
        });

        it('each subject has id, full, short', () => {
            const subjects = getSubjectsForDivision('6A22');
            for (const s of subjects) {
                expect(s.id).toBeTruthy();
                expect(s.full).toBeTruthy();
            }
        });
    });

    describe('getSubjectFullName', () => {
        it('resolves ML to Machine Learning', () => {
            const name = getSubjectFullName('6A22', 'ML');
            expect(name).toBe('Machine Learning');
        });

        it('returns short name if not found', () => {
            const name = getSubjectFullName('6A22', 'XYZ');
            expect(name).toBe('XYZ');
        });
    });

    describe('buildTimetableGrid', () => {
        it('returns grid with all days', () => {
            const grid = buildTimetableGrid('6A22');
            expect(Object.keys(grid)).toContain('Monday');
            expect(Object.keys(grid)).toContain('Saturday');
        });

        it('has teaching slots for each day', () => {
            const grid = buildTimetableGrid('6A22');
            for (const day of Object.keys(grid)) {
                expect(Object.keys(grid[day]).length).toBeGreaterThan(0);
            }
        });
    });

    describe('getUpcomingLectures', () => {
        it('returns lectures for upcoming days', () => {
            const upcoming = getUpcomingLectures('6A22', 'Monday', 2);
            expect(upcoming.length).toBeGreaterThan(0);
        });

        it('respects withinDays parameter', () => {
            const one = getUpcomingLectures('6A22', 'Monday', 1);
            const three = getUpcomingLectures('6A22', 'Monday', 3);
            expect(three.length).toBeGreaterThanOrEqual(one.length);
        });
    });

    describe('getUniqueSubjects', () => {
        it('returns sorted unique subjects', () => {
            const subjects = getUniqueSubjects('6A22');
            expect(subjects.length).toBeGreaterThan(0);
            // Check sorted
            for (let i = 1; i < subjects.length; i++) {
                expect(subjects[i] >= subjects[i - 1]).toBe(true);
            }
        });
    });

    describe('DIVISIONS constant', () => {
        it('contains 30 divisions', () => {
            expect(DIVISIONS.length).toBe(30);
        });

        it('includes 6A22', () => {
            expect(DIVISIONS).toContain('6A22');
        });
    });
});

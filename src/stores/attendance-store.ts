'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { fullCalculation } from '@/lib/attendance';
import { DEFAULT_DIVISION } from '@/lib/divisions';
import { DEFAULT_COLLEGE, DEFAULT_DEPARTMENT, type CalculationResult, type StrategyMode, type College, type Department } from '@/types';

interface AttendanceState {
    // Form state
    college: College;
    department: Department;
    division: string;
    target: number;
    useDefaultTarget: boolean;
    conducted: string;
    attended: string;
    noAttendance: string;
    strategyMode: StrategyMode;

    // Result (ephemeral — not persisted)
    currentResult: CalculationResult | null;

// Actions
    setCollege: (college: College) => void;
    setDepartment: (department: Department) => void;
    setDivision: (division: string) => void;
    setTarget: (target: number) => void;
    setUseDefaultTarget: (use: boolean) => void;
    setConducted: (value: string) => void;
    setAttended: (value: string) => void;
    setNoAttendance: (value: string) => void;
    setStrategyMode: (mode: StrategyMode) => void;
    calculate: () => { success: boolean; error?: string };
    clearResult: () => void;
}

const DEFAULT_TARGET = 75;

export const useAttendanceStore = create<AttendanceState>()(
persist(
        (set, get) => ({
            college: DEFAULT_COLLEGE,
            department: DEFAULT_DEPARTMENT,
            division: DEFAULT_DIVISION,
            target: DEFAULT_TARGET,
            useDefaultTarget: true,
            conducted: '',
            attended: '',
            noAttendance: '',
            strategyMode: 'medium' as StrategyMode,
            currentResult: null,

            setDivision: (division) => set({ division }),

            setCollege: (college) => set({ college }),

            setDepartment: (department) => set({ department }),

            setTarget: (target) => set({ target }),

            setUseDefaultTarget: (use) =>
                set({ useDefaultTarget: use, target: use ? DEFAULT_TARGET : get().target }),

            setConducted: (value) => set({ conducted: value }),

            setAttended: (value) => set({ attended: value }),

            setNoAttendance: (value) => set({ noAttendance: value }),

            setStrategyMode: (mode) => set({ strategyMode: mode }),

            calculate: () => {
                const { conducted, attended, noAttendance, target } = get();

                const conductedNum = parseInt(conducted, 10);
                const attendedNum = parseInt(attended, 10);
                const noAttendanceNum = noAttendance === '' ? 0 : parseInt(noAttendance, 10);

                if (isNaN(conductedNum) || isNaN(attendedNum) || isNaN(noAttendanceNum)) {
                    return { success: false, error: 'Please enter valid numbers.' };
                }
                if (conductedNum < 0 || attendedNum < 0 || noAttendanceNum < 0) {
                    return { success: false, error: 'Values cannot be negative.' };
                }
                if (noAttendanceNum > conductedNum) {
                    return { success: false, error: 'No attendance cannot exceed conducted lectures.' };
                }
                const effectiveConducted = conductedNum - noAttendanceNum;
                if (attendedNum > effectiveConducted) {
                    return { success: false, error: 'Attended cannot exceed effective conducted lectures.' };
                }
                if (conductedNum === 0) {
                    return { success: false, error: 'Total lectures must be greater than 0.' };
                }

                try {
                    const result = fullCalculation(attendedNum, conductedNum, target, noAttendanceNum);

                    const calculationResult: CalculationResult = {
                        ...result,
                        calculatedAt: new Date().toISOString(),
                        id: uuidv4(),
                    };

                    set({ currentResult: calculationResult });

                    return { success: true };
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Calculation failed.';
                    return { success: false, error: message };
                }
            },

            clearResult: () => set({ currentResult: null }),
        }),
        {
            name: 'attendance-tracker-storage',
            merge: (persistedState: unknown, currentState: AttendanceState): AttendanceState => {
                const persisted = persistedState as Partial<AttendanceState> | undefined;
                const merged = { ...currentState, ...persisted };
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((merged.strategyMode as any) === 'hardcore') {
                    merged.strategyMode = 'hard';
                }
                return merged;
            },
partialize: (state) => ({
                college: state.college,
                department: state.department,
                division: state.division,
                target: state.target,
                useDefaultTarget: state.useDefaultTarget,
                strategyMode: state.strategyMode,
                conducted: state.conducted,
                attended: state.attended,
                noAttendance: state.noAttendance,
            }),
        }
    )
);

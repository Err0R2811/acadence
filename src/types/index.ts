// Type definitions for the Attendance Tracker — Stateless Architecture

/** Attendance calculation status */
export type AttendanceStatus = 'above' | 'below' | 'exact';

/** Strategy modes */
export type StrategyMode = 'easy' | 'medium' | 'hard';

/** Risk level for recommendations */
export type RiskLevel = 'Safe' | 'Warning' | 'Critical';

/** Navigation tab identifiers */
export type NavTab = 'home' | 'timetable' | 'history' | 'settings';

/** Core calculation inputs (global — no subject) */
export interface CalculationInput {
  conducted: number;
  attended: number;
  target: number;
}

/** Calculation result stored in history */
export interface CalculationResult {
  id: string;
  currentPercentage: number;
  isAboveTarget: boolean;
  target: number;
  lecturesNeeded: number;
  lecturesMissable: number;
  conducted: number;
  attended: number;
  calculatedAt: string;
}

/** API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Strategy mode metadata for UI — Navy-Gold brand system */
export interface StrategyModeInfo {
  id: StrategyMode;
  label: string;
  emoji: string;
  color: string;
  glowColor: string;
  description: string;
}

export const STRATEGY_MODES: StrategyModeInfo[] = [
  {
    id: 'easy',
    label: 'Easy',
    emoji: '◇',
    color: '#C6A84A',
    glowColor: 'rgba(198, 168, 74, 0.25)',
    description: 'Maximum safe skipping',
  },
  {
    id: 'medium',
    label: 'Medium',
    emoji: '◆',
    color: '#C6A84A',
    glowColor: 'rgba(198, 168, 74, 0.40)',
    description: 'Balanced recovery',
  },
  {
    id: 'hard',
    label: 'Hard',
    emoji: '⬥',
    color: '#E7D48B',
    glowColor: 'rgba(231, 212, 139, 0.50)',
    description: 'Fastest recovery',
  },
];

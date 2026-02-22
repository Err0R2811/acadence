// Division utilities and validation
import { DIVISIONS, type DivisionId } from './timetable-data';

export { DIVISIONS, type DivisionId };

/** All division IDs as a Set for O(1) lookup */
const DIVISION_SET = new Set<string>(DIVISIONS);

/** Check if a string is a valid division ID */
export function isValidDivision(id: string): id is DivisionId {
    return DIVISION_SET.has(id);
}

/** Get divisions grouped by section (A, B, C) */
export function getDivisionsBySection(): Record<string, DivisionId[]> {
    const groups: Record<string, DivisionId[]> = {};
    for (const div of DIVISIONS) {
        const match = div.match(/^6([A-Z])/);
        const section = match ? match[1] : 'Other';
        if (!groups[section]) groups[section] = [];
        groups[section].push(div);
    }
    // Sort each group numerically
    for (const key of Object.keys(groups)) {
        groups[key].sort((a, b) => {
            const numA = parseInt(a.replace(/^6[A-Z]/, ''), 10);
            const numB = parseInt(b.replace(/^6[A-Z]/, ''), 10);
            return numA - numB;
        });
    }
    return groups;
}

/** Default division */
export const DEFAULT_DIVISION: DivisionId = '6A22';

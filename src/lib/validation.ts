import { z } from 'zod';

export const calculateSchema = z.object({
    conducted: z
        .number()
        .int('Must be a whole number')
        .min(0, 'Cannot be negative')
        .max(10000, 'Exceeds maximum allowed'),
    attended: z
        .number()
        .int('Must be a whole number')
        .min(0, 'Cannot be negative')
        .max(10000, 'Exceeds maximum allowed'),
    noAttendance: z
        .number()
        .int('Must be a whole number')
        .min(0, 'Cannot be negative')
        .max(10000, 'Exceeds maximum allowed')
        .optional(),
    target: z
        .number()
        .min(1, 'Target must be at least 1%')
        .max(100, 'Target cannot exceed 100%'),
}).refine(
    (data) => data.attended <= (data.conducted - (data.noAttendance ?? 0)),
    { message: 'Attended cannot exceed effective conducted (conducted - no attendance)', path: ['attended'] }
);

export const studentSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name is too long')
        .trim(),
    semester: z
        .number()
        .int()
        .min(1, 'Semester must be at least 1')
        .max(12, 'Semester cannot exceed 12'),
    defaultTarget: z
        .number()
        .min(1)
        .max(100)
        .default(75),
});

export type CalculateInput = z.infer<typeof calculateSchema>;
export type StudentInput = z.infer<typeof studentSchema>;

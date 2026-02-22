import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { isValidDivision } from '@/lib/divisions';
import { generateGlobalPlan } from '@/lib/attendance-strategy';

const RecommendationRequest = z.object({
    division: z.string().min(1),
    target: z.number().min(1).max(100),
    mode: z.enum(['easy', 'medium', 'hard']).default('medium'),
    conducted: z.number().int().nonnegative(),
    attended: z.number().int().nonnegative(),
});

const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = RecommendationRequest.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    details: parsed.error.flatten(),
                },
                { status: 400, headers: SECURITY_HEADERS }
            );
        }

        const { division, target, mode, conducted, attended } = parsed.data;

        if (!isValidDivision(division)) {
            return NextResponse.json(
                { success: false, error: `Invalid division: ${division}` },
                { status: 400, headers: SECURITY_HEADERS }
            );
        }

        const plan = generateGlobalPlan(conducted, attended, target, division, mode);

        return NextResponse.json(
            {
                success: true,
                data: {
                    mode: plan.mode,
                    summary: plan.summary,
                    recommendedSlots: plan.recommendedSlots.map((s) => ({
                        day: s.day,
                        time: s.time,
                        room: s.room,
                        type: s.type,
                        faculty: s.faculty,
                        subjectShort: s.subjectShort,
                        index: s.index,
                    })),
                },
            },
            { status: 200, headers: SECURITY_HEADERS }
        );
    } catch {
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500, headers: SECURITY_HEADERS }
        );
    }
}

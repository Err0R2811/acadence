import { NextRequest, NextResponse } from 'next/server';
import { calculateSchema } from '@/lib/validation';
import { fullCalculation } from '@/lib/attendance';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate with Zod
        const parsed = calculateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: parsed.error.issues.map((i) => i.message).join(', '),
                },
                { status: 400 }
            );
        }

        const { conducted, attended, target } = parsed.data;

        const result = fullCalculation(attended, conducted, target);

        return NextResponse.json({
            success: true,
            data: {
                ...result,
                id: uuidv4(),
                calculatedAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

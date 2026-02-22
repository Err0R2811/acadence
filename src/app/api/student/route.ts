import { NextRequest, NextResponse } from 'next/server';
import { studentSchema } from '@/lib/validation';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/student
 *
 * Creates a student profile. Currently returns a mock response.
 * In production, this would persist to PostgreSQL via Prisma.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const parsed = studentSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: parsed.error.issues.map((i) => i.message).join(', '),
                },
                { status: 400 }
            );
        }

        const student = {
            id: uuidv4(),
            ...parsed.data,
            createdAt: new Date().toISOString(),
        };

        return NextResponse.json({ success: true, data: student }, { status: 201 });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

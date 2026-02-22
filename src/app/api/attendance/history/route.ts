import { NextResponse } from 'next/server';

/**
 * GET /api/attendance/history
 *
 * In the current implementation, history is managed client-side
 * via Zustand's persist middleware. This endpoint is a placeholder
 * for future database-backed history.
 */
export async function GET() {
    return NextResponse.json({
        success: true,
        data: [],
        message:
            'History is currently managed client-side. Enable the database to persist history server-side.',
    });
}

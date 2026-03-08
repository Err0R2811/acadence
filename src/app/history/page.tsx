'use client';

import { useAttendanceStore } from '@/stores/attendance-store';

export default function HistoryPage() {
    const currentResult = useAttendanceStore((s) => s.currentResult);

    return (
        <main className="px-5 pt-12 pb-28">
            {/* Header */}
            <div className="mb-6">
                <h1
                    className="text-2xl font-bold"
                    style={{ color: 'var(--text-primary)' }}
                >
                    History
                </h1>
                <p
                    className="text-sm mt-0.5"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    Your latest calculation
                </p>
            </div>

            {/* Empty State */}
            {!currentResult ? (
                <div className="card p-8 text-center">
                    <div
                        className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                        style={{ background: 'var(--bg-input)' }}
                    >
                        <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <p
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        No calculations yet
                    </p>
                    <p
                        className="text-xs mt-1"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Go to Home and calculate your attendance
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="card p-4">
                        <div className="flex items-start gap-3.5">
                            {/* Status Icon */}
                            <div
                                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
                                style={{
                                    background: currentResult.isAboveTarget
                                        ? 'var(--gold-8)'
                                        : 'var(--accent-red-bg)',
                                }}
                            >
                                {currentResult.isAboveTarget ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                        <line x1="12" y1="9" x2="12" y2="13" />
                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                        {currentResult.attended}/{currentResult.conducted} Lectures
                                        {currentResult.noAttendance ? ` (No Att: ${currentResult.noAttendance})` : ''}
                                    </p>
                                    <p
                                        className="text-base font-bold tabular-nums ml-3"
                                        style={{
                                            color: currentResult.isAboveTarget ? 'var(--gold)' : 'var(--accent-red)',
                                        }}
                                    >
                                        {currentResult.currentPercentage.toFixed(1)}%
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        Target: {currentResult.target}%
                                    </span>
                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>•</span>
                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        {currentResult.isAboveTarget
                                            ? `Can miss ${currentResult.lecturesMissable}`
                                            : `Need ${currentResult.lecturesNeeded} more`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
                        History is not persisted — attendance is stateless.
                    </p>
                </div>
            )}
        </main>
    );
}

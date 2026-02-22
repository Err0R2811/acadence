'use client';

import { useAttendanceStore } from '@/stores/attendance-store';

export default function RecentCalculations() {
    const currentResult = useAttendanceStore((s) => s.currentResult);

    if (!currentResult) return null;

    const isAbove = currentResult.currentPercentage >= currentResult.target;

    return (
        <div className="mx-5 mt-6 mb-28 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
                <h3
                    className="text-base font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                >
                    Latest Calculation
                </h3>
            </div>

            <div className="space-y-2.5">
                <div
                    className="card p-4 flex items-center gap-3.5"
                >
                    {/* Status Icon */}
                    <div
                        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{
                            background: isAbove
                                ? 'var(--gold-8)'
                                : 'var(--accent-red-bg)',
                        }}
                    >
                        {isAbove ? (
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="var(--gold)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        ) : (
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="var(--accent-red)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p
                            className="text-sm font-semibold truncate"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {currentResult.attended}/{currentResult.conducted} lectures
                        </p>
                        <p
                            className="text-xs mt-0.5"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Target: {currentResult.target}%
                        </p>
                    </div>

                    {/* Current Percentage */}
                    <div className="text-right flex-shrink-0">
                        <p
                            className="text-base font-bold tabular-nums"
                            style={{
                                color: isAbove
                                    ? 'var(--gold)'
                                    : 'var(--accent-red)',
                            }}
                        >
                            {currentResult.currentPercentage.toFixed(1)}%
                        </p>
                        <p
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {isAbove ? 'On Track' : 'Low'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

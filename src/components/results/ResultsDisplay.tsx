'use client';

import { useAttendanceStore } from '@/stores/attendance-store';
import ProgressRing from './ProgressRing';

export default function ResultsDisplay() {
    const currentResult = useAttendanceStore((s) => s.currentResult);

    if (!currentResult) return null;

    const {
        currentPercentage,
        isAboveTarget,
        target,
        lecturesNeeded,
        lecturesMissable,
    } = currentResult;

    const statusLabel = isAboveTarget ? 'Above Target' : 'Below Target';
    const statusClass = isAboveTarget ? 'status-above' : 'status-below';

    return (
        <div className="card mx-5 mt-4 p-5 animate-scale-in">
            {/* Subject & Status Row */}
            <div className="flex items-center justify-between mb-4">
                <h3
                    className="text-base font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                >
                    Attendance Status
                </h3>
                <span
                    className={`${statusClass} px-3 py-1 rounded-full text-xs font-semibold`}
                >
                    {statusLabel}
                </span>
            </div>

            {/* Progress Ring */}
            <div className="flex justify-center mb-5">
                <ProgressRing
                    percentage={currentPercentage}
                    isAboveTarget={isAboveTarget}
                />
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3">
                {/* Target */}
                <div
                    className="p-3.5 rounded-xl text-center"
                    style={{
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-color)',
                    }}
                >
                    <p
                        className="text-xs font-medium uppercase tracking-wider mb-1"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Target
                    </p>
                    <p
                        className="text-lg font-bold"
                        style={{ color: 'var(--accent-blue)' }}
                    >
                        {target}%
                    </p>
                </div>

                {/* Gap */}
                <div
                    className="p-3.5 rounded-xl text-center"
                    style={{
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-color)',
                    }}
                >
                    <p
                        className="text-xs font-medium uppercase tracking-wider mb-1"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Difference
                    </p>
                    <p
                        className="text-lg font-bold"
                        style={{
                            color: isAboveTarget
                                ? 'var(--gold)'
                                : 'var(--accent-red)',
                        }}
                    >
                        {isAboveTarget ? '+' : ''}
                        {(currentPercentage - target).toFixed(1)}%
                    </p>
                </div>

                {/* Lectures needed or missable */}
                <div
                    className="col-span-2 p-3.5 rounded-xl"
                    style={{
                        background: isAboveTarget
                            ? 'var(--gold-8)'
                            : 'var(--accent-red-bg)',
                        border: `1px solid ${isAboveTarget
                            ? 'var(--gold-20)'
                            : 'rgba(239, 68, 68, 0.15)'
                            }`,
                    }}
                >
                    <div className="flex items-center gap-2.5">
                        {isAboveTarget ? (
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="var(--gold)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        ) : (
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="var(--accent-red)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        )}
                        <div>
                            <p
                                className="text-sm font-semibold"
                                style={{
                                    color: isAboveTarget
                                        ? 'var(--gold)'
                                        : 'var(--accent-red)',
                                }}
                            >
                                {isAboveTarget
                                    ? `You can miss ${lecturesMissable} more lecture${lecturesMissable !== 1 ? 's' : ''
                                    }`
                                    : lecturesNeeded === Infinity
                                        ? 'Cannot reach target — attend all future classes'
                                        : `Need to attend ${lecturesNeeded} more lecture${lecturesNeeded !== 1 ? 's' : ''
                                        }`}
                            </p>
                            <p
                                className="text-xs mt-0.5"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                {isAboveTarget
                                    ? 'and still meet your target'
                                    : 'consecutively to meet your target'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

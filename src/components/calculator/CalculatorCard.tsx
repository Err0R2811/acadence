'use client';

import { useState } from 'react';
import { useAttendanceStore } from '@/stores/attendance-store';

export default function CalculatorCard() {
    const {
        conducted,
        attended,
        noAttendance,
        target,
        useDefaultTarget,
        setConducted,
        setAttended,
        setNoAttendance,
        setTarget,
        setUseDefaultTarget,
        calculate,
    } = useAttendanceStore();

    const [error, setError] = useState<string | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const handleCalculate = () => {
        setError(null);
        setIsCalculating(true);

        // Small delay for UX feel
        setTimeout(() => {
            const result = calculate();
            if (!result.success) {
                setError(result.error || 'Calculation failed.');
            }
            setIsCalculating(false);
        }, 300);
    };

    return (
        <div className="card mx-5 p-5 animate-fade-in-up">
            <h2
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--text-primary)' }}
            >
                Attendance Calculator
            </h2>

            {/* Two-column inputs */}
            <div className="grid grid-cols-2 gap-3 mb-3.5">
                <div>
                    <label
                        className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Total Conducted
                    </label>
                    <input
                        type="number"
                        className="input-field"
                        placeholder="0"
                        value={conducted}
                        onChange={(e) => setConducted(e.target.value)}
                        min={0}
                        max={10000}
                        inputMode="numeric"
                    />
                </div>
                <div>
                    <label
                        className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Total Attended
                    </label>
                    <input
                        type="number"
                        className="input-field"
                        placeholder="0"
                        value={attended}
                        onChange={(e) => setAttended(e.target.value)}
                        min={0}
                        max={10000}
                        inputMode="numeric"
                    />
                </div>
            </div>

            {/* No Attendance */}
            <div className="mb-4">
                <label
                    className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                >
                    Lectures Without Attendance Taken
                </label>
                <input
                    type="number"
                    className="input-field"
                    placeholder="0"
                    value={noAttendance}
                    onChange={(e) => setNoAttendance(e.target.value)}
                    min={0}
                    max={10000}
                    inputMode="numeric"
                />
                <p className="text-[10px] mt-1.5 opacity-70" style={{ color: 'var(--text-muted)' }}>
                    These lectures will not be counted in your attendance percentage.
                </p>
            </div>

            {/* Target Toggle */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2.5">
                    <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        College Default Target (75%)
                    </span>
                    <div
                        className={`toggle-track ${useDefaultTarget ? 'active' : ''}`}
                        onClick={() => setUseDefaultTarget(!useDefaultTarget)}
                        role="switch"
                        aria-checked={useDefaultTarget}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setUseDefaultTarget(!useDefaultTarget);
                            }
                        }}
                    >
                        <div className="toggle-thumb" />
                    </div>
                </div>

                {/* Custom Target Input */}
                {!useDefaultTarget && (
                    <div className="animate-fade-in-up">
                        <label
                            className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Custom Target (%)
                        </label>
                        <input
                            type="number"
                            className="input-field"
                            placeholder="75"
                            value={target}
                            onChange={(e) => setTarget(Number(e.target.value))}
                            min={1}
                            max={100}
                            inputMode="numeric"
                        />
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <div
                    className="mb-3.5 p-3 rounded-xl text-sm font-medium animate-scale-in"
                    style={{
                        background: 'var(--accent-red-bg)',
                        color: 'var(--accent-red)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}
                >
                    {error}
                </div>
            )}

            {/* Calculate Button */}
            <button
                className="btn-primary flex items-center justify-center gap-2"
                onClick={handleCalculate}
                disabled={isCalculating}
            >
                {isCalculating ? (
                    <>
                        <svg
                            className="animate-spin"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="3"
                                opacity={0.3}
                            />
                            <path
                                d="M12 2a10 10 0 0 1 10 10"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                        Calculating...
                    </>
                ) : (
                    <>
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="4" y="2" width="16" height="20" rx="2" />
                            <line x1="8" y1="6" x2="16" y2="6" />
                            <line x1="8" y1="10" x2="16" y2="10" />
                            <line x1="8" y1="14" x2="12" y2="14" />
                        </svg>
                        Calculate Status
                    </>
                )}
            </button>
        </div>
    );
}

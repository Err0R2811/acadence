'use client';

import { useAttendanceStore } from '@/stores/attendance-store';
import { getDivisionsBySection } from '@/lib/divisions';

const divisionGroups = getDivisionsBySection();

export default function SettingsPage() {
    const {
        division,
        target,
        useDefaultTarget,
        setDivision,
        setTarget,
        setUseDefaultTarget,
        clearResult,
    } = useAttendanceStore();

    return (
        <div className="px-5 pt-12 pb-28">
            <h1
                className="text-2xl font-bold tracking-tight mb-1"
                style={{ color: 'var(--text-primary)' }}
            >
                Settings
            </h1>
            <p
                className="text-sm mb-6"
                style={{ color: 'var(--text-secondary)' }}
            >
                Customize your experience
            </p>

            {/* Division */}
            <div className="card p-5 mb-4">
                <h2
                    className="text-base font-semibold mb-3"
                    style={{ color: 'var(--text-primary)' }}
                >
                    Your Division
                </h2>

                {Object.entries(divisionGroups).map(([section, divs]) => (
                    <div key={section} className="mb-3">
                        <p
                            className="text-xs font-medium uppercase tracking-wider mb-2"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Section {section}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {divs.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDivision(d)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                    style={{
                                        background:
                                            division === d
                                                ? 'var(--accent-blue)'
                                                : 'var(--bg-input)',
                                        color:
                                            division === d
                                                ? 'white'
                                                : 'var(--text-secondary)',
                                        border: `1px solid ${division === d
                                            ? 'var(--accent-blue)'
                                            : 'var(--border-color)'
                                            }`,
                                    }}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Target Configuration */}
            <div className="card p-5 mb-4">
                <h2
                    className="text-base font-semibold mb-3"
                    style={{ color: 'var(--text-primary)' }}
                >
                    Attendance Target
                </h2>

                <div className="flex items-center justify-between mb-3">
                    <span
                        className="text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        College Default (75%)
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
                            value={target}
                            onChange={(e) => setTarget(Number(e.target.value))}
                            min={1}
                            max={100}
                        />
                    </div>
                )}

                <div
                    className="mt-3 p-3 rounded-xl text-sm"
                    style={{
                        background: 'var(--accent-blue-glow)',
                        color: 'var(--accent-blue)',
                        border: '1px solid rgba(59, 130, 246, 0.15)',
                    }}
                >
                    Current target: <strong>{target}%</strong>
                </div>
            </div>

            {/* Data Management */}
            <div className="card p-5">
                <h2
                    className="text-base font-semibold mb-3"
                    style={{ color: 'var(--text-primary)' }}
                >
                    Data Management
                </h2>
                <button
                    onClick={clearResult}
                    className="w-full py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={{
                        background: 'var(--accent-red-bg)',
                        color: 'var(--accent-red)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}
                >
                    Clear Current Result
                </button>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';

interface ProgressRingProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    isAboveTarget: boolean;
}

export default function ProgressRing({
    percentage,
    size = 160,
    strokeWidth = 10,
    isAboveTarget,
}: ProgressRingProps) {
    const [animatedOffset, setAnimatedOffset] = useState(0);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    useEffect(() => {
        // Delay to trigger CSS transition
        const timer = setTimeout(() => {
            setAnimatedOffset(clampedPercentage);
        }, 100);
        return () => clearTimeout(timer);
    }, [clampedPercentage]);

    const offset = circumference - (animatedOffset / 100) * circumference;

    const strokeColor = isAboveTarget
        ? '#C6A84A'
        : 'var(--accent-red)';

    const glowColor = isAboveTarget
        ? 'rgba(198, 168, 74, 0.4)'
        : 'rgba(239, 68, 68, 0.3)';

    return (
        <div className="relative inline-flex items-center justify-center">
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background: isAboveTarget ? 'radial-gradient(circle at center, rgba(198,168,74,0.15), transparent 70%)' : 'none',
                    filter: isAboveTarget ? 'blur(4px)' : 'none'
                }}
            />
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90 relative z-10"
            >
                {/* Background track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--border-color)"
                    strokeWidth={strokeWidth}
                />
                {/* Glow effect */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={glowColor}
                    strokeWidth={strokeWidth + 6}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="progress-ring-circle"
                    style={{ filter: isAboveTarget ? 'drop-shadow(0 0 8px rgba(198,168,74,0.35))' : 'blur(4px)' }}
                />
                {/* Progress arc */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="progress-ring-circle"
                />
            </svg>

            {/* Center percentage */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                    className="text-3xl font-bold tabular-nums"
                    style={{ color: strokeColor }}
                >
                    {clampedPercentage.toFixed(1)}%
                </span>
                <span
                    className="text-xs font-medium mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                >
                    Current
                </span>
            </div>
        </div>
    );
}

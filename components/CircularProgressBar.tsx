import React from 'react';

interface CircularProgressBarProps {
    progress: number; // 0-100
    size: number;
    strokeWidth: number;
    color: string;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({ progress, size, strokeWidth, color }) => {
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle
                className="text-slate-700/50"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="transparent"
                r={radius}
                cx={center}
                cy={center}
            />
            <circle
                stroke={color}
                strokeWidth={strokeWidth}
                fill="transparent"
                r={radius}
                cx={center}
                cy={center}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dy=".3em"
                className="text-xl font-bold fill-white rotate-90 origin-center"
            >
                {`${Math.round(progress)}%`}
            </text>
        </svg>
    );
};

export default CircularProgressBar;
import React, { useMemo } from 'react';
import { StudySession } from '../types';

interface StudyHistoryChartProps {
    sessions: StudySession[];
}

const StudyHistoryChart: React.FC<StudyHistoryChartProps> = ({ sessions }) => {
    const chartData = useMemo(() => {
        const data = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return {
                date: date,
                label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                minutes: 0,
            };
        }).reverse();

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        sessions.forEach(session => {
            const sessionDate = new Date(session.date + 'T00:00:00'); // Ensure date is parsed correctly without timezone issues
            if (sessionDate >= sevenDaysAgo) {
                const dayIndex = data.findIndex(d => d.date.toDateString() === sessionDate.toDateString());
                if (dayIndex !== -1) {
                    data[dayIndex].minutes += session.duration;
                }
            }
        });

        return data;
    }, [sessions]);

    const maxMinutes = Math.max(...chartData.map(d => d.minutes), 60); // Minimum height for an empty chart

    if (!sessions || sessions.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-slate-800/50 rounded-lg border border-slate-700/70">
                <p className="text-slate-500">Log study sessions to see your activity chart.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/70">
            <svg width="100%" height="250" aria-labelledby="chart-title" className="text-slate-400">
                <title id="chart-title">Weekly Study Activity Chart</title>
                <g className="grid">
                    {[0.25, 0.5, 0.75, 1].map(line => (
                        <line
                            key={line}
                            x1="40"
                            x2="100%"
                            y1={210 - (200 * line)}
                            y2={210 - (200 * line)}
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                            opacity="0.2"
                        />
                    ))}
                </g>
                <g className="labels y-axis" fill="currentColor" fontSize="12">
                     {[...Array(5)].map((_, i) => {
                        const value = Math.round(maxMinutes / 4 * i);
                        const y = 215 - (200 * (value / maxMinutes));
                        return (
                            <text key={i} x="30" y={y} textAnchor="end">{value > 0 ? `${value}m` : '0'}</text>
                        );
                     })}
                </g>
                <g className="bars" transform="translate(40, 0)">
                    {chartData.map((day, index) => {
                        const barHeight = day.minutes > 0 ? (day.minutes / maxMinutes) * 200 : 0;
                        const barWidth = 30;
                        const x = (index * ((100-5) / 7)) + 5; // Simplified percentage based positioning
                        return (
                            <g key={day.date.toISOString()}>
                                <rect
                                    x={`${x}%`}
                                    y={210}
                                    width={`${barWidth}px`}
                                    height="0"
                                    fill="url(#barGradient)"
                                    rx="3"
                                >
                                  <title>{`${day.label}: ${day.minutes} minutes`}</title>
                                  <animate attributeName="height" from="0" to={barHeight} dur="0.5s" fill="freeze" begin={`${index * 0.05}s`} />
                                  <animate attributeName="y" from="210" to={210-barHeight} dur="0.5s" fill="freeze" begin={`${index * 0.05}s`} />
                                </rect>
                            </g>
                        );
                    })}
                </g>
                 <g className="labels x-axis" fill="currentColor" fontSize="12" transform="translate(40, 0)">
                    {chartData.map((day, index) => {
                         const barWidth = 30;
                         const x = (index * ((100 - 5) / 7)) + 5;
                         return (
                            <text key={day.date.toISOString()} x={`calc(${x}% + ${barWidth/2}px)`} y="230" textAnchor="middle">{day.label}</text>
                         )
                    })}
                 </g>
                 <defs>
                    <linearGradient id="barGradient" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="var(--color-muted-gold)" />
                        <stop offset="100%" stopColor="var(--color-gold)" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default StudyHistoryChart;
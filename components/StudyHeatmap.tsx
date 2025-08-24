import React, { useMemo } from 'react';
import { StudySession } from '../types';

interface StudyHeatmapProps {
    sessions: StudySession[];
    color: string; // expecting hsl(h, s%, l%)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const StudyHeatmap: React.FC<StudyHeatmapProps> = ({ sessions, color }) => {
    const chartData = useMemo(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 120); // Approx 4 months
        startDate.setHours(0, 0, 0, 0);

        const sessionsByDate = new Map<string, number>();
        sessions.forEach(session => {
            // Dates are stored as 'YYYY-MM-DD', which can be parsed into local time.
            // Using toDateString() normalizes this to a consistent key like "Mon Apr 29 2024"
            const dateKey = new Date(session.date + 'T00:00:00').toDateString();
            const currentDuration = sessionsByDate.get(dateKey) || 0;
            sessionsByDate.set(dateKey, currentDuration + session.duration);
        });
        
        const days = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const maxDuration = Math.max(...sessionsByDate.values(), 1);

        const monthLabels = [];
        let lastMonth = -1;
        
        const firstDayOfWeek = startDate.getDay();
        const weeksCount = Math.ceil((days.length + firstDayOfWeek) / 7);

        for (let i = 0; i < weeksCount; i++) {
            const dayIndex = i * 7 - firstDayOfWeek;
            const day = days[dayIndex];
            if (day) {
                const month = day.getMonth();
                if (month !== lastMonth) {
                    monthLabels.push({ month: MONTHS[month], weekIndex: i });
                    lastMonth = month;
                }
            }
        }

        return { days, sessionsByDate, maxDuration, monthLabels, firstDayOfWeek };

    }, [sessions]);


    if (!sessions || sessions.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 rounded-lg">
                <p className="text-slate-500 text-center">Log study sessions to see your consistency over time.</p>
            </div>
        );
    }
    
    const baseColorMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    const [h, s] = baseColorMatch ? [baseColorMatch[1], baseColorMatch[2]] : [200, 70];
    
    const { days, sessionsByDate, maxDuration, monthLabels, firstDayOfWeek } = chartData;
    const weeksCount = Math.ceil((days.length + firstDayOfWeek) / 7);
    const cellSize = 12;
    const cellGap = 3;

    return (
        <div className="text-slate-400 text-xs">
            <svg width="100%" viewBox={`0 0 ${weeksCount * (cellSize + cellGap) + 30} 120`}>
                {/* Month Labels */}
                {monthLabels.map(({ month, weekIndex }) => (
                    <text key={month} x={30 + weekIndex * (cellSize + cellGap)} y="12" fill="currentColor" className="text-xs">
                        {month}
                    </text>
                ))}
                
                {/* Weekday Labels */}
                <g transform="translate(0, 20)">
                    <text x="5" y={cellSize} dy="0.3em" fill="currentColor">M</text>
                    <text x="5" y={cellSize * 3 + cellGap * 2} dy="0.3em" fill="currentColor">W</text>
                    <text x="5" y={cellSize * 5 + cellGap * 4} dy="0.3em" fill="currentColor">F</text>
                </g>
                
                <g transform="translate(30, 20)">
                    {days.map((day, index) => {
                        const dayOfWeek = day.getDay();
                        const weekIndex = Math.floor((index + firstDayOfWeek) / 7);
                        const duration = sessionsByDate.get(day.toDateString()) || 0;
                        const opacity = duration > 0 ? 0.2 + (duration / maxDuration) * 0.8 : 0.05;

                        return (
                            <rect
                                key={day.toISOString()}
                                x={weekIndex * (cellSize + cellGap)}
                                y={dayOfWeek * (cellSize + cellGap)}
                                width={cellSize}
                                height={cellSize}
                                rx="2"
                                ry="2"
                                fill={`hsla(${h}, ${s}%, 50%, ${opacity})`}
                                data-date={day.toDateString()}
                                data-duration={duration}
                            >
                                <title>{`${day.toLocaleDateString()}: ${duration} minutes`}</title>
                            </rect>
                        );
                    })}
                </g>
            </svg>
             <div className="flex justify-end items-center gap-2 mt-2">
                <span>Less</span>
                <div className="flex">
                    {[0.05, 0.25, 0.5, 0.75, 1].map(o => (
                        <div key={o} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `hsla(${h}, ${s}%, 50%, ${o})` }}></div>
                    ))}
                </div>
                <span>More</span>
            </div>
        </div>
    );
};

export default StudyHeatmap;
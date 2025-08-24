
import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface CalendarProps {
    sessionsByDay: Map<string, { totalMinutes: number }>;
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ sessionsByDay, selectedDate, onDateSelect }) => {
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

    const maxMinutes = useMemo(() => {
        return Math.max(1, ...Array.from(sessionsByDay.values()).map(d => d.totalMinutes));
    }, [sessionsByDay]);

    const calendarGrid = useMemo(() => {
        const year = currentMonthDate.getFullYear();
        const month = currentMonthDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const grid: (Date | null)[] = Array(firstDayOfMonth).fill(null);
        for (let i = 1; i <= daysInMonth; i++) {
            grid.push(new Date(year, month, i));
        }
        return grid;
    }, [currentMonthDate]);

    const changeMonth = (offset: number) => {
        setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const getDayStyle = (date: Date | null) => {
        if (!date) return { backgroundColor: 'transparent' };
        
        const dayData = sessionsByDay.get(date.toDateString());
        if (!dayData || dayData.totalMinutes === 0) {
            return { backgroundColor: 'rgba(148, 163, 184, 0.05)' }; // slate-400 with opacity
        }
        
        const intensity = Math.min(1, dayData.totalMinutes / (maxMinutes * 0.8)); // reach max color before hitting absolute max
        const opacity = 0.2 + (intensity * 0.8);

        return { backgroundColor: `hsla(51, 100%, 50%, ${opacity})` }; // Gold color hsla
    };

    return (
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-1 text-slate-400 hover:text-white"><ChevronLeftIcon /></button>
                <h3 className="font-bold text-lg text-slate-200">
                    {currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => changeMonth(1)} className="p-1 text-slate-400 hover:text-white"><ChevronRightIcon /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {calendarGrid.map((date, index) => {
                    const isSelected = date && date.toDateString() === selectedDate.toDateString();
                    return (
                        <div key={index} className="aspect-square">
                            {date && (
                                <button
                                    onClick={() => onDateSelect(date)}
                                    className={`w-full h-full flex items-center justify-center rounded-md transition-all text-sm
                                        ${isSelected ? 'ring-2 ring-sky-400 text-white font-bold' : 'text-slate-300 hover:bg-slate-700'}`
                                    }
                                    style={getDayStyle(date)}
                                >
                                    {date.getDate()}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Calendar;
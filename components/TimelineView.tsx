
import React, { useState, useMemo } from 'react';
import { StudySession } from '../types';
import Calendar from './Calendar';
import DailyTimeline from './DailyTimeline';
import SubjectPieChart from './SubjectPieChart';

interface TimelineViewProps {
    allSessions: StudySession[];
    onDeleteStudySession: (subjectId: string, chapterId: string, sessionId: string) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ allSessions, onDeleteStudySession }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const sessionsByDay = useMemo(() => {
        const map = new Map<string, { totalMinutes: number }>();
        allSessions.forEach(session => {
            const dateKey = new Date(session.date + 'T00:00:00').toDateString();
            const existing = map.get(dateKey) || { totalMinutes: 0 };
            existing.totalMinutes += session.duration;
            map.set(dateKey, existing);
        });
        return map;
    }, [allSessions]);

    const sessionsOnSelectedDate = useMemo(() => {
        const dateKey = selectedDate.toDateString();
        return allSessions.filter(s => new Date(s.date + 'T00:00:00').toDateString() === dateKey);
    }, [allSessions, selectedDate]);

    const stats = useMemo(() => {
        const today = new Date();
        const selectedDayKey = selectedDate.toDateString();

        // Daily
        const dailyMinutes = sessionsOnSelectedDate.reduce((sum, s) => sum + s.duration, 0);

        // Weekly
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const weeklyMinutes = allSessions
            .filter(s => new Date(s.date + 'T00:00:00') >= startOfWeek)
            .reduce((sum, s) => sum + s.duration, 0);

        // Monthly
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthlyMinutes = allSessions
            .filter(s => new Date(s.date + 'T00:00:00') >= startOfMonth)
            .reduce((sum, s) => sum + s.duration, 0);

        return {
            dailyHours: (dailyMinutes / 60).toFixed(1),
            weeklyHours: (weeklyMinutes / 60).toFixed(1),
            monthlyHours: (monthlyMinutes / 60).toFixed(1),
        };
    }, [allSessions, selectedDate, sessionsOnSelectedDate]);

    const subjectDataForPieChart = useMemo(() => {
        const subjectMap = new Map<string, { value: number; color: string }>();
        sessionsOnSelectedDate.forEach(session => {
            const existing = subjectMap.get(session.subjectName) || { value: 0, color: session.subjectColor };
            existing.value += session.duration;
            subjectMap.set(session.subjectName, existing);
        });
        return Array.from(subjectMap.entries()).map(([name, data]) => ({ name, ...data }));
    }, [sessionsOnSelectedDate]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flair-card p-4 text-center">
                    <p className="text-3xl font-bold">{stats.dailyHours}<span className="text-lg text-slate-400">h</span></p>
                    <p className="text-sm text-slate-400">Studied Today</p>
                </div>
                <div className="flair-card p-4 text-center">
                    <p className="text-3xl font-bold">{stats.weeklyHours}<span className="text-lg text-slate-400">h</span></p>
                    <p className="text-sm text-slate-400">This Week</p>
                </div>
                <div className="flair-card p-4 text-center">
                    <p className="text-3xl font-bold">{stats.monthlyHours}<span className="text-lg text-slate-400">h</span></p>
                    <p className="text-sm text-slate-400">This Month</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <Calendar sessionsByDay={sessionsByDay} selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                </div>
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-bold mb-2 text-slate-200">Subject Breakdown for {selectedDate.toLocaleDateString()}</h3>
                    <SubjectPieChart data={subjectDataForPieChart} />
                </div>
            </div>

            <div>
                <DailyTimeline sessions={sessionsOnSelectedDate} selectedDate={selectedDate} onDeleteSession={onDeleteStudySession} />
            </div>
        </div>
    );
};

export default TimelineView;
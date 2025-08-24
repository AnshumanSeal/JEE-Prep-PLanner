
import React, { useMemo } from 'react';
import { ScheduleItem, Subject } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import ScheduleForm from './ScheduleForm';
import GoogleCalendarManager from './GoogleCalendarManager';

interface SchedulerProps {
    subjects: Subject[];
    schedule: ScheduleItem[];
    onAddToSchedule: (subjectId: string, chapterId: string, date: string, startTime: string, endTime:string, bookId?: string, bookQuestionRange?: { start: number, end: number }, exerciseNumber?: string) => void;
    onRemoveFromSchedule: (chapterId: string, startTime: Date) => void;
    onCompleteSession: (chapterId: string, startTime: Date) => void;
    onViewChapter: (subjectId: string, chapterId: string) => void;
    onUpdateScheduleItem: (chapterId: string, startTime: Date, updatedData: Partial<ScheduleItem>) => void;
}

const Scheduler: React.FC<SchedulerProps> = ({ subjects, schedule, onAddToSchedule, onRemoveFromSchedule, onCompleteSession, onViewChapter, onUpdateScheduleItem }) => {
    const now = useMemo(() => new Date(), []);

    const groupedSchedule = schedule.reduce((acc, item) => {
        const dateKey = item.startTime.toDateString();
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(item);
        return acc;
    }, {} as Record<string, ScheduleItem[]>);

    return (
        <div>
            <div className="mb-6">
                <ScheduleForm
                    subjects={subjects}
                    schedule={schedule}
                    onAddToSchedule={onAddToSchedule}
                />
            </div>
            
            <div className="mb-6">
                <GoogleCalendarManager schedule={schedule} onUpdateScheduleItem={onUpdateScheduleItem} />
            </div>

            {schedule.length > 0 ? (
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 mt-8">
                    {Object.entries(groupedSchedule).map(([date, items]) => (
                        <div key={date}>
                            <h4 className="font-bold text-lg text-slate-300 mb-2">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                            <ul className="space-y-2">
                                {items.map((item, index) => {
                                    const isPast = now > item.startTime;
                                    const isCompleted = !!item.completed;
                                    const subjectColor = subjects.find(s=>s.id === item.subjectId)?.color || '#64748b';
                                    
                                    return (
                                    <li key={item.chapterId + item.startTime.toISOString()} 
                                        className={`p-3 rounded-lg flex items-center justify-between gap-3 transition-all duration-300 ease-out border-l-4 animate-in ${isCompleted ? 'schedule-item-completed' : 'bg-slate-800/80 interactive-list-item'}`}
                                        style={{ borderColor: subjectColor, animationDelay: `${index * 50}ms` }}
                                        >
                                        <div className="flex items-center gap-4 flex-grow">
                                            <span className={`font-mono text-sm bg-slate-900/50 px-2 py-1 rounded ${isCompleted ? 'text-slate-500' : 'text-slate-300'}`}>
                                                {item.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {item.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <div className="flex-grow">
                                                <button 
                                                    onClick={() => onViewChapter(item.subjectId, item.chapterId)}
                                                    className={`font-semibold text-left transition-colors focus:outline-none focus-visible:underline schedule-item-name ${isCompleted ? '' : 'text-slate-200 hover:text-sky-300'}`}
                                                    disabled={isCompleted}
                                                    aria-label={`View details for ${item.chapter}`}
                                                >
                                                    {item.chapter}
                                                </button>
                                                <p className={`text-sm ${isCompleted ? 'text-slate-500' : 'text-slate-400'}`}>{item.subject}</p>
                                                {item.book && (
                                                    <p className={`text-xs italic ${isCompleted ? 'text-sky-400/40' : 'text-sky-400/80'}`}>
                                                        {item.book}
                                                        {item.exerciseNumber && ` (Ex: ${item.exerciseNumber})`}
                                                        {item.bookQuestionRange && ` (Q: ${item.bookQuestionRange.start}-${item.bookQuestionRange.end})`}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button 
                                                onClick={() => onCompleteSession(item.chapterId, item.startTime)}
                                                className={`p-1 transition-colors ${isCompleted ? 'cursor-default' : isPast ? 'text-slate-500' : 'text-slate-600 cursor-not-allowed'}`}
                                                style={isCompleted ? { color: 'var(--color-green)' } : { '--hover-color': 'var(--color-green)' } as React.CSSProperties}
                                                onMouseOver={e => { if(!isCompleted && isPast) e.currentTarget.style.color = 'var(--hover-color)'}}
                                                onMouseOut={e => { if(!isCompleted && isPast) e.currentTarget.style.color = ''}}
                                                title={isCompleted ? 'Session completed' : isPast ? 'Mark session as complete' : 'Cannot complete a future session'}
                                                disabled={isCompleted || !isPast}
                                                aria-label="Complete Session"
                                            >
                                                <CheckCircleIcon className="w-6 h-6" />
                                            </button>
                                            <button 
                                                onClick={() => onRemoveFromSchedule(item.chapterId, item.startTime)}
                                                className="text-slate-500 transition-colors p-1"
                                                style={{'--hover-color': 'var(--color-red)'} as React.CSSProperties}
                                                onMouseOver={e => e.currentTarget.style.color = 'var(--hover-color)'}
                                                onMouseOut={e => e.currentTarget.style.color = ''}
                                                title="Remove from schedule"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </li>
                                )})}
                            </ul>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-slate-400">
                    <p>Your schedule is empty.</p>
                    <p>Use the form above to add chapters to your schedule.</p>
                </div>
            )}
        </div>
    );
};

export default Scheduler;
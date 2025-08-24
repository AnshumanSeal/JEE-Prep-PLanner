
import React from 'react';
import { StudySession } from '../types';
import { ClockIcon } from './icons/ClockIcon';
import { TrashIcon } from './icons/TrashIcon';

interface DailyTimelineProps {
    sessions: StudySession[];
    selectedDate: Date;
    onDeleteSession: (subjectId: string, chapterId: string, sessionId: string) => void;
}

const DailyTimeline: React.FC<DailyTimelineProps> = ({ sessions, selectedDate, onDeleteSession }) => {
    return (
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <h3 className="text-lg font-bold mb-4 text-slate-200">Sessions for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {sessions.length > 0 ? (
                    sessions.map((session, index) => (
                        <div key={session.id} 
                             className="p-3 rounded-lg flex items-center gap-4 border-l-4 animate-in group"
                             style={{ borderColor: session.subjectColor, animationDelay: `${index * 50}ms` }}
                        >
                            <div className="bg-slate-800/60 p-2 rounded-full">
                                <ClockIcon className="w-6 h-6" style={{ color: session.subjectColor }} />
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold text-slate-200">{session.chapterName}</p>
                                <p className="text-sm" style={{ color: session.subjectColor }}>{session.subjectName}</p>
                                {session.book && (
                                    <p className="text-xs italic text-sky-400/80">
                                        {session.book}
                                        {session.exerciseNumber && ` (Ex: ${session.exerciseNumber})`}
                                        {session.bookQuestionRange && ` (Q: ${session.bookQuestionRange.start}-${session.bookQuestionRange.end})`}
                                    </p>
                                )}
                            </div>
                            <div className="text-right flex-shrink-0 flex items-center gap-2">
                                <div>
                                    <p className="font-bold text-lg text-white">{session.duration}</p>
                                    <p className="text-sm text-slate-400">minutes</p>
                                </div>
                                <button 
                                    onClick={() => onDeleteSession(session.subjectId, session.chapterId, session.id)}
                                    className="text-slate-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                                    style={{'--hover-color': 'var(--color-red)'} as React.CSSProperties}
                                    onMouseOver={e => e.currentTarget.style.color = 'var(--hover-color)'}
                                    onMouseOut={e => e.currentTarget.style.color = ''}
                                    title="Delete this log"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-500">
                        <p>No study sessions logged for this day.</p>
                        <p>Select another day on the calendar or log a new session.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyTimeline;
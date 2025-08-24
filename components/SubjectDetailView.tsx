
import React, { useMemo } from 'react';
import { Subject, ChapterStatus } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ClockIcon } from './icons/ClockIcon';
import StudyHistoryChart from './StudyHistoryChart';
import StudyHeatmap from './StudyHeatmap';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { CheckBadgeIcon } from './icons/CheckBadgeIcon';

interface SubjectDetailViewProps {
    subject: Subject;
    onBack: () => void;
    onViewChapter: (subjectId: string, chapterId: string) => void;
}

const SubjectDetailView: React.FC<SubjectDetailViewProps> = ({ 
    subject, onBack, onViewChapter
}) => {

    const subjectStats = useMemo(() => {
        const totalChapters = subject.chapters.length;
        const completedChapters = subject.chapters.filter(c => c.status === ChapterStatus.Completed).length;
        const allSessions = subject.chapters.flatMap(c => c.studySessions || []);
        const totalMinutes = allSessions.reduce((acc, session) => acc + session.duration, 0);
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        
        return { totalChapters, completedChapters, allSessions, totalMinutes, totalHours, remainingMinutes };
    }, [subject]);

    const { totalChapters, completedChapters, allSessions, totalHours, remainingMinutes } = subjectStats;

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 animate-in">
                    <button onClick={onBack} className="flex items-center gap-2 text-sky-400 hover:text-sky-300 font-semibold mb-4 transition-colors">
                        <ArrowLeftIcon />
                        Back to Overview
                    </button>
                    <h1 className="text-4xl sm:text-5xl font-bold" style={{ color: subject.color }}>{subject.name}</h1>
                    <p className="mt-1 text-xl text-slate-400">Overall Subject Progress</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column / Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Chapter List */}
                        <div className="flair-card p-6 rounded-xl animate-in" style={{animationDelay: '100ms'}}>
                             <h2 className="text-xl font-bold mb-4 text-sky-400">Chapter Breakdown</h2>
                             <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {subject.chapters.length > 0 ? subject.chapters.map((chapter, index) => {
                                    const chapterMinutes = (chapter.studySessions || []).reduce((acc, s) => acc + s.duration, 0);
                                    const chapterHours = Math.floor(chapterMinutes / 60);
                                    const chapterRemMinutes = chapterMinutes % 60;
                                    return (
                                        <div key={chapter.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/70 flex justify-between items-center transition-all interactive-list-item animate-in" style={{animationDelay: `${index * 40}ms`}}>
                                            <button onClick={() => onViewChapter(subject.id, chapter.id)} className="text-left text-slate-300 hover:text-sky-400 transition-colors focus:outline-none">
                                                <p className="font-semibold">{chapter.name}</p>
                                                <p className="text-xs" style={{color: subject.color}}>{chapter.status}</p>
                                            </button>
                                            <div className="text-right text-sm text-slate-400">
                                                <span className="font-semibold text-base text-slate-200">{chapterHours}h {chapterRemMinutes}m</span>
                                                <p>studied</p>
                                            </div>
                                        </div>
                                    )
                                }) : (
                                    <p className="text-slate-500 text-center py-4">No chapters added for this subject yet.</p>
                                )}
                             </div>
                        </div>

                         {/* Study Consistency */}
                        <div className="flair-card p-6 rounded-xl animate-in" style={{animationDelay: '200ms'}}>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-sky-400"><CalendarDaysIcon /> Subject Study Consistency</h2>
                            <StudyHeatmap sessions={allSessions} color={subject.color} />
                        </div>
                    </div>

                    {/* Right Column / Stats */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Stats Cards */}
                         <div className="space-y-4">
                            <div className="flair-card p-4 rounded-xl flex items-center gap-4 animate-in" style={{animationDelay: '150ms'}}>
                                <div className="p-3 bg-sky-500/10 rounded-lg"><ListBulletIcon className="w-6 h-6 text-sky-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold">{totalChapters}</p>
                                    <p className="text-slate-400 text-sm">Total Chapters</p>
                                </div>
                            </div>
                            <div className="flair-card p-4 rounded-xl flex items-center gap-4 animate-in" style={{animationDelay: '250ms'}}>
                                <div className="p-3 bg-sky-500/10 rounded-lg"><CheckBadgeIcon className="w-6 h-6 text-sky-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold">{completedChapters}</p>
                                    <p className="text-slate-400 text-sm">Completed Chapters</p>
                                </div>
                            </div>
                             <div className="flair-card p-4 rounded-xl flex items-center gap-4 animate-in" style={{animationDelay: '350ms'}}>
                                <div className="p-3 bg-sky-500/10 rounded-lg"><ClockIcon className="w-6 h-6 text-sky-400" /></div>
                                <div>
                                    <p className="text-2xl font-bold">{totalHours}<span className="text-lg text-slate-400">h</span> {remainingMinutes}<span className="text-lg text-slate-400">m</span></p>
                                    <p className="text-slate-400 text-sm">Total Study Time</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Weekly Activity */}
                        <div className="flair-card p-6 rounded-xl animate-in" style={{animationDelay: '550ms'}}>
                           <h2 className="text-xl font-bold mb-4 text-sky-400">Weekly Activity</h2>
                           <StudyHistoryChart sessions={allSessions} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SubjectDetailView;
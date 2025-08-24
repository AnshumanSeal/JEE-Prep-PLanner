import React, { useState, useMemo, useEffect } from 'react';
import { Subject, Chapter, StudySession, BookProgress, QuestionRange, ChapterBookInfo } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { PencilIcon } from './icons/PencilIcon';
import StudyHistoryChart from './StudyHistoryChart';
import BookTrackerModal from './BookTrackerModal';
import StudyHeatmap from './StudyHeatmap';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { TargetIcon } from './icons/TargetIcon';
import { PencilSwooshIcon } from './icons/PencilSwooshIcon';
import CircularProgressBar from './CircularProgressBar';


interface ChapterDetailViewProps {
    subject: Subject;
    chapter: Chapter;
    onBack: () => void;
    onUpdateBookProgress: (subjectId: string, chapterId: string, bookId: string, newRange: QuestionRange) => void;
    onUpdateChapterBookInfo: (subjectId: string, chapterId: string, bookId: string, bookInfo: ChapterBookInfo) => void;
    onUpdateChapterDetails: (subjectId: string, chapterId: string, details: { targetMinutes?: number; notes?: string }) => void;
}

const ChapterDetailView: React.FC<ChapterDetailViewProps> = ({ 
    subject, chapter, onBack, onUpdateBookProgress, onUpdateChapterBookInfo, onUpdateChapterDetails
}) => {
    const [isBookModalOpen, setIsBookModalOpen] = useState(false);
    
    const [notesInput, setNotesInput] = useState(chapter.notes || '');
    const [isEditingTarget, setIsEditingTarget] = useState(false);
    const [targetInput, setTargetInput] = useState(chapter.targetMinutes ? String(chapter.targetMinutes / 60) : '');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');


    useEffect(() => {
        setNotesInput(chapter.notes || '');
        setTargetInput(chapter.targetMinutes ? String(chapter.targetMinutes / 60) : '');
    }, [chapter]);

    const totalMinutes = useMemo(() => {
        return (chapter.studySessions || []).reduce((acc, session) => acc + session.duration, 0);
    }, [chapter.studySessions]);

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    const goalProgress = useMemo(() => {
        if (!chapter.targetMinutes || chapter.targetMinutes === 0) return 0;
        return Math.min((totalMinutes / chapter.targetMinutes) * 100, 100);
    }, [totalMinutes, chapter.targetMinutes]);
    
    const booksWithProgress = useMemo(() => {
        return (chapter.bookProgress || []).filter(bp => bp.percentage > 0).sort((a,b) => b.percentage - a.percentage);
    }, [chapter.bookProgress]);

    const handleSaveNotes = () => {
        onUpdateChapterDetails(subject.id, chapter.id, { notes: notesInput });
        setSaveStatus('saving');
        setTimeout(() => setSaveStatus('saved'), 500);
        setTimeout(() => setSaveStatus('idle'), 2000);
    };

    const handleSaveTarget = () => {
        const hours = parseFloat(targetInput);
        let newTargetMinutes: number | undefined;
        if (!isNaN(hours) && hours > 0) {
            newTargetMinutes = Math.round(hours * 60);
        } else {
            newTargetMinutes = undefined;
        }
        onUpdateChapterDetails(subject.id, chapter.id, { targetMinutes: newTargetMinutes });
        setIsEditingTarget(false);
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 animate-in">
                    <button onClick={onBack} className="flex items-center gap-2 text-sky-400 hover:text-sky-300 font-semibold mb-4 transition-colors">
                        <ArrowLeftIcon />
                        Back to Subject View
                    </button>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-100">{chapter.name}</h1>
                    <p className="mt-1 text-xl" style={{ color: subject.color }}>{subject.name}</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                         {/* Study Goal Card */}
                        <div className="flair-card p-6 rounded-xl animate-in" style={{animationDelay: '100ms'}}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-sky-400"><TargetIcon /> Study Goal</h2>
                                <button onClick={() => setIsEditingTarget(!isEditingTarget)} className="text-slate-400 hover:text-sky-300 p-1" title="Edit Goal">
                                    <PencilIcon />
                                </button>
                            </div>
                            {isEditingTarget ? (
                                <div className="space-y-2">
                                     <label htmlFor="target-hours" className="block text-sm font-medium text-slate-400">Set Target (in hours)</label>
                                     <input id="target-hours" type="number" value={targetInput} onChange={(e) => setTargetInput(e.target.value)} placeholder="e.g., 10" />
                                     <button onClick={handleSaveTarget} className="w-full btn-gradient-primary">Set Goal</button>
                                </div>
                            ) : (
                                chapter.targetMinutes ? (
                                    <div className="flex flex-col items-center">
                                        <CircularProgressBar progress={goalProgress} size={120} strokeWidth={10} color={subject.color} />
                                        <p className="mt-3 text-lg font-semibold">{totalHours}h {remainingMinutes}m / {chapter.targetMinutes/60}h</p>
                                        <p className="text-sm text-slate-400">studied</p>
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-500">
                                        <p>No study goal set.</p>
                                        <button onClick={() => setIsEditingTarget(true)} className="text-sky-400 hover:underline">Set a goal</button>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Completed Books Card */}
                        <div className="flair-card p-6 rounded-xl animate-in" style={{animationDelay: '200ms'}}>
                             <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-sky-400"><CheckCircleIcon /> Book Progress</h2>
                                <button onClick={() => setIsBookModalOpen(true)} className="text-slate-400 hover:text-sky-300 p-1" title="Edit Book Progress">
                                    <PencilIcon />
                                </button>
                            </div>
                            {booksWithProgress.length > 0 ? (
                                <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                    {booksWithProgress.map((book) => (
                                        <li key={book.bookId} className="bg-slate-700/50 p-2 rounded-md text-slate-300 text-sm flex justify-between items-center">
                                            <span>{book.name}</span>
                                            <span className={`font-semibold`} style={{ color: book.percentage === 100 ? 'var(--color-green)' : 'var(--color-gold)' }}>{book.percentage}%</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500 text-sm">No book progress logged yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                         {/* Total Time & Chart */}
                        <div className="flair-card p-6 rounded-xl animate-in" style={{animationDelay: '150ms'}}>
                             <h2 className="text-xl font-bold mb-2 text-sky-400">Total Study Time</h2>
                             <p className="text-4xl font-bold text-white mb-6">
                                {totalHours}<span className="text-2xl text-slate-400">h</span> {remainingMinutes}<span className="text-2xl text-slate-400">m</span>
                            </p>
                            <h2 className="text-xl font-bold mb-4 text-sky-400 mt-8">Weekly Activity</h2>
                           <StudyHistoryChart sessions={chapter.studySessions || []} />
                        </div>
                         {/* Study Consistency */}
                        <div className="flair-card p-6 rounded-xl animate-in" style={{animationDelay: '250ms'}}>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-sky-400"><CalendarDaysIcon /> Study Consistency</h2>
                            <StudyHeatmap sessions={chapter.studySessions || []} color={subject.color} />
                        </div>
                        {/* Chapter Notes */}
                        <div className="flair-card p-6 rounded-xl animate-in" style={{animationDelay: '350ms'}}>
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-sky-400"><PencilSwooshIcon /> Chapter Notes</h2>
                            <textarea
                                value={notesInput}
                                onChange={(e) => setNotesInput(e.target.value)}
                                placeholder="Add your notes, key formulas, or tricky concepts here..."
                                className="h-48 resize-none"
                            />
                             <button onClick={handleSaveNotes} className="btn-gradient-primary w-full mt-4" disabled={saveStatus !== 'idle'}>
                                {saveStatus === 'idle' && 'Save Notes'}
                                {saveStatus === 'saving' && 'Saving...'}
                                {saveStatus === 'saved' && 'Notes Saved!'}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
            {isBookModalOpen && (
                <BookTrackerModal
                    subject={subject}
                    chapter={chapter}
                    onClose={() => setIsBookModalOpen(false)}
                    onSave={onUpdateBookProgress}
                    onUpdateBookInfo={onUpdateChapterBookInfo}
                />
            )}
        </div>
    );
};

export default ChapterDetailView;
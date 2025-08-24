import React, { useState } from 'react';
import { Subject, Chapter, ChapterStatus, BookProgress, QuestionRange, ChapterBookInfo } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import BookTrackerModal from './BookTrackerModal';

interface ProgressDashboardProps {
    subjects: Subject[];
    totalChapters: number;
    completedChapters: number;
    onUpdateChapterStatus: (subjectId: string, chapterId: string, status: ChapterStatus) => void;
    onUpdateBookProgress: (subjectId: string, chapterId: string, bookId: string, newRange: QuestionRange) => void;
    onUpdateChapterBookInfo: (subjectId: string, chapterId: string, bookId: string, bookInfo: ChapterBookInfo) => void;
    onViewChapter: (subjectId: string, chapterId: string) => void;
    onViewSubject: (subjectId: string) => void;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ subjects, totalChapters, completedChapters, onUpdateChapterStatus, onUpdateBookProgress, onUpdateChapterBookInfo, onViewChapter, onViewSubject }) => {
    const [editingChapter, setEditingChapter] = useState<{subject: Subject, chapter: Chapter} | null>(null);

    const overallProgress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
    
    const getStatusStyle = (status: ChapterStatus) => {
        switch (status) {
            case ChapterStatus.Completed: return { color: 'var(--color-green)' };
            case ChapterStatus.InProgress: return { color: 'var(--color-gold)' };
            case ChapterStatus.NotStarted: return { color: 'var(--color-text-secondary)' };
            default: return { color: 'var(--color-text-secondary)' };
        }
    }

    return (
        <div>
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-slate-200"><BookOpenIcon /> Overall Progress</h3>
                <div className="flex items-center gap-4">
                    <div className="w-full bg-slate-800 rounded-full h-4 progress-bar-shine">
                        <div
                            className="progress-bar-fill h-4 rounded-full transition-all duration-500"
                            style={{ width: `${overallProgress}%` }}
                        ></div>
                    </div>
                    <span className="font-bold text-lg whitespace-nowrap">{Math.round(overallProgress)}%</span>
                </div>
                <p className="text-slate-400 text-sm mt-1">{completedChapters} of {totalChapters} chapters completed.</p>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {subjects.map(subject => {
                    const subjectTotal = subject.chapters.length;
                    const subjectCompleted = subject.chapters.filter(c => c.status === ChapterStatus.Completed).length;
                    const subjectProgress = subjectTotal > 0 ? (subjectCompleted / subjectTotal) * 100 : 0;
                    return (
                        <div key={subject.id}>
                            <div className="flex justify-between items-center mb-2">
                                <button onClick={() => onViewSubject(subject.id)} className="text-left focus:outline-none focus-visible:underline">
                                    <h4 className="text-lg font-semibold hover:underline" style={{ color: subject.color }}>{subject.name}</h4>
                                </button>
                                <span className="text-sm font-medium text-slate-400">{Math.round(subjectProgress)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2.5 mb-3 progress-bar-shine">
                                <div className="h-2.5 rounded-full" style={{ width: `${subjectProgress}%`, backgroundColor: subject.color }}></div>
                            </div>
                            <ul className="space-y-2">
                                {subject.chapters.map((chapter, index) => (
                                    <li key={chapter.id} 
                                        className="bg-slate-800/50 rounded-lg flex justify-between items-center border-l-[3px] interactive-list-item animate-in"
                                        style={{borderColor: subject.color, animationDelay: `${index * 30}ms`}}
                                    >
                                        <button 
                                            onClick={() => onViewChapter(subject.id, chapter.id)}
                                            className="text-left text-slate-300 hover:text-sky-300 transition-colors focus:outline-none focus-visible:underline flex-grow py-3 pl-4"
                                            aria-label={`View details for ${chapter.name}`}
                                        >
                                            {chapter.name}
                                        </button>
                                        <div className="flex items-center gap-2 pr-3">
                                            <button 
                                                onClick={() => setEditingChapter({subject, chapter})}
                                                className="flex items-center gap-1.5 text-slate-400 hover:text-sky-300 p-1 text-xs font-medium transition-colors"
                                                title="Track book progress"
                                            >
                                                <ClipboardListIcon />
                                                <span>({chapter.bookProgress?.filter(bp => bp.percentage === 100).length || 0})</span>
                                            </button>
                                            <select
                                                value={chapter.status}
                                                onChange={(e) => onUpdateChapterStatus(subject.id, chapter.id, e.target.value as ChapterStatus)}
                                                className="py-1 text-xs font-semibold focus:outline-none"
                                                style={getStatusStyle(chapter.status)}
                                            >
                                                <option style={{color: 'var(--color-text-secondary)'}} value={ChapterStatus.NotStarted}>Not Started</option>
                                                <option style={{color: 'var(--color-gold)'}} value={ChapterStatus.InProgress}>In Progress</option>
                                                <option style={{color: 'var(--color-green)'}} value={ChapterStatus.Completed}>Completed</option>
                                            </select>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>

            {editingChapter && (
                <BookTrackerModal 
                    subject={editingChapter.subject}
                    chapter={editingChapter.chapter}
                    onClose={() => setEditingChapter(null)}
                    onSave={onUpdateBookProgress}
                    onUpdateBookInfo={onUpdateChapterBookInfo}
                />
            )}
        </div>
    );
};

export default ProgressDashboard;
import React, { useState, useMemo, useEffect } from 'react';
import { Subject, Chapter, QuestionRange, Book, ChapterBookInfo } from '../types';
import BookChapterInfoForm from './BookChapterInfoForm';

interface BookTrackerModalProps {
    subject: Subject;
    chapter: Chapter;
    onClose: () => void;
    onSave: (subjectId: string, chapterId: string, bookId: string, newRange: QuestionRange) => void;
    onUpdateBookInfo: (subjectId: string, chapterId: string, bookId: string, bookInfo: ChapterBookInfo) => void;
}

const BookTrackerModal: React.FC<BookTrackerModalProps> = ({ subject, chapter, onClose, onSave, onUpdateBookInfo }) => {
    const [selectedBookId, setSelectedBookId] = useState<string>('');
    const [startQ, setStartQ] = useState('');
    const [endQ, setEndQ] = useState('');
    const [error, setError] = useState('');

    const selectedBook = useMemo(() => subject.books?.find(b => b.id === selectedBookId), [subject.books, selectedBookId]);
    const bookInfo = useMemo(() => chapter.bookInfo?.[selectedBookId], [chapter.bookInfo, selectedBookId]);
    const bookProgress = useMemo(() => chapter.bookProgress?.find(bp => bp.bookId === selectedBookId), [chapter.bookProgress, selectedBookId]);

    useEffect(() => {
        if (subject.books && subject.books.length > 0 && !selectedBookId) {
            setSelectedBookId(subject.books[0].id);
        }
    }, [subject.books, selectedBookId]);

    const handleSave = () => {
        const start = parseInt(startQ, 10);
        const end = parseInt(endQ, 10);
        setError('');

        if (isNaN(start) || isNaN(end) || start <= 0 || end <= 0) {
            setError("Please enter valid positive numbers for questions.");
            return;
        }
        if (start > end) {
            setError("Start question cannot be greater than end question.");
            return;
        }
        if (bookInfo && end > bookInfo.totalQuestions) {
             if (!window.confirm(`Warning: The end question (${end}) is higher than the detected total questions (${bookInfo.totalQuestions}). Do you want to proceed?`)) {
                return;
             }
        }
        if (selectedBookId) {
            onSave(subject.id, chapter.id, selectedBookId, { start, end });
            setStartQ('');
            setEndQ('');
        }
    };
    
    const handleSaveBookInfo = (bookInfo: ChapterBookInfo) => {
        onUpdateBookInfo(subject.id, chapter.id, selectedBookId, bookInfo);
    };

    const renderBookContent = () => {
        if (!selectedBook) return <p className="text-slate-500 text-center py-4">No book selected or available.</p>;

        if (!bookInfo) {
            return (
                <>
                    <h4 className="font-semibold text-slate-300 mb-2">Set Exercise Details for {selectedBook?.name}</h4>
                    <p className="text-slate-400 mb-3 text-sm">This must be done once per book for this chapter.</p>
                    <BookChapterInfoForm onSave={handleSaveBookInfo} />
                </>
            );
        }

        return (
            <div>
                <div className="flex justify-between items-baseline mb-4 bg-slate-900/50 p-3 rounded-lg">
                    <h4 className="font-semibold text-slate-300">Progress for <span className="text-sky-400">{selectedBook.name}</span></h4>
                    <p className="text-sm text-slate-400">Total Questions: <span className="font-bold text-white">{bookInfo.totalQuestions}</span></p>
                </div>

                <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                         <label className="block text-sm font-medium text-slate-400">Log Completed Questions</label>
                         <span className="text-lg font-bold" style={{color: subject.color}}>{bookProgress?.percentage || 0}%</span>
                    </div>
                     <div className="w-full bg-slate-800 rounded-full h-2.5 progress-bar-shine">
                        <div className="h-2.5 rounded-full" style={{ width: `${bookProgress?.percentage || 0}%`, backgroundColor: subject.color }}></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                    <input type="number" value={startQ} onChange={e => setStartQ(e.target.value)} placeholder="Start Q#" min="1" />
                    <input type="number" value={endQ} onChange={e => setEndQ(e.target.value)} placeholder="End Q#" min="1" />
                </div>
                {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}
                <button onClick={handleSave} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-3 rounded-md transition-colors" disabled={!startQ || !endQ}>Add Range</button>

                <div className="mt-4">
                    <h5 className="text-sm font-medium text-slate-400 mb-2">Completed Ranges:</h5>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-2">
                        {bookProgress && bookProgress.completedRanges.length > 0 ? (
                             [...bookProgress.completedRanges].sort((a,b)=>a.start-b.start).map((range, i) => (
                                <div key={i} className="bg-slate-800/70 text-xs text-center p-1 rounded-md text-slate-300">
                                    Questions {range.start} to {range.end}
                                </div>
                            ))
                        ) : <p className="text-xs text-slate-500 text-center">No ranges logged yet.</p>}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="flair-card p-6 rounded-lg max-w-lg w-full modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-sky-400 mb-1">Track Book Progress</h3>
                <p className="text-slate-400 mb-4 text-sm">For: <span className="font-semibold">{chapter.name}</span></p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="book-select" className="block text-sm font-medium text-slate-400 mb-1">Select Book</label>
                        <select id="book-select" value={selectedBookId} onChange={e => setSelectedBookId(e.target.value)}>
                            {subject.books?.map(book => <option key={book.id} value={book.id}>{book.name}</option>)}
                        </select>
                    </div>
                    {renderBookContent()}
                </div>

                <div className="mt-6 flex gap-3">
                    <button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg w-full transition-colors">Done</button>
                </div>
            </div>
        </div>
    );
};

export default BookTrackerModal;
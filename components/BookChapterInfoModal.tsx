import React from 'react';
import { Subject, Chapter, Book, ChapterBookInfo } from '../types';
import BookChapterInfoForm from './BookChapterInfoForm';

interface BookChapterInfoModalProps {
    subject: Subject;
    chapter: Chapter;
    book: Book;
    onClose: () => void;
    onSave: (subjectId: string, chapterId: string, bookId: string, bookInfo: ChapterBookInfo) => void;
}

const BookChapterInfoModal: React.FC<BookChapterInfoModalProps> = ({ subject, chapter, book, onClose, onSave }) => {

    const handleSave = (bookInfo: ChapterBookInfo) => {
        onSave(subject.id, chapter.id, book.id, bookInfo);
        onClose();
    };

    const initialInfo = chapter.bookInfo?.[book.id];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="flair-card p-6 rounded-lg max-w-lg w-full modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-sky-400 mb-1">Set Exercise Details</h3>
                <p className="text-slate-400 mb-2 text-sm">For: <span className="font-semibold">{book.name}</span></p>
                <p className="text-slate-400 mb-4 text-sm">Chapter: <span className="font-semibold">{chapter.name}</span></p>

                <BookChapterInfoForm 
                    initialExercises={initialInfo?.exercises}
                    onSave={handleSave}
                    buttonText="Save & Close"
                />

                <div className="mt-6 flex gap-3">
                    <button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg w-full transition-colors">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default BookChapterInfoModal;

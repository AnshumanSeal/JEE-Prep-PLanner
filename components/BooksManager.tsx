import React, { useState } from 'react';
import { Subject, Book, Chapter, ChapterBookInfo } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { BookStackIcon } from './icons/BookStackIcon';
import BookChapterInfoModal from './BookChapterInfoModal';

interface BooksManagerProps {
    subjects: Subject[];
    onAddBook: (subjectId: string, bookName: string) => void;
    onRemoveBook: (subjectId: string, bookId: string) => void;
    onUpdateChapterBookInfo: (subjectId: string, chapterId: string, bookId: string, bookInfo: ChapterBookInfo) => void;
}

const BooksManager: React.FC<BooksManagerProps> = ({ subjects, onAddBook, onRemoveBook, onUpdateChapterBookInfo }) => {
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
    const [newBookName, setNewBookName] = useState('');
    const [editingInfo, setEditingInfo] = useState<{ subject: Subject, chapter: Chapter, book: Book } | null>(null);

    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

    const handleAddBook = (e: React.FormEvent) => {
        e.preventDefault();
        if (newBookName.trim() && selectedSubjectId) {
            onAddBook(selectedSubjectId, newBookName.trim());
            setNewBookName('');
        }
    };

    return (
        <div className="h-[70vh] flex flex-col md:flex-row gap-6">
            {/* Subject Selector */}
            <div className="md:w-1/3 flex flex-col">
                <h3 className="text-xl font-bold mb-4 text-slate-200">Select Subject</h3>
                <div className="flex-grow space-y-2 pr-2 overflow-y-auto">
                    {subjects.map(subject => (
                        <button
                            key={subject.id}
                            onClick={() => setSelectedSubjectId(subject.id)}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 border-l-4 ${selectedSubjectId === subject.id ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800/50 hover:bg-slate-700/50'}`}
                            style={{ borderColor: selectedSubjectId === subject.id ? subject.color : 'transparent' }}
                        >
                            <span className="font-semibold">{subject.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Books & Chapters View */}
            <div className="md:w-2/3 flex flex-col">
                <h3 className="text-xl font-bold mb-4 text-slate-200 flex items-center gap-2"><BookStackIcon /> Books for {selectedSubject?.name || '...'}</h3>
                {!selectedSubject ? (
                    <div className="flex-grow flex items-center justify-center text-slate-500">
                        <p>Select a subject to manage its books.</p>
                    </div>
                ) : (
                    <div className="flex-grow space-y-6 overflow-y-auto pr-2">
                        {/* Add book form */}
                        <div>
                            <form onSubmit={handleAddBook} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newBookName}
                                    onChange={(e) => setNewBookName(e.target.value)}
                                    placeholder="Add a new book..."
                                    className="flex-grow"
                                />
                                <button type="submit" className="btn-gradient-primary flex items-center justify-center p-2.5" disabled={!newBookName.trim()}>
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                            </form>
                        </div>

                        {/* Books List */}
                        <div className="space-y-4">
                            {(selectedSubject.books || []).length > 0 ? (selectedSubject.books || []).map(book => (
                                <div key={book.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/70">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold text-sky-400">{book.name}</h4>
                                        <button onClick={() => onRemoveBook(selectedSubject.id, book.id)} className="text-slate-500 hover:text-red-400 p-1" title="Remove Book">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                        <p className="text-sm text-slate-400 mb-2">Configure exercises per chapter:</p>
                                        {selectedSubject.chapters.length > 0 ? selectedSubject.chapters.map(chapter => {
                                            const bookInfo = chapter.bookInfo?.[book.id];
                                            const totalQuestions = bookInfo?.totalQuestions || 0;
                                            return (
                                                <div key={chapter.id} className="flex justify-between items-center bg-slate-800/60 p-2 rounded text-sm group">
                                                    <span>{chapter.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs ${totalQuestions > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                            {totalQuestions > 0 ? `${totalQuestions} Qs` : 'Not Set'}
                                                        </span>
                                                        <button onClick={() => setEditingInfo({ subject: selectedSubject, chapter, book })} className="text-slate-400 hover:text-sky-300 transition-colors p-1 opacity-0 group-hover:opacity-100" title="Edit Exercises">
                                                            <PencilIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        }) : <p className="text-sm text-slate-500 italic">Add chapters in 'Manage Chapters' to configure them here.</p>}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center text-slate-500 py-8">
                                    <p>No books added for this subject yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {editingInfo && (
                <BookChapterInfoModal
                    subject={editingInfo.subject}
                    chapter={editingInfo.chapter}
                    book={editingInfo.book}
                    onClose={() => setEditingInfo(null)}
                    onSave={onUpdateChapterBookInfo}
                />
            )}
        </div>
    );
};

export default BooksManager;

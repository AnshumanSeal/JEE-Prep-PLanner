import React, { useState } from 'react';
import { Subject, Book } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { BookStackIcon } from './icons/BookStackIcon';

interface SubjectBooksModalProps {
    subject: Subject;
    onClose: () => void;
    onAddBook: (subjectId: string, bookName: string) => void;
    onRemoveBook: (subjectId: string, bookId: string) => void;
}

const SubjectBooksModal: React.FC<SubjectBooksModalProps> = ({ subject, onClose, onAddBook, onRemoveBook }) => {
    const [newBookName, setNewBookName] = useState('');
    const subjectBooks = subject.books || [];

    const handleAddBook = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedBookName = newBookName.trim();
        if (trimmedBookName && !subjectBooks.some(b => b.name.toLowerCase() === trimmedBookName.toLowerCase())) {
            onAddBook(subject.id, trimmedBookName);
            setNewBookName('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="flair-card p-6 rounded-lg max-w-lg w-full modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-sky-400 mb-1 flex items-center gap-2"><BookStackIcon /> Manage Subject Books</h3>
                <p className="text-slate-400 mb-4">For: <span className="font-semibold" style={{color: subject.color}}>{subject.name}</span></p>

                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Add New Book</label>
                         <form onSubmit={handleAddBook} className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newBookName}
                                onChange={(e) => setNewBookName(e.target.value)}
                                placeholder="e.g., H.C. Verma"
                                className="flex-grow"
                            />
                            <button
                                type="submit"
                                className="bg-sky-500 hover:bg-sky-600 text-white font-bold p-2 rounded-md transition-colors flex-shrink-0 flex items-center justify-center disabled:bg-slate-600 disabled:cursor-not-allowed"
                                disabled={!newBookName.trim()}
                                aria-label="Add Book"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </form>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 bg-slate-900/50 p-3 rounded-md border border-slate-700 min-h-[6rem]">
                            {subjectBooks.length > 0 ? subjectBooks.map((book) => (
                                <div key={book.id} className="flex items-center justify-between gap-3 p-2 rounded-md bg-slate-800/60 group">
                                    <span className="text-slate-300 text-sm break-all">{book.name}</span>
                                    <button onClick={() => onRemoveBook(subject.id, book.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1 opacity-50 group-hover:opacity-100" aria-label={`Remove ${book.name}`}>
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )) : (
                                <div className="flex items-center justify-center h-full py-4">
                                    <p className="text-slate-500 text-center text-sm">No reference books added yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg w-full transition-colors">Done</button>
                </div>
            </div>
        </div>
    );
};

export default SubjectBooksModal;


import React, { useState } from 'react';
import { Subject, Chapter } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import ChapterEditModal from './ChapterEditModal';

interface SubjectManagerProps {
    subjects: Subject[];
    onAddChapter: (subjectId: string, chapterData: { name: string }) => void;
    onUpdateChapter: (subjectId: string, chapterId: string, chapterData: { name: string }) => void;
    onDeleteChapter: (subjectId: string, chapterId: string) => void;
    onViewChapter: (subjectId: string, chapterId: string) => void;
}

const SubjectManager: React.FC<SubjectManagerProps> = ({ subjects, onAddChapter, onUpdateChapter, onDeleteChapter, onViewChapter }) => {
    const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
    const [editingChapterContext, setEditingChapterContext] = useState<{ subject: Subject; chapter?: Chapter } | null>(null);

    const handleOpenChapterModal = (subject: Subject, chapter?: Chapter) => {
        setEditingChapterContext({ subject, chapter });
        setIsChapterModalOpen(true);
    };

    const handleCloseChapterModal = () => {
        setIsChapterModalOpen(false);
        setEditingChapterContext(null);
    };

    const handleSaveChapter = (chapterData: { name: string; }) => {
        if (editingChapterContext) {
            if (editingChapterContext.chapter) {
                onUpdateChapter(editingChapterContext.subject.id, editingChapterContext.chapter.id, chapterData);
            } else {
                onAddChapter(editingChapterContext.subject.id, chapterData);
            }
        }
        handleCloseChapterModal();
    };
    
    return (
        <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-4 text-sky-400">Manage Chapters</h2>
            
            <div className="space-y-4 overflow-y-auto flex-grow pr-2">
                {subjects.map(subject => (
                    <div key={subject.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/70">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xl font-semibold" style={{ color: subject.color }}>{subject.name}</h3>
                            <button 
                                onClick={() => handleOpenChapterModal(subject)}
                                className="btn-gradient-primary text-sm p-1 px-3 flex items-center justify-center gap-1"
                            >
                                <PlusIcon className="w-4 h-4" /> Add Chapter
                            </button>
                        </div>

                        {subject.chapters.length > 0 ? (
                            <ul className="space-y-2 mb-3 max-h-80 overflow-y-auto pr-2">
                                {subject.chapters.map((chapter, index) => (
                                    <li key={chapter.id} className="flex justify-between items-center bg-slate-800/60 p-2 rounded group interactive-list-item animate-in" style={{animationDelay: `${index * 30}ms`}}>
                                        <button 
                                            onClick={() => onViewChapter(subject.id, chapter.id)}
                                            className="text-left text-slate-300 hover:text-sky-300 transition-colors focus:outline-none focus-visible:underline flex-grow"
                                            aria-label={`View details for ${chapter.name}`}
                                        >
                                            {chapter.name}
                                        </button>
                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenChapterModal(subject, chapter)} className="text-slate-400 hover:text-sky-400 transition-colors p-1" title="Edit Chapter">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => onDeleteChapter(subject.id, chapter.id)} className="text-slate-400 hover:text-red-400 transition-colors p-1" title="Delete Chapter">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-2">No chapters added yet.</p>
                        )}
                    </div>
                ))}
            </div>
            {isChapterModalOpen && editingChapterContext && (
                <ChapterEditModal 
                    subject={editingChapterContext.subject}
                    chapterToEdit={editingChapterContext.chapter}
                    onSave={handleSaveChapter}
                    onClose={handleCloseChapterModal}
                />
            )}
        </div>
    );
};

export default SubjectManager;

import React, { useState } from 'react';
import { Subject, Chapter } from '../types';

interface ChapterEditModalProps {
    subject: Subject;
    chapterToEdit?: Chapter;
    onClose: () => void;
    onSave: (chapterData: { name: string }) => void;
}

const ChapterEditModal: React.FC<ChapterEditModalProps> = ({ subject, chapterToEdit, onClose, onSave }) => {
    const [name, setName] = useState(chapterToEdit?.name || '');

    const handleSave = () => {
        if (name.trim()) {
            onSave({ name: name.trim() });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="flair-card p-6 rounded-lg max-w-lg w-full modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-sky-400 mb-1">{chapterToEdit ? 'Edit Chapter' : 'Add New Chapter'}</h3>
                <p className="text-slate-400 mb-4">in <span className="font-semibold" style={{color: subject.color}}>{subject.name}</span></p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="chapter-name" className="block text-sm font-medium text-slate-400 mb-1">Chapter Name</label>
                        <input
                            id="chapter-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Kinematics"
                        />
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg w-full transition-colors">Cancel</button>
                    <button onClick={handleSave} className="btn-gradient-primary w-full" disabled={!name.trim()}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default ChapterEditModal;
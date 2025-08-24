import React, { useState } from 'react';
import { ChapterBookInfo } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface BookChapterInfoFormProps {
    initialExercises?: { number: string; count: number }[];
    onSave: (bookInfo: ChapterBookInfo) => void;
    buttonText?: string;
}

const BookChapterInfoForm: React.FC<BookChapterInfoFormProps> = ({ initialExercises = [], onSave, buttonText = "Save Exercise Info" }) => {
    const [manualExercises, setManualExercises] = useState(initialExercises.length > 0 ? initialExercises.map(ex => ({...ex, count: String(ex.count)})) : [{ number: '', count: '' }]);

    const handleExerciseChange = (index: number, field: 'number' | 'count', value: string) => {
        const newExercises = [...manualExercises];
        newExercises[index][field] = value;
        setManualExercises(newExercises);
    };

    const handleAddExerciseRow = () => {
        setManualExercises([...manualExercises, { number: '', count: '' }]);
    };

    const handleRemoveExerciseRow = (index: number) => {
        const newExercises = manualExercises.filter((_, i) => i !== index);
        setManualExercises(newExercises);
    };

    const handleSaveBookInfo = () => {
        const exercises = manualExercises
            .map(e => ({ number: e.number.trim(), count: parseInt(e.count, 10) }))
            .filter(e => e.number && !isNaN(e.count) && e.count > 0);
        
        if (exercises.length === 0) {
            alert('Please enter at least one valid exercise.');
            return;
        }

        const totalQuestions = exercises.reduce((sum, e) => sum + e.count, 0);
        const newBookInfo: ChapterBookInfo = { totalQuestions, exercises };
        
        onSave(newBookInfo);
    };
    
    const isSaveBookInfoDisabled = manualExercises.every(e => !e.number.trim() || !e.count.trim() || parseInt(e.count, 10) <= 0);

    return (
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/70">
            <p className="text-sm text-slate-400 mb-3">Enter the exercises and the number of questions for each.</p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {manualExercises.map((ex, index) => (
                    <div key={index} className="flex items-center gap-2 animate-in" style={{animationDelay: `${index * 50}ms`}}>
                        <input type="text" value={ex.number} onChange={e => handleExerciseChange(index, 'number', e.target.value)} placeholder="Exercise # (e.g., 1.1)" className="flex-grow"/>
                        <input type="number" value={ex.count} onChange={e => handleExerciseChange(index, 'count', e.target.value)} placeholder="No. of Qs" className="w-28" min="1"/>
                        {manualExercises.length > 1 && (
                            <button onClick={() => handleRemoveExerciseRow(index)} className="text-slate-500 hover:text-red-400 p-1 transition-colors flex-shrink-0">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={handleAddExerciseRow} className="text-sky-400 hover:text-sky-300 text-sm mt-3 font-semibold transition-colors flex items-center gap-1">
                <PlusIcon className="w-4 h-4"/> Add another exercise
            </button>
            <button onClick={handleSaveBookInfo} disabled={isSaveBookInfoDisabled} className="btn-gradient-primary w-full mt-4">{buttonText}</button>
        </div>
    );
};

export default BookChapterInfoForm;

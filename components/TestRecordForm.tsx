
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Subject, TestType, TestRecord } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrophyIcon } from './icons/TrophyIcon';

const TEST_CONFIG = {
  [TestType.DAT]: { totalQuestions: 10, subjects: 'single', chapters: 'single' },
  [TestType.WAT]: { totalQuestions: 25, subjects: 'single', chapters: 'multiple' },
  [TestType.MAT]: { totalQuestions: 75, subjects: 'multiple', chapters: 'multiple' },
  [TestType.FLT]: { totalQuestions: 75, subjects: 'multiple', chapters: 'multiple' },
} as const;

interface TestRecordFormProps {
    subjects: Subject[];
    onAddTestRecord: (record: Omit<TestRecord, 'id'>) => void;
}

const MultiSelectDropdown: React.FC<{
    options: { id: string; name: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder: string;
    disabled?: boolean;
}> = ({ options, selected, onChange, placeholder, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref]);

    const handleSelect = (id: string) => {
        const newSelected = selected.includes(id)
            ? selected.filter(s => s !== id)
            : [...selected, id];
        onChange(newSelected);
    };

    return (
        <div className="relative" ref={ref}>
            <button type="button" onClick={() => !disabled && setIsOpen(!isOpen)} disabled={disabled} className="w-full text-left bg-slate-800 border border-slate-700 rounded-lg p-3 h-[45.8px]">
                {selected.length > 0 ? `${selected.length} selected` : <span className="text-slate-500">{placeholder}</span>}
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg max-h-60 overflow-y-auto">
                    {options.map(option => (
                        <label key={option.id} className="flex items-center gap-2 p-2 hover:bg-slate-800 cursor-pointer">
                            <input type="checkbox" checked={selected.includes(option.id)} onChange={() => handleSelect(option.id)} className="form-checkbox bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500/50" />
                            <span>{option.name}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

const TestRecordForm: React.FC<TestRecordFormProps> = ({ subjects, onAddTestRecord }) => {
    const [type, setType] = useState<TestType>(TestType.DAT);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [subjectIds, setSubjectIds] = useState<string[]>([]);
    const [chapterIds, setChapterIds] = useState<string[]>([]);
    const [correct, setCorrect] = useState('');
    const [wrong, setWrong] = useState('');
    const [unattempted, setUnattempted] = useState('');
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState('');

    const config = TEST_CONFIG[type];

    useEffect(() => {
        setSubjectIds([]);
        setChapterIds([]);
        setError('');
    }, [type]);
    
    useEffect(() => {
        setChapterIds([]);
    }, [subjectIds]);

    const chapterOptions = useMemo(() => {
        if (subjectIds.length === 0) return [];
        return subjects
            .filter(s => subjectIds.includes(s.id))
            .flatMap(s => s.chapters);
    }, [subjects, subjectIds]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const c = parseInt(correct, 10);
        const w = parseInt(wrong, 10);
        const u = parseInt(unattempted, 10);

        if (isNaN(c) || isNaN(w) || isNaN(u) || c<0 || w<0 || u<0) {
            setError('Please enter valid numbers for results.');
            return;
        }

        if (c + w + u !== config.totalQuestions) {
            setError(`The sum of correct, wrong, and unattempted must be ${config.totalQuestions}.`);
            return;
        }
        
        if (subjectIds.length === 0 || chapterIds.length === 0) {
            setError('Please select subjects and chapters.');
            return;
        }
        
        onAddTestRecord({
            type,
            date,
            subjectIds,
            chapterIds,
            correct: c,
            wrong: w,
            unattempted: u,
            score: c * 4 - w * 1,
            totalQuestions: config.totalQuestions,
            remarks: remarks.trim() ? remarks.trim() : undefined,
        });
        
        // Reset form
        setSubjectIds([]);
        setChapterIds([]);
        setCorrect('');
        setWrong('');
        setUnattempted('');
        setRemarks('');
    };
    
    const score = useMemo(() => {
        const c = parseInt(correct, 10);
        const w = parseInt(wrong, 10);
        if (!isNaN(c) && !isNaN(w)) {
            return c * 4 - w * 1;
        }
        return null;
    }, [correct, wrong]);

    return (
        <form onSubmit={handleFormSubmit} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2"><TrophyIcon /> Add Test Record</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Test Type</label>
                    <select value={type} onChange={e => setType(e.target.value as TestType)}>
                        {Object.values(TestType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Subject(s)</label>
                    {config.subjects === 'single' ? (
                         <select value={subjectIds[0] || ''} onChange={e => setSubjectIds(e.target.value ? [e.target.value] : [])}>
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    ) : (
                        <MultiSelectDropdown options={subjects} selected={subjectIds} onChange={setSubjectIds} placeholder="Select Subjects" />
                    )}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Chapter(s)</label>
                    {config.chapters === 'single' ? (
                        <select value={chapterIds[0] || ''} onChange={e => setChapterIds(e.target.value ? [e.target.value] : [])} disabled={subjectIds.length === 0}>
                            <option value="">Select Chapter</option>
                            {chapterOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    ) : (
                        <MultiSelectDropdown options={chapterOptions} selected={chapterIds} onChange={setChapterIds} placeholder="Select Chapters" disabled={subjectIds.length === 0} />
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Correct</label>
                    <input type="number" value={correct} onChange={e => setCorrect(e.target.value)} min="0" max={config.totalQuestions} placeholder="e.g. 5" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Wrong</label>
                    <input type="number" value={wrong} onChange={e => setWrong(e.target.value)} min="0" max={config.totalQuestions} placeholder="e.g. 2" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Unattempted</label>
                    <input type="number" value={unattempted} onChange={e => setUnattempted(e.target.value)} min="0" max={config.totalQuestions} placeholder="e.g. 3" />
                </div>
                <div className="text-center bg-slate-800/50 p-2 rounded-lg h-[45.8px] flex flex-col justify-center">
                    <span className="text-sm text-slate-400">Score</span>
                    <span className="font-bold text-lg text-white">{score ?? '--'} / {config.totalQuestions * 4}</span>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Remarks (Optional)</label>
                <textarea
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="Any notes about this test? e.g., 'Silly mistakes in mechanics', 'Time management was an issue'"
                    className="h-20 resize-y"
                />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full btn-gradient-primary flex items-center justify-center gap-2">
                <PlusIcon className="w-5 h-5" /> Add Record
            </button>
        </form>
    );
};

export default TestRecordForm;
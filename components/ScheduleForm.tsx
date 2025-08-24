

import React, { useState, useMemo, useEffect } from 'react';
import { ScheduleItem, Subject } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { PlusIcon } from './icons/PlusIcon';

interface ScheduleFormProps {
    subjects: Subject[];
    schedule: ScheduleItem[];
    onAddToSchedule: (subjectId: string, chapterId: string, date: string, startTime: string, endTime:string, bookId?: string, bookQuestionRange?: { start: number, end: number }, exerciseNumber?: string) => void;
    onScheduleAdded?: () => void;
    initialSubjectId?: string;
    initialChapterId?: string;
    isChapterLocked?: boolean;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ 
    subjects, 
    schedule, 
    onAddToSchedule, 
    onScheduleAdded,
    initialSubjectId = '',
    initialChapterId = '',
    isChapterLocked = false
}) => {
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId);
    const [selectedChapterId, setSelectedChapterId] = useState<string>(initialChapterId);
    const [selectedBookId, setSelectedBookId] = useState<string>('');
    const [selectedExercise, setSelectedExercise] = useState<string>('');
    const [startQ, setStartQ] = useState('');
    const [endQ, setEndQ] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedStartTime, setSelectedStartTime] = useState('09:00');
    const [selectedDuration, setSelectedDuration] = useState('60');

    useEffect(() => {
        setSelectedSubjectId(initialSubjectId);
        setSelectedChapterId(initialChapterId);
    }, [initialSubjectId, initialChapterId]);

    const selectedSubject = useMemo(() => subjects.find(s => s.id === selectedSubjectId), [subjects, selectedSubjectId]);
    const selectedChapter = useMemo(() => selectedSubject?.chapters.find(c => c.id === selectedChapterId), [selectedSubject, selectedChapterId]);
    const bookInfo = useMemo(() => selectedChapter?.bookInfo?.[selectedBookId], [selectedChapter, selectedBookId]);

    const exercisesWithRanges = useMemo(() => {
        if (!bookInfo?.exercises || bookInfo.exercises.length === 0) return [];
        let cumulativeQuestions = 0;
        return bookInfo.exercises.map(ex => {
            const start = cumulativeQuestions + 1;
            const end = cumulativeQuestions + ex.count;
            cumulativeQuestions = end;
            return { ...ex, start, end };
        });
    }, [bookInfo]);

    const selectedExerciseData = useMemo(() => {
        if (!selectedExercise) return null;
        return exercisesWithRanges.find(ex => ex.number === selectedExercise);
    }, [exercisesWithRanges, selectedExercise]);


    useEffect(() => {
        if (selectedExercise && exercisesWithRanges.length > 0) {
            const exerciseData = exercisesWithRanges.find(ex => ex.number === selectedExercise);
            if (exerciseData) {
                setStartQ(String(exerciseData.start));
                setEndQ(String(exerciseData.end));
            }
        } else {
            setStartQ('');
            setEndQ('');
        }
    }, [selectedExercise, exercisesWithRanges]);

    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSubjectId(e.target.value);
        setSelectedChapterId('');
        setSelectedBookId('');
        setSelectedExercise('');
        setStartQ('');
        setEndQ('');
    };
    
    const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedChapterId(e.target.value);
        setSelectedBookId('');
        setSelectedExercise('');
        setStartQ('');
        setEndQ('');
    };

    const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBookId(e.target.value);
        setSelectedExercise('');
    };

    const handleAddClick = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSubjectId && selectedChapterId && selectedDate && selectedStartTime && selectedDuration) {
            let questionRange;
            if (selectedBookId && startQ && endQ) {
                const start = parseInt(startQ, 10);
                const end = parseInt(endQ, 10);
                if (isNaN(start) || isNaN(end) || start <= 0 || end < start) {
                    alert('Please enter a valid question range.');
                    return;
                }

                if (selectedExerciseData) {
                    if (start < selectedExerciseData.start || end > selectedExerciseData.end || start > end) {
                        alert(`The question range must be a valid sub-range within the selected exercise's range (${selectedExerciseData.start}-${selectedExerciseData.end}).`);
                        return;
                    }
                } else if (bookInfo && end > bookInfo.totalQuestions) {
                     if (!window.confirm(`Warning: The end question (${end}) is higher than the total questions for this chapter-book combo (${bookInfo.totalQuestions}). Do you want to proceed?`)) {
                        return;
                    }
                }

                questionRange = { start, end };
            }

            const durationMinutes = parseInt(selectedDuration, 10);
            if (isNaN(durationMinutes) || durationMinutes <= 0) return;

            const startDate = new Date(`${selectedDate}T${selectedStartTime}:00`);
            const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
            const endTimeString = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

            onAddToSchedule(selectedSubjectId, selectedChapterId, selectedDate, selectedStartTime, endTimeString, selectedBookId, questionRange, selectedExercise || undefined);
            
            if (!isChapterLocked) {
                setSelectedChapterId('');
                setSelectedBookId('');
            }
            setSelectedExercise('');
            setStartQ('');
            setEndQ('');
            if(onScheduleAdded) onScheduleAdded();
        }
    };
    
    return (
        <form onSubmit={handleAddClick} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            {!isChapterLocked && <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><CalendarIcon /> Add to Schedule</h3>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <div className="lg:col-span-1">
                    <label htmlFor="subject-select" className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
                    <select id="subject-select" value={selectedSubjectId} onChange={handleSubjectChange} disabled={isChapterLocked}>
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="lg:col-span-2">
                    <label htmlFor="chapter-select" className="block text-sm font-medium text-slate-400 mb-1">Chapter</label>
                    <select id="chapter-select" value={selectedChapterId} onChange={handleChapterChange} disabled={isChapterLocked || !selectedSubjectId}>
                         <option value="">Select Chapter</option>
                        {selectedSubject?.chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                     <div className="md:col-span-1">
                        <label htmlFor="book-select" className="block text-sm font-medium text-slate-400 mb-1">Book (Optional)</label>
                        <select id="book-select" value={selectedBookId} onChange={handleBookChange} disabled={!selectedChapterId}>
                            <option value="">{selectedSubjectId && !selectedSubject?.books?.length ? 'No books for subject' : 'Select Book'}</option>
                            {selectedSubject?.books?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    {exercisesWithRanges.length > 0 && (
                        <div className="md:col-span-2">
                            <label htmlFor="exercise-select" className="block text-sm font-medium text-slate-400 mb-1">Exercise</label>
                            <select id="exercise-select" value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} disabled={!selectedBookId}>
                                <option value="">Manual Q# Range</option>
                                {exercisesWithRanges.map(ex => <option key={ex.number} value={ex.number}>{`Ex ${ex.number} (Q ${ex.start}-${ex.end})`}</option>)}
                            </select>
                        </div>
                    )}
                </div>
                 <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                            <label htmlFor="start-q" className="block text-sm font-medium text-slate-400 mb-1">Start Q#</label>
                             {selectedExerciseData ? (
                                <span className="text-xs text-sky-400/80">Ex Range: {selectedExerciseData.start}-{selectedExerciseData.end}</span>
                            ) : (
                                bookInfo && <span className="text-xs text-slate-500">Total: {bookInfo.totalQuestions}</span>
                            )}
                        </div>
                        <input type="number" id="start-q" value={startQ} onChange={e => setStartQ(e.target.value)} placeholder="e.g., 1" disabled={!selectedBookId} />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="end-q" className="block text-sm font-medium text-slate-400 mb-1">End Q#</label>
                        <input type="number" id="end-q" value={endQ} onChange={e => setEndQ(e.target.value)} placeholder="e.g., 25" disabled={!selectedBookId} />
                    </div>
                </div>

                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <div className="">
                        <label htmlFor="schedule-date" className="block text-sm font-medium text-slate-400 mb-1">Date</label>
                        <input type="date" id="schedule-date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                    </div>
                    <div className="">
                        <label htmlFor="schedule-start-time" className="block text-sm font-medium text-slate-400 mb-1">Start Time</label>
                        <input type="time" id="schedule-start-time" value={selectedStartTime} onChange={(e) => setSelectedStartTime(e.target.value)} />
                    </div>
                    <div className="">
                        <label htmlFor="schedule-duration" className="block text-sm font-medium text-slate-400 mb-1">Duration (min)</label>
                        <input type="number" id="schedule-duration" value={selectedDuration} onChange={(e) => setSelectedDuration(e.target.value)} min="1" placeholder="e.g., 60" />
                    </div>
                    <button type="submit" disabled={!selectedChapterId || !selectedDate} className="w-full btn-gradient-primary flex items-center justify-center gap-2">
                        <PlusIcon className="w-5 h-5" /> Add
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ScheduleForm;

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Subject, QuestionRange, TimelineEvent } from '../types';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { CoffeeIcon } from './icons/CoffeeIcon';
import BreakReasonModal from './BreakReasonModal';
import { XMarkIcon } from './icons/XMarkIcon';

interface StudyTimerProps {
    subjects: Subject[];
    onSessionComplete: (subjectId: string, chapterId: string, startTime: Date, durationInMinutes: number, bookId?: string, bookQuestionRange?: QuestionRange, exerciseNumber?: string) => void;
    onClose: () => void;
}

const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
};

const StudyTimer: React.FC<StudyTimerProps> = ({ subjects, onSessionComplete, onClose }) => {
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [selectedChapterId, setSelectedChapterId] = useState<string>('');
    const [selectedBookId, setSelectedBookId] = useState<string>('');
    const [selectedExercise, setSelectedExercise] = useState<string>('');
    const [startQ, setStartQ] = useState('');
    const [endQ, setEndQ] = useState('');

    const [time, setTime] = useState(0); // in seconds
    const [isActive, setIsActive] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    
    const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
    const [pauseStartTime, setPauseStartTime] = useState<Date | null>(null);

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
        if (selectedExerciseData) {
            setStartQ(String(selectedExerciseData.start));
            setEndQ(String(selectedExerciseData.end));
        } else {
            setStartQ('');
            setEndQ('');
        }
    }, [selectedExerciseData]);


    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => setTime(prev => prev + 1), 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) };
    }, [isActive]);
    
    const handleClose = () => {
        if (isActive || (!isActive && time > 0)) {
            if (window.confirm('Are you sure you want to abandon this study session? Progress will be lost.')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const handleStart = () => {
        setTimeline(prev => [...prev, {
            timestamp: new Date(),
            type: 'start',
            message: 'Session Started'
        }]);
        setIsActive(true);
        setStartTime(new Date());
    };

    const handlePause = () => {
        setTimeline(prev => [...prev, {
            timestamp: new Date(),
            type: 'pause',
            message: 'Session Paused'
        }]);
        setIsActive(false);
        setPauseStartTime(new Date());
    };
    
    const handleResumeClick = () => {
        setIsBreakModalOpen(true);
    };

    const handleSaveBreakAndResume = (reason: string) => {
        setIsBreakModalOpen(false);
        if (pauseStartTime) {
            const breakDuration = Math.round((new Date().getTime() - pauseStartTime.getTime()) / 1000); // in seconds
            setTimeline(prev => [...prev, {
                timestamp: new Date(),
                type: 'break',
                message: `Break: ${reason}`,
                duration: breakDuration,
            }]);
        }
        
        setTimeline(prev => [...prev, {
            timestamp: new Date(),
            type: 'resume',
            message: 'Session Resumed'
        }]);
        setIsActive(true);
        setPauseStartTime(null);
    };

    const handleFinish = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsActive(false);
        
        if (startTime && selectedSubjectId && selectedChapterId && time > 0) {
            const durationInMinutes = Math.floor(time / 60);
            if (durationInMinutes > 0) {
                let questionRange;
                if (selectedBookId && startQ && endQ) {
                    const start = parseInt(startQ, 10);
                    const end = parseInt(endQ, 10);
                    if (isNaN(start) || isNaN(end) || start <= 0 || end < start) {
                        alert('Please enter a valid question range.');
                        return;
                    }
                    
                    if (selectedExerciseData) {
                        if (start < selectedExerciseData.start || end > selectedExerciseData.end) {
                            alert(`The question range must be within the selected exercise's range (${selectedExerciseData.start}-${selectedExerciseData.end}).`);
                            return;
                        }
                    } else if (bookInfo && end > bookInfo.totalQuestions) {
                         if (!window.confirm(`Warning: The end question (${end}) is higher than the total questions for this chapter-book combo (${bookInfo.totalQuestions}). Do you want to proceed?`)) {
                            return;
                         }
                    }
                    questionRange = { start, end };
                }

                onSessionComplete(selectedSubjectId, selectedChapterId, startTime, durationInMinutes, selectedBookId, questionRange, selectedExercise || undefined);
                setTimeline(prev => [...prev, {
                    timestamp: new Date(),
                    type: 'finish',
                    message: `Session saved (${durationInMinutes} min). Great work!`
                }]);
                 setTimeout(() => {
                    setTime(0);
                    setStartTime(null);
                    setTimeline([]);
                    setSelectedBookId('');
                    setStartQ('');
                    setEndQ('');
                    setSelectedExercise('');
                }, 2500);
            } else {
                setTimeline(prev => [...prev, {
                    timestamp: new Date(),
                    type: 'finish',
                    message: 'Session too short to log. Discarded.'
                }]);
                 setTimeout(() => {
                    setTime(0);
                    setStartTime(null);
                    setTimeline([]);
                }, 2500);
            }
        } else if (timeline.length > 0) {
            setTimeline([]);
        }
    };

    const formatTime = (timeInSeconds: number) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;
        return [hours, minutes, seconds].map(v => String(v).padStart(2, '0')).join(':');
    };
    
    const canStart = selectedSubjectId && selectedChapterId;
    const isSessionConfigLocked = isActive || time > 0;
    
    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSubjectId(e.target.value);
        setSelectedChapterId('');
        setSelectedBookId('');
        setSelectedExercise('');
    };
    
    const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedChapterId(e.target.value);
        setSelectedBookId('');
        setSelectedExercise('');
    };

    const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBookId(e.target.value);
        setSelectedExercise('');
    };

    return (
        <div className="flex flex-col h-full">
             <header className="flex-shrink-0 p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-sky-400">Study Timer</h2>
                <button onClick={handleClose} className="text-slate-500 hover:text-white transition-colors z-10" aria-label="Close Timer">
                    <XMarkIcon className="w-8 h-8" />
                </button>
            </header>
            
            <main className="flex-grow overflow-y-auto p-4 sm:p-6">
                 <div className="flex flex-col items-center text-center max-w-sm mx-auto">
                    <div className="mb-6">
                        <p className="text-7xl md:text-8xl font-mono font-bold text-slate-100 tracking-wider">{formatTime(time)}</p>
                    </div>
                    
                    <div className="w-full mb-6">
                        <h3 className="text-lg font-semibold text-slate-300 mb-2 text-left">Session Log</h3>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/70 h-32 overflow-y-auto space-y-2 text-left">
                            {timeline.length > 0 ? (
                                timeline.map((event, index) => (
                                    <div key={index} className="flex items-center gap-3 text-sm animate-in" style={{animationDelay: '50ms'}}>
                                        {event.type === 'start' && <PlayIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                                        {event.type === 'resume' && <PlayIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                                        {event.type === 'pause' && <PauseIcon className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                                        {event.type === 'break' && <CoffeeIcon className="w-4 h-4 text-fuchsia-400 flex-shrink-0" />}
                                        {event.type === 'finish' && <CheckCircleIcon className="w-4 h-4 text-sky-400 flex-shrink-0" />}
                                        <span className="font-mono text-xs text-slate-500">
                                            [{event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                                        </span>
                                        <span className="text-slate-300 flex-grow">{event.message}</span>
                                        {event.type === 'break' && event.duration && (
                                            <span className="text-xs text-fuchsia-400/80 ml-2 font-semibold">({formatDuration(event.duration)})</span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 text-center pt-8">Your session activity will appear here.</p>
                            )}
                        </div>
                    </div>

                    <div className="w-full mb-8 space-y-4">
                        <div>
                            <label htmlFor="timer-subject-select" className="block text-sm font-medium text-slate-400 mb-1 text-left">Subject</label>
                            <select id="timer-subject-select" value={selectedSubjectId} onChange={handleSubjectChange} disabled={isSessionConfigLocked}>
                                <option value="">Select Subject</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="timer-chapter-select" className="block text-sm font-medium text-slate-400 mb-1 text-left">Chapter</label>
                            <select id="timer-chapter-select" value={selectedChapterId} onChange={handleChapterChange} disabled={isSessionConfigLocked || !selectedSubjectId}>
                                <option value="">Select Chapter</option>
                                {selectedSubject?.chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="timer-book-select" className="block text-sm font-medium text-slate-400 mb-1 text-left">Book (Optional)</label>
                            <select id="timer-book-select" value={selectedBookId} onChange={handleBookChange} disabled={isSessionConfigLocked || !selectedChapterId}>
                                <option value="">{selectedSubjectId && !selectedSubject?.books?.length ? 'No books for subject' : 'Select Book'}</option>
                                {selectedSubject?.books?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        {exercisesWithRanges.length > 0 && (
                            <div>
                                <label htmlFor="timer-exercise-select" className="block text-sm font-medium text-slate-400 mb-1 text-left">Exercise</label>
                                <select id="timer-exercise-select" value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} disabled={isSessionConfigLocked || !selectedBookId}>
                                    <option value="">Manual Q# Range</option>
                                    {exercisesWithRanges.map(ex => <option key={ex.number} value={ex.number}>{`Ex ${ex.number} (Q ${ex.start}-${ex.end})`}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <div className="flex justify-between items-baseline">
                                    <label htmlFor="timer-start-q" className="block text-sm font-medium text-slate-400 mb-1 text-left">Start Q#</label>
                                    {selectedExerciseData ? (
                                        <span className="text-xs text-sky-400/80">Ex Range: {selectedExerciseData.start}-{selectedExerciseData.end}</span>
                                    ) : (
                                        bookInfo && <span className="text-xs text-slate-500">Total: {bookInfo.totalQuestions}</span>
                                    )}
                                </div>
                                <input type="number" id="timer-start-q" value={startQ} onChange={e => setStartQ(e.target.value)} placeholder="e.g., 1" disabled={isSessionConfigLocked || !selectedBookId} />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="timer-end-q" className="block text-sm font-medium text-slate-400 mb-1 text-left">End Q#</label>
                                <input type="number" id="timer-end-q" value={endQ} onChange={e => setEndQ(e.target.value)} placeholder="e.g., 25" disabled={isSessionConfigLocked || !selectedBookId} />
                            </div>
                        </div>
                    </div>
                    
                    {!canStart && !isSessionConfigLocked && (
                        <p className="text-yellow-400 text-sm mb-4 animate-in" style={{ animationDelay: '100ms' }}>
                            Please select a subject and chapter to begin.
                        </p>
                    )}
                 </div>
            </main>

            <footer className="flex-shrink-0 p-4 sm:p-6 pt-4 border-t border-slate-700/70 bg-slate-950/80 backdrop-blur-sm sticky bottom-0">
                <div className="flex items-center justify-center gap-4">
                    {!isActive ? (
                        <button onClick={time > 0 ? handleResumeClick : handleStart} disabled={!canStart} className="btn-gradient-primary w-40 h-16 flex items-center justify-center text-xl">{time > 0 ? 'Resume' : 'Start'}</button>
                    ) : (
                        <button onClick={handlePause} className="btn-muted-gold w-40 h-16 flex items-center justify-center text-xl">Pause</button>
                    )}
                    <button onClick={handleFinish} disabled={time === 0} className="btn-dark w-40 h-16 flex items-center justify-center text-xl">Finish & Save</button>
                </div>
            </footer>

            {isBreakModalOpen && pauseStartTime && (
                <BreakReasonModal
                    breakDuration={Math.round((new Date().getTime() - pauseStartTime.getTime()) / 1000)}
                    onClose={() => setIsBreakModalOpen(false)}
                    onSave={handleSaveBreakAndResume}
                />
            )}
        </div>
    );
};

export default StudyTimer;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Subject, Chapter, ChapterStatus, ScheduleItem, StudySession, BookProgress, Book, QuestionRange, ChapterBookInfo, TestRecord } from './types';
import SubjectManager from './components/SubjectManager';
import Scheduler from './components/Scheduler';
import ProgressDashboard from './components/ProgressDashboard';
import ChapterDetailView from './components/ChapterDetailView';
import SubjectDetailView from './components/SubjectDetailView';
import StudyTimer from './components/StudyTimer';
import BooksManager from './components/BooksManager';
import { CalendarIcon } from './components/icons/CalendarIcon';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { ClockIcon } from './components/icons/ClockIcon';
import { BookStackIcon } from './components/icons/BookStackIcon';
import { ChartBarIcon } from './components/icons/ChartBarIcon';
import TimelineView from './components/TimelineView';
import { ListBulletIcon } from './components/icons/ListBulletIcon';
import { ClipboardListIcon } from './components/icons/ClipboardListIcon';
import { HomeIcon } from './components/icons/HomeIcon';
import { CheckCircleIcon } from './components/icons/CheckCircleIcon';
import { TrashIcon } from './components/icons/TrashIcon';
import SubjectsListView from './components/SubjectsListView';
import TestView from './components/TestView';
import { TrophyIcon } from './components/icons/TrophyIcon';

// 🔹 Import Firebase login/logout and db
import { login, logout, auth, db } from "./index";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const PREDEFINED_SUBJECTS: Omit<Subject, 'chapters' | 'color' | 'books'>[] = [
    { id: '1', name: 'Physics' },
    { id: '2', name: 'Mathematics' },
    { id: '3', name: 'Physical Chemistry' },
    { id: '4', name: 'Inorganic Chemistry' },
    { id: '5', name: 'Organic Chemistry' },
];

// Helper functions...
const mergeRanges = (ranges: QuestionRange[]): QuestionRange[] => { /* unchanged */ return ranges; };
const calculateTotalCompletedQuestions = (ranges: QuestionRange[]): number => { /* unchanged */ return 0; };

const navItems = [ /* unchanged */ ];

const App: React.FC = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [testRecords, setTestRecords] = useState<TestRecord[]>([]);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'plan' | 'subjects' | 'schedule' | 'timeline' | 'tests'>('dashboard');
    const [planSubTab, setPlanSubTab] = useState<'chapters' | 'books' | 'progress'>('chapters');
    const [isTimerOpen, setIsTimerOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const [viewingSubject, setViewingSubject] = useState<Subject | null>(null);
    const [viewingChapter, setViewingChapter] = useState<{ subject: Subject; chapter: Chapter } | null>(null);

    // 🔹 Load user data when they log in
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setSubjects(data.subjects || []);
                    setSchedule(data.schedule || []);
                    setTestRecords(data.testRecords || []);
                } else {
                    await setDoc(userRef, { subjects: [], schedule: [], testRecords: [] });
                }
            } else {
                setSubjects([]);
                setSchedule([]);
                setTestRecords([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // 🔹 Save updates to Firestore
    useEffect(() => {
        const saveData = async () => {
            const user = auth.currentUser;
            if (!user) return;
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { subjects });
        };
        if (!loading) saveData();
    }, [subjects, loading]);

    useEffect(() => {
        const saveData = async () => {
            const user = auth.currentUser;
            if (!user) return;
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { schedule });
        };
        if (!loading) saveData();
    }, [schedule, loading]);

    useEffect(() => {
        const saveData = async () => {
            const user = auth.currentUser;
            if (!user) return;
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { testRecords });
        };
        if (!loading) saveData();
    }, [testRecords, loading]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-200">
                <p className="animate-pulse text-lg">Loading your study data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 pb-24 sm:pb-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="text-left">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
                            <span className="text-gradient-gold text-transparent bg-clip-text">JEE Prep Planner</span>
                        </h1>
                        <p className="mt-1 text-md text-slate-400 hidden sm:block">Your Ultimate Study Companion</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={login} className="btn-gradient-secondary px-3 py-1 rounded-lg">Login</button>
                        <button onClick={logout} className="btn-gradient-secondary px-3 py-1 rounded-lg">Logout</button>
                        <button onClick={() => setIsTimerOpen(true)} className="btn-gradient-secondary flex items-center gap-2">
                            <ClockIcon className="w-5 h-5"/>
                            <span className="hidden sm:inline">Start Studying</span>
                        </button>
                    </div>
                </header>
                {/* ... rest of your UI unchanged */}
            </div>
        </div>
    );
};

export default App;
export enum ChapterStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Completed = 'Completed',
}

export interface StudySession {
  id: string;
  date: string; // ISO String format: YYYY-MM-DD
  duration: number; // in minutes
  subjectId: string;
  chapterId: string;
  subjectName: string;
  chapterName: string;
  subjectColor: string;
  bookId?: string;
  book?: string;
  bookQuestionRange?: QuestionRange;
  exerciseNumber?: string;
}

export interface QuestionRange {
  start: number;
  end: number;
}

export interface Book {
  id: string;
  name: string;
}

export interface ChapterBookInfo {
  totalQuestions: number;
  exercises?: { number: string; count: number }[];
}

export interface BookProgress {
  bookId: string;
  name: string; // Denormalized book name
  completedRanges: QuestionRange[];
  percentage: number;
}

export interface Chapter {
  id: string;
  name: string;
  status: ChapterStatus;
  bookProgress?: BookProgress[];
  studySessions?: StudySession[];
  targetMinutes?: number;
  notes?: string;
  bookInfo?: Record<string, ChapterBookInfo>; // Keyed by book ID
}

export interface Subject {
  id:string;
  name: string;
  chapters: Chapter[];
  color: string;
  books?: Book[];
}

export interface ScheduleItem {
  startTime: Date;
  endTime: Date;
  subject: string;
  chapter: string;
  subjectId: string;
  chapterId: string;
  bookId?: string;
  book?: string;
  bookQuestionRange?: QuestionRange;
  exerciseNumber?: string;
  completed?: boolean;
  googleEventId?: string;
}

export interface TimelineEvent {
  timestamp: Date;
  type: 'start' | 'pause' | 'resume' | 'finish' | 'break';
  message: string;
  duration?: number; // for breaks, in seconds
  reason?: string; // for breaks
}

export enum TestType {
  DAT = 'DAT', // Daily Assessment Test
  WAT = 'WAT', // Weekly Assessment Test
  MAT = 'MAT', // Monthly Assessment Test
  FLT = 'FLT', // Full Length Test
}

export interface TestRecord {
  id: string;
  type: TestType;
  date: string; // YYYY-MM-DD
  subjectIds: string[];
  chapterIds: string[];
  correct: number;
  wrong: number;
  unattempted: number;
  score: number;
  totalQuestions: number;
  remarks?: string;
}
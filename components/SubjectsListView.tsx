
import React from 'react';
import { Subject, ChapterStatus } from '../types';

interface SubjectsListViewProps {
    subjects: Subject[];
    onViewSubject: (subjectId: string) => void;
}

const SubjectsListView: React.FC<SubjectsListViewProps> = ({ subjects, onViewSubject }) => {
    return (
        <div className="animate-in">
            <h2 className="text-2xl font-bold mb-6 text-sky-400">All Subjects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject, index) => {
                    const totalChapters = subject.chapters.length;
                    const completedChapters = subject.chapters.filter(c => c.status === ChapterStatus.Completed).length;
                    const progress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

                    return (
                        <button 
                            key={subject.id} 
                            onClick={() => onViewSubject(subject.id)} 
                            className="flair-card p-6 text-left w-full h-full flex flex-col justify-between animate-in"
                            style={{'--subject-color': subject.color, animationDelay: `${index * 50}ms`} as React.CSSProperties}
                        >
                            <div>
                                <h3 className="font-bold text-2xl mb-2" style={{ color: subject.color }}>{subject.name}</h3>
                                <p className="text-sm text-slate-400 mb-4">{completedChapters} of {totalChapters} chapters completed.</p>
                            </div>
                            <div>
                                <div className="w-full bg-slate-800 rounded-full h-2.5 progress-bar-shine">
                                    <div className="h-2.5 rounded-full" style={{ width: `${progress}%`, backgroundColor: subject.color }}></div>
                                </div>
                                <p className="text-right text-sm font-semibold mt-1" style={{ color: subject.color }}>{Math.round(progress)}%</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SubjectsListView;

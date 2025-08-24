
import React, { useState, useMemo } from 'react';
import { Subject, TestRecord, TestType } from '../types';
import TestRecordForm from './TestRecordForm';
import TestResultsGraph from './TestResultsGraph';
import { TrashIcon } from './icons/TrashIcon';

interface TestViewProps {
    subjects: Subject[];
    testRecords: TestRecord[];
    onAddTestRecord: (record: Omit<TestRecord, 'id'>) => void;
    onDeleteTestRecord: (recordId: string) => void;
}

const TestView: React.FC<TestViewProps> = ({ subjects, testRecords, onAddTestRecord, onDeleteTestRecord }) => {
    const [activeGraphFilter, setActiveGraphFilter] = useState<TestType>(TestType.DAT);
    const [activeListFilter, setActiveListFilter] = useState<TestType | 'All'>('All');

    const filteredRecordsForGraph = useMemo(() => {
        return testRecords.filter(r => r.type === activeGraphFilter);
    }, [testRecords, activeGraphFilter]);

    const filteredRecordsForList = useMemo(() => {
        if (activeListFilter === 'All') {
            return testRecords;
        }
        return testRecords.filter(r => r.type === activeListFilter);
    }, [testRecords, activeListFilter]);

    const getSyllabusString = (record: TestRecord): string => {
        const recordSubjects = subjects.filter(s => record.subjectIds.includes(s.id));
        if (recordSubjects.length === 0) return 'N/A';
        
        if (record.type === TestType.DAT || record.type === TestType.WAT) {
            const subject = recordSubjects[0];
            const chapters = subject.chapters.filter(c => record.chapterIds.includes(c.id));
            return `${subject.name}: ${chapters.map(c => c.name).join(', ')}`;
        }
        
        return recordSubjects.map(s => s.name).join(', ');
    };

    return (
        <div className="space-y-8 animate-in">
            <div>
                <TestRecordForm subjects={subjects} onAddTestRecord={onAddTestRecord} />
            </div>
            
            <div className="flair-card p-4 sm:p-6">
                 <h3 className="text-xl font-bold mb-4 text-sky-400">Performance Over Time</h3>
                 <div className="flex flex-wrap justify-center border-b border-slate-700/70 mb-4">
                    {Object.values(TestType).map(type => (
                        <button
                            key={type}
                            onClick={() => setActiveGraphFilter(type)}
                            className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${activeGraphFilter === type ? 'tab-active' : 'text-slate-400 hover:text-white'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                <TestResultsGraph records={filteredRecordsForGraph} />
            </div>

            <div className="flair-card p-4 sm:p-6">
                <h3 className="text-xl font-bold mb-4 text-sky-400">All Test Records</h3>
                <div className="flex flex-wrap justify-center border-b border-slate-700/70 mb-4">
                    <button
                        onClick={() => setActiveListFilter('All')}
                        className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${activeListFilter === 'All' ? 'tab-active' : 'text-slate-400 hover:text-white'}`}
                    >
                        All
                    </button>
                    {Object.values(TestType).map(type => (
                        <button
                            key={type}
                            onClick={() => setActiveListFilter(type)}
                            className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${activeListFilter === type ? 'tab-active' : 'text-slate-400 hover:text-white'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                    {filteredRecordsForList.length > 0 ? (
                        [...filteredRecordsForList].reverse().map((record, index) => (
                            <div key={record.id} className="bg-slate-800/60 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 animate-in" style={{animationDelay: `${index * 30}ms`}}>
                                <div className="flex-grow">
                                    <div className="flex items-baseline gap-3">
                                        <span className="font-bold text-lg text-sky-400">{record.type}</span>
                                        <span className="text-sm text-slate-400">{new Date(record.date + 'T00:00:00').toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate" title={getSyllabusString(record)}>{getSyllabusString(record)}</p>
                                    {record.remarks && (
                                        <p className="text-sm text-slate-300 mt-2 italic border-l-2 border-slate-600 pl-2 text-left">
                                            {record.remarks}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0">
                                    <div className="text-center">
                                        <p className="font-mono text-xs text-emerald-400" title="Correct">{record.correct}C</p>
                                        <p className="font-mono text-xs text-red-400" title="Wrong">{record.wrong}W</p>
                                        <p className="font-mono text-xs text-slate-500" title="Unattempted">{record.unattempted}U</p>
                                    </div>
                                    <div className="text-center">
                                         <p className="font-bold text-2xl text-white">{record.score}</p>
                                         <p className="text-xs text-slate-400">Score</p>
                                    </div>
                                    <button onClick={() => onDeleteTestRecord(record.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1" title="Delete Record">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                         <div className="text-center py-10 text-slate-500">
                            <p>No test records found for this filter.</p>
                            <p>Select another filter or log a new test using the form above.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestView;
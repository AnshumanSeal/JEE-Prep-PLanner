
import React, { useMemo } from 'react';
import { TestRecord } from '../types';

interface TestResultsGraphProps {
    records: TestRecord[];
}

const TestResultsGraph: React.FC<TestResultsGraphProps> = ({ records }) => {

    const chartData = useMemo(() => {
        if (records.length === 0) return null;

        const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const scores = sortedRecords.map(r => r.score);
        const maxScore = Math.max(...scores, 0);
        const minScore = Math.min(...scores, 0);

        const yAxisLabels: number[] = [];
        const range = maxScore - minScore;
        const step = Math.max(1, Math.ceil(range / 4));
        for (let i = Math.floor(minScore / step) * step; i <= Math.ceil(maxScore / step) * step; i += step) {
            yAxisLabels.push(i);
        }

        const effectiveMin = yAxisLabels[0] ?? minScore;
        const effectiveMax = yAxisLabels[yAxisLabels.length-1] ?? maxScore;
        const effectiveRange = effectiveMax - effectiveMin;

        const points = sortedRecords.map((r, i) => {
            const x = (i / Math.max(1, sortedRecords.length - 1)) * 100;
            const y = 100 - ((r.score - effectiveMin) / (effectiveRange || 1)) * 100;
            return { x, y, record: r };
        });

        return { points, yAxisLabels, effectiveMin, effectiveMax };

    }, [records]);

    if (!chartData || records.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-slate-500">No test data available for this category. Log a test to see your progress!</p>
            </div>
        );
    }
    
    const { points, yAxisLabels } = chartData;
    const pathData = "M" + points.map(p => `${p.x},${p.y}`).join(" L");

    return (
        <div className="h-72 w-full p-4">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <g className="grid" stroke="var(--slate-700)" strokeWidth="0.2">
                    {yAxisLabels.map((label, i) => (
                        <line key={i} x1="0" x2="100" y1={100 - (i * (100 / (yAxisLabels.length-1 || 1)))} y2={100 - (i * (100 / (yAxisLabels.length-1||1)))} />
                    ))}
                </g>
                
                 {/* Y-Axis Labels */}
                 <g className="labels y-axis" fill="var(--color-text-secondary)" fontSize="4px">
                    {yAxisLabels.map((label, i) => (
                         <text key={i} x="-1" y={100.5 - (i * (100 / (yAxisLabels.length-1||1)))} textAnchor="end">{label}</text>
                    ))}
                 </g>
                
                {records.length > 1 && (
                    <path d={pathData} fill="none" stroke="url(#lineGradient)" strokeWidth="0.8" />
                )}

                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="var(--color-gold)">
                        <title>{`${new Date(p.record.date+'T00:00:00').toLocaleDateString()}: ${p.record.score}`}</title>
                    </circle>
                ))}

                 <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--color-muted-gold)" />
                        <stop offset="100%" stopColor="var(--color-gold)" />
                    </linearGradient>
                </defs>

                {/* This is a hack to make the SVG scale properly in a flex container */}
                <line x1="0" y1="0" x2="0" y2="100" stroke="transparent" />
                <line x1="0" y1="100" x2="100" y2="100" stroke="transparent" />
            </svg>
        </div>
    );
};

export default TestResultsGraph;

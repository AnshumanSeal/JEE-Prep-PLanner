
import React from 'react';

interface PieChartProps {
    data: Array<{
        name: string;
        value: number;
        color: string;
    }>;
}

const SubjectPieChart: React.FC<PieChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 h-64 flex items-center justify-center">
                <p className="text-slate-500 text-center">No study data for this day to display a chart.</p>
            </div>
        );
    }
    
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    let cumulativePercent = 0;
    const slices = data.map(item => {
        const percent = item.value / totalValue;
        const startAngle = cumulativePercent * 360;
        const endAngle = (cumulativePercent + percent) * 360;
        cumulativePercent += percent;
        
        const largeArcFlag = percent > 0.5 ? 1 : 0;
        const x1 = 50 + 45 * Math.cos(Math.PI * startAngle / 180);
        const y1 = 50 + 45 * Math.sin(Math.PI * startAngle / 180);
        const x2 = 50 + 45 * Math.cos(Math.PI * endAngle / 180);
        const y2 = 50 + 45 * Math.sin(Math.PI * endAngle / 180);

        const pathData = `M50,50 L${x1},${y1} A45,45 0 ${largeArcFlag},1 ${x2},${y2} Z`;

        return { pathData, color: item.color, name: item.name, value: item.value };
    });

    return (
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="aspect-square">
                     <svg viewBox="0 0 100 100" className="animate-in" style={{animationDuration: '800ms'}}>
                        {slices.map((slice, index) => (
                            <path key={index} d={slice.pathData} fill={slice.color}>
                                <title>{`${slice.name}: ${slice.value} minutes`}</title>
                            </path>
                        ))}
                    </svg>
                </div>
                <div className="text-sm space-y-2">
                    {data.sort((a, b) => b.value - a.value).map(item => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                            <div className="flex justify-between w-full">
                                <span className="text-slate-300 truncate" title={item.name}>{item.name}</span>
                                <span className="font-semibold text-slate-400">{Math.round((item.value/totalValue)*100)}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubjectPieChart;

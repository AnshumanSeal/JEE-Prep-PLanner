import React, { useState } from 'react';

interface BreakReasonModalProps {
    breakDuration: number; // in seconds
    onSave: (reason: string) => void;
    onClose: () => void;
}

const PREDEFINED_REASONS = [
    "Short Break",
    "Stretching / Walk",
    "Snack / Drink",
    "Phone / Social Media",
    "Family / Friends",
];

const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
};

const BreakReasonModal: React.FC<BreakReasonModalProps> = ({ breakDuration, onSave, onClose }) => {
    const [selectedReason, setSelectedReason] = useState('');
    const [otherReason, setOtherReason] = useState('');

    const handleSave = () => {
        if (selectedReason === 'Other') {
            if (otherReason.trim()) {
                onSave(otherReason.trim());
            } else {
                alert('Please specify a reason for your break.');
            }
        } else if (selectedReason) {
            onSave(selectedReason);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="flair-card p-6 rounded-lg max-w-lg w-full modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-sky-400 mb-1">Log Your Break</h3>
                <p className="text-slate-400 mb-4">You took a <span className="font-semibold text-white">{formatDuration(breakDuration)}</span> break. What was it for?</p>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {PREDEFINED_REASONS.map(reason => (
                        <button
                            key={reason}
                            onClick={() => setSelectedReason(reason)}
                            className={`w-full text-left p-3 rounded-lg transition-colors border-2 ${selectedReason === reason ? 'bg-sky-500/20 border-sky-400' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'}`}
                        >
                            {reason}
                        </button>
                    ))}
                     <button
                        onClick={() => setSelectedReason('Other')}
                        className={`w-full text-left p-3 rounded-lg transition-colors border-2 ${selectedReason === 'Other' ? 'bg-sky-500/20 border-sky-400' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'}`}
                    >
                        Other
                    </button>
                    {selectedReason === 'Other' && (
                        <div className="pl-4 pt-2 animate-in" style={{animationDelay: '50ms'}}>
                            <input
                                type="text"
                                value={otherReason}
                                onChange={(e) => setOtherReason(e.target.value)}
                                placeholder="Please specify..."
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                <div className="mt-6 flex gap-3">
                    <button onClick={onClose} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg w-full transition-colors">Cancel</button>
                    <button onClick={handleSave} className="btn-gradient-primary w-full" disabled={!selectedReason || (selectedReason === 'Other' && !otherReason.trim())}>Save & Resume</button>
                </div>
            </div>
        </div>
    );
};

export default BreakReasonModal;

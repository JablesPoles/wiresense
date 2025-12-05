import React from 'react';
import clsx from 'clsx';

export const TimeRangeSelector = ({ selectedRange, onRangeChange, ranges }) => {
    const defaultRanges = [
        { label: '24h', value: '24h' },
        { label: '7d', value: '7d' },
        { label: '30d', value: '30d' },
    ];

    const activeRanges = ranges || defaultRanges;

    return (
        <div className="flex bg-card border border-border rounded-lg p-1 gap-1">
            {activeRanges.map((range) => (
                <button
                    key={range.value}
                    onClick={() => onRangeChange(range.value)}
                    className={clsx(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        selectedRange === range.value
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                    {range.label}
                </button>
            ))}
        </div>
    );
};

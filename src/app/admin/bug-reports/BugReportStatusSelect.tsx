'use client';

import { useState, useTransition } from 'react';
import { updateBugReportStatus } from './actions';

const STATUS_OPTIONS = [
    { value: 'unchecked', label: 'Unchecked' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
] as const;

type BugReportStatusSelectProps = {
    reportId: string;
    status?: string | null;
};

export default function BugReportStatusSelect({ reportId, status }: BugReportStatusSelectProps) {
    const [value, setValue] = useState(status ?? 'unchecked');
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleChange = (next: string) => {
        setValue(next);
        setError(null);
        startTransition(async () => {
            const result = await updateBugReportStatus(reportId, next as 'unchecked' | 'in_progress' | 'resolved');
            if (!result.success) {
                setError(result.error || 'Update failed');
            }
        });
    };

    return (
        <div className="space-y-1">
            <select
                value={value}
                onChange={(event) => handleChange(event.target.value)}
                className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 bg-white"
                disabled={isPending}
            >
                {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <div className="text-[11px] text-red-600">{error}</div>}
        </div>
    );
}

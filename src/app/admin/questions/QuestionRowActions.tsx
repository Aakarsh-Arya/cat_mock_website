'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { deleteQuestion } from './actions';

type QuestionRowActionsProps = {
    questionId: string;
    isActive: boolean;
    editHref?: string;
};

export default function QuestionRowActions({ questionId, isActive, editHref }: QuestionRowActionsProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleDelete = () => {
        if (isPending) return;
        setError(null);
        if (!confirm('Are you sure you want to delete this question? It will be marked inactive.')) {
            return;
        }
        startTransition(async () => {
            const result = await deleteQuestion(questionId);
            if (!result.success) {
                setError(result.error || 'Delete failed');
                return;
            }
            router.refresh();
        });
    };

    return (
        <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
            {editHref && (
                <Link
                    href={editHref}
                    className="touch-target inline-flex items-center rounded px-2 py-1 text-blue-600 hover:bg-blue-50 hover:text-blue-900"
                >
                    Edit
                </Link>
            )}
            {isActive ? (
                <button
                    type="button"
                    onClick={handleDelete}
                    className="touch-target inline-flex items-center rounded px-2 py-1 text-red-600 hover:bg-red-50 hover:text-red-900 disabled:opacity-50"
                    disabled={isPending}
                >
                    {isPending ? 'Deleting...' : 'Delete'}
                </button>
            ) : (
                <span className="text-xs text-gray-400">Inactive</span>
            )}
            {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
    );
}

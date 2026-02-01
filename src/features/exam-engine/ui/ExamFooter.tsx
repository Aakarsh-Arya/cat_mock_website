/**
 * @fileoverview Exam Footer Action Bar
 * @description TCS iON-style action bar for save/clear/mark review
 */

'use client';

interface ExamFooterProps {
    onSaveNext: () => void;
    onClear: () => void;
    onMarkReview: () => void;
    onSubmit?: () => void;
    isLastSection: boolean;
    isSaving: boolean;
    isSubmitting: boolean;
    isAutoSubmitting: boolean;
    isSidebarVisible: boolean;
}

export function ExamFooter({
    onSaveNext,
    onClear,
    onMarkReview,
    onSubmit,
    isLastSection,
    isSaving,
    isSubmitting,
    isAutoSubmitting,
    isSidebarVisible,
}: ExamFooterProps) {
    const isActionDisabled = isSaving || isSubmitting || isAutoSubmitting;

    return (
        <div
            className={`h-16 border-t bg-white grid ${isSidebarVisible ? 'grid-cols-[48%_33%_19%]' : 'grid-cols-[48%_52%]'
                }`}
        >
            {/* Left footer (Col 1) */}
            <div className="flex items-center gap-3 px-4">
                <button
                    type="button"
                    onClick={onMarkReview}
                    disabled={isActionDisabled}
                    className="px-4 py-2 rounded text-white bg-purple-600 hover:bg-purple-700 transition-colors text-sm font-semibold disabled:opacity-60"
                >
                    Mark for Review &amp; Next
                </button>
                <button
                    type="button"
                    onClick={onClear}
                    disabled={isActionDisabled}
                    className="px-4 py-2 rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm font-semibold disabled:opacity-60"
                >
                    Clear Response
                </button>
            </div>

            {/* Middle footer (Col 2) */}
            <div className="flex items-center justify-end px-4 gap-3">
                <button
                    type="button"
                    onClick={onSaveNext}
                    disabled={isActionDisabled}
                    className="px-5 py-2 rounded text-white bg-emerald-600 hover:bg-emerald-700 transition-colors text-sm font-semibold disabled:opacity-60"
                >
                    {isSaving ? 'Saving...' : 'Save & Next'}
                </button>

                {/* FIX: Show Submit button in last section even when sidebar is hidden */}
                {isLastSection && !isSidebarVisible && (
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isActionDisabled}
                        className="px-5 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                    </button>
                )}
            </div>

            {/* Sidebar footer (Col 3) */}
            {isSidebarVisible && (
                <div className="flex items-center justify-center bg-blue-50 border-l border-exam-bg-border-light">
                    {isLastSection ? (
                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={isActionDisabled}
                            className="px-5 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                        </button>
                    ) : (
                        <span className="text-sm text-gray-500">Complete all sections to submit</span>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * @fileoverview Exam Engine Feature - Barrel Export
 * @description Public API for the exam engine feature module
 * @blueprint Milestone 4 - Feature-Sliced Design (FSD)
 */

// Model (Zustand Store)
export {
    useExamStore,
    createExamStore,
    selectCurrentSection,
    selectCurrentTimer,
    selectResponse,
    selectIsSectionLocked,
    selectQuestionStatus,
    selectSectionCounts,
} from './model/useExamStore';

// Hooks
export {
    useExamTimer,
    useSectionTimer,
    useAllSectionTimers,
    calculateRemainingSeconds,
    formatTime,
    getTimerState,
} from './hooks/useExamTimer';

// UI Components
export {
    ExamLayout,
    ExamTimer,
    SectionTimerSummary,
    QuestionPalette,
    MCQRenderer,
    TITARenderer,
    NavigationButtons,
    ExamSubmitButton,
} from './ui';

// Types are re-exported from the central types module
export type {
    ExamStore,
    ExamEngineState,
    ExamEngineActions,
    ResponseState,
    SectionTimerState,
} from '@/types/exam';

// Timer hook types
export type {
    UseExamTimerOptions,
    TimerDisplayData,
} from './hooks/useExamTimer';

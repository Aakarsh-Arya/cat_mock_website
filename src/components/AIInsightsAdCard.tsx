import type { JSX } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { NEXAI_INSIGHTS_DEMO_MARKDOWN } from '@/content/nexaiInsightsDemo';

interface AIInsightsAdCardProps {
    id?: string;
    className?: string;
    heading?: string;
    markdown?: string;
    demo?: boolean;
}

export function AIInsightsAdCard({
    id,
    className = '',
    heading = 'NexAI Insights',
    markdown = NEXAI_INSIGHTS_DEMO_MARKDOWN,
    demo = true,
}: AIInsightsAdCardProps): JSX.Element {
    return (
        <section
            id={id}
            className={`scroll-mt-24 overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-slate-100 shadow-[0_0_0_1px_rgba(148,163,184,0.2),0_24px_48px_-24px_rgba(15,23,42,0.85)] sm:p-8 ${className}`}
        >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                {demo ? 'Demo NexAI Insights' : 'NexAI Insights'}
            </p>
            <h3 className="mt-2 text-2xl font-bold text-white">{heading}</h3>

            <div className="prose prose-invert mt-4 max-w-none prose-headings:text-cyan-200 prose-strong:text-white prose-hr:border-slate-600 prose-p:text-slate-200 prose-li:text-slate-200">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
        </section>
    );
}

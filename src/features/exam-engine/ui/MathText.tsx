/**
 * @fileoverview MathText Utility Component
 * @description Renders inline and block LaTeX using KaTeX
 */

'use client';

import { BlockMath, InlineMath } from 'react-katex';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';

interface MathTextProps {
    text?: string | null;
    className?: string;
    strictText?: boolean;
}

const MATH_PATTERN = /(\$\$[\s\S]+?\$\$|\$[^$]+\$)/g;
const CODE_LANG_PATTERN = /language-([\w-]+)/i;

type TableJson = {
    headers?: Array<string | number>;
    rows?: Array<Array<string | number>>;
    caption?: string;
};

type ChartJson = {
    title?: string;
    labels?: Array<string | number>;
    values?: number[];
};

type DiagramJson = {
    title?: string;
    nodes?: Array<{ id: string; label?: string; x?: number; y?: number }>;
    edges?: Array<{ from: string; to: string } | { source: string; target: string }>;
};

function tryParseJson(raw: string): { data?: unknown; error?: string } {
    try {
        return { data: JSON.parse(raw) };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Invalid JSON.';
        return { error: message };
    }
}

function renderJsonError(message: string, raw: string) {
    return (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
            <p className="font-semibold">Unable to render JSON block.</p>
            <p className="mt-1">{message}</p>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-yellow-800">{raw}</pre>
        </div>
    );
}

function renderTableBlock(json: TableJson, raw: string) {
    const headers = json.headers ?? [];
    const rows = json.rows ?? [];

    if (!headers.length || !rows.length) {
        return renderJsonError('Expected "headers" and "rows" arrays.', raw);
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
                {json.caption && (
                    <caption className="caption-bottom mt-2 text-xs text-gray-500">{json.caption}</caption>
                )}
                <thead>
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} className="border px-3 py-2 text-xs font-semibold text-gray-700">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="odd:bg-gray-50">
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="border px-3 py-2 text-xs text-gray-700">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function renderChartBlock(json: ChartJson, raw: string) {
    const labels = json.labels ?? [];
    const values = json.values ?? [];

    if (!labels.length || !values.length || labels.length !== values.length) {
        return renderJsonError('Expected matching "labels" and "values" arrays.', raw);
    }

    const maxValue = Math.max(...values, 0);
    const width = 320;
    const height = 180;
    const barGap = 8;
    const barWidth = (width - barGap * (values.length + 1)) / values.length;

    return (
        <div className="overflow-x-auto">
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                role="img"
                aria-label={json.title || 'Bar chart'}
                className="max-w-full"
            >
                {json.title && <title>{json.title}</title>}
                {values.map((value, index) => {
                    const barHeight = maxValue > 0 ? (value / maxValue) * (height - 30) : 0;
                    const x = barGap + index * (barWidth + barGap);
                    const y = height - barHeight - 20;
                    return (
                        <g key={labels[index]}>
                            <rect x={x} y={y} width={barWidth} height={barHeight} fill="#3b82f6" rx={3} />
                            <text x={x + barWidth / 2} y={height - 6} textAnchor="middle" fontSize="10" fill="#475569">
                                {labels[index]}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

function renderDiagramBlock(json: DiagramJson, raw: string) {
    const nodes = json.nodes ?? [];
    const edges = json.edges ?? [];

    if (!nodes.length) {
        return renderJsonError('Expected a "nodes" array.', raw);
    }

    const width = 360;
    const height = 200;
    const defaultY = height / 2;
    const spacing = nodes.length > 1 ? (width - 60) / (nodes.length - 1) : 0;

    const nodePositions = nodes.map((node, index) => ({
        ...node,
        x: node.x ?? 30 + index * spacing,
        y: node.y ?? defaultY,
    }));

    const nodeById = new Map(nodePositions.map(node => [node.id, node]));

    return (
        <div className="overflow-x-auto">
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                role="img"
                aria-label={json.title || 'Diagram'}
                className="max-w-full"
            >
                {json.title && <title>{json.title}</title>}
                {edges.map((edge, index) => {
                    const fromId = 'from' in edge ? edge.from : edge.source;
                    const toId = 'to' in edge ? edge.to : edge.target;
                    const fromNode = nodeById.get(fromId);
                    const toNode = nodeById.get(toId);
                    if (!fromNode || !toNode) {
                        return null;
                    }
                    return (
                        <line
                            key={`${fromId}-${toId}-${index}`}
                            x1={fromNode.x}
                            y1={fromNode.y}
                            x2={toNode.x}
                            y2={toNode.y}
                            stroke="#94a3b8"
                            strokeWidth={2}
                        />
                    );
                })}
                {nodePositions.map((node) => (
                    <g key={node.id}>
                        <circle cx={node.x} cy={node.y} r={14} fill="#f1f5f9" stroke="#64748b" strokeWidth={2} />
                        <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="10" fill="#334155">
                            {node.label ?? node.id}
                        </text>
                    </g>
                ))}
            </svg>
            <p className="mt-2 text-xs text-gray-500">Diagram rendering is basic; unsupported structures fall back to JSON.</p>
        </div>
    );
}

function renderMath(token: string, key: number) {
    if (token.startsWith('$$') && token.endsWith('$$')) {
        const math = token.slice(2, -2).trim();
        if (!math) return <span key={key} />;
        return <BlockMath key={key} math={math} />;
    }

    if (token.startsWith('$') && token.endsWith('$')) {
        const math = token.slice(1, -1).trim();
        if (!math) return <span key={key} />;
        return <InlineMath key={key} math={math} />;
    }

    return (
        <span key={key} className="whitespace-pre-wrap">
            {token}
        </span>
    );
}

/**
 * Detect para jumble questions and format sentences with numbers.
 * Para jumbles typically have an instruction followed by 4 sentences separated by newlines.
 */
function formatParaJumbleText(rawText: string): string {
    // Check if this looks like a para jumble question
    const lowerText = rawText.toLowerCase();
    const isParaJumble = (
        (lowerText.includes('labelled 1, 2, 3') || lowerText.includes('labeled 1, 2, 3')) &&
        (lowerText.includes('sequenced') || lowerText.includes('sequence'))
    );

    if (!isParaJumble) return rawText;

    // Split by double newlines to find instruction and sentences
    const parts = rawText.split(/\n\s*\n/).filter(p => p.trim());
    if (parts.length < 2) return rawText;

    // First part is the instruction
    const instruction = parts[0].trim();
    const sentences = parts.slice(1);

    // If we have 2-6 sentences, number them
    if (sentences.length >= 2 && sentences.length <= 6) {
        const numberedSentences = sentences.map((s, i) => `${i + 1}. ${s.trim()}`);
        return `${instruction}\n\n${numberedSentences.join('\n\n')}`;
    }

    return rawText;
}

/**
 * Normalize AI/editor pasted payloads:
 * - unify CRLF/CR to LF
 * - decode literal escaped newlines/tabs when the whole payload is likely escaped JSON text
 */
function normalizePastedText(rawText: string): string {
    let normalized = rawText.replace(/\r\n?/g, '\n').replace(/\u200B/g, '');
    const hasActualNewlines = normalized.includes('\n');
    const escapedNewlineMatches = normalized.match(/\\n/g) ?? [];

    if (!hasActualNewlines && escapedNewlineMatches.length >= 2) {
        normalized = normalized
            .replace(/\\r\\n/g, '\n')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '    ');
    }

    return normalized;
}

export function MathText({ text, className, strictText = false }: MathTextProps) {
    if (text === null || text === undefined || text === '') {
        return null;
    }

    const normalizedInput = normalizePastedText(String(text));

    // Keep editor text strict and unmodified when requested.
    const formattedText = strictText ? normalizedInput : formatParaJumbleText(normalizedInput);

    const compactedText = strictText
        ? formattedText
        : formattedText
            // Prevent accidental large visual gaps from excessive blank lines in content payloads.
            .replace(/\n{3,}/g, '\n\n')
            // Collapse blank lines immediately before Markdown tables so they render tight.
            .replace(/\n{2,}(?=\s*\|)/g, '\n');

    const normalizedText = compactedText
        .replace(/\\\[((?:.|\n)+?)\\\]/g, (_match, math) => `$$${math}$$`)
        .replace(/\\\(((?:.|\n)+?)\\\)/g, (_match, math) => `$${math}$`);

    const parts = normalizedText.split(MATH_PATTERN).filter(Boolean);

    return (
        <div className={`prose prose-sm max-w-none [&_p]:my-1 [&_table]:my-1 ${className ?? ''}`}>
            {parts.map((part, index) => {
                if ((part.startsWith('$$') && part.endsWith('$$')) || (part.startsWith('$') && part.endsWith('$'))) {
                    return renderMath(part, index);
                }

                return (
                    <ReactMarkdown
                        key={index}
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            p: ({ children }) => (
                                <div className={strictText ? 'leading-relaxed whitespace-pre-wrap' : 'leading-relaxed'}>
                                    {children}
                                </div>
                            ),
                            ol: ({ children, ...props }) => (
                                <ol
                                    {...props}
                                    className="list-decimal list-inside ml-4 space-y-1"
                                >
                                    {children}
                                </ol>
                            ),
                            ul: ({ children, ...props }) => (
                                <ul
                                    {...props}
                                    className="list-disc list-inside ml-4 space-y-1"
                                >
                                    {children}
                                </ul>
                            ),
                            li: ({ children, ...props }) => (
                                <li {...props} className={strictText ? 'leading-relaxed whitespace-pre-wrap' : 'leading-relaxed'}>
                                    {children}
                                </li>
                            ),
                            pre: ({ children }) => (
                                <div className="overflow-x-auto rounded bg-gray-100 p-3 text-xs whitespace-pre font-mono">
                                    {children}
                                </div>
                            ),
                            table: ({ children }) => (
                                <div className="mobile-table-scroll mt-1 mb-2 overflow-x-auto not-prose">
                                    <table className="min-w-max border-collapse text-left text-sm">{children}</table>
                                </div>
                            ),
                            th: ({ children }) => <th className="border px-2 py-1 font-semibold">{children}</th>,
                            td: ({ children }) => <td className="border px-2 py-1">{children}</td>,
                            code: (props) => {
                                const { className, children } = props;
                                const inline = 'inline' in props ? Boolean(props.inline) : false;
                                const raw = String(children ?? '').replace(/\n$/, '');
                                if (inline) {
                                    return <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">{children}</code>;
                                }

                                const lang = className?.match(CODE_LANG_PATTERN)?.[1]?.toLowerCase() ?? '';
                                const normalized = lang.trim();

                                if (['table-json', 'chart-json', 'diagram-json'].includes(normalized)) {
                                    const { data, error } = tryParseJson(raw);
                                    if (error || !data) {
                                        return renderJsonError(error || 'Invalid JSON.', raw);
                                    }

                                    if (normalized === 'table-json') {
                                        return renderTableBlock(data as TableJson, raw);
                                    }

                                    if (normalized === 'chart-json') {
                                        return renderChartBlock(data as ChartJson, raw);
                                    }

                                    if (normalized === 'diagram-json') {
                                        return renderDiagramBlock(data as DiagramJson, raw);
                                    }
                                }

                                // Use div instead of pre to avoid hydration error when wrapped in <p>
                                return (
                                    <div className="overflow-x-auto rounded bg-gray-100 p-3 text-xs whitespace-pre font-mono">
                                        <code className={className}>{children}</code>
                                    </div>
                                );
                            },
                        }}
                    >
                        {part}
                    </ReactMarkdown>
                );
            })}
        </div>
    );
}

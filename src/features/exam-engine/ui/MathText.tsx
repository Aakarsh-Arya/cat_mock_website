/**
 * @fileoverview MathText Utility Component
 * @description Renders inline and block LaTeX using KaTeX
 */

'use client';

import { Fragment } from 'react';
import { BlockMath, InlineMath } from 'react-katex';

interface MathTextProps {
    text?: string | null;
    className?: string;
}

const MATH_PATTERN = /(\$\$[\s\S]+?\$\$|\$[^$]+\$)/g;

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

export function MathText({ text, className }: MathTextProps) {
    if (text === null || text === undefined || text === '') {
        return null;
    }

    const parts = String(text).split(MATH_PATTERN).filter(Boolean);

    return (
        <span className={className}>
            {parts.map((part, index) => renderMath(part, index))}
        </span>
    );
}

export default MathText;
/**
 * @fileoverview Lightweight Markdown toolbar for admin editors
 * @description Inserts simple Markdown snippets into a target textarea
 */

'use client';

import { useCallback, type RefObject } from 'react';

interface MarkdownToolbarProps {
    textareaRef: RefObject<HTMLTextAreaElement | null>;
    value: string;
    onChange: (nextValue: string) => void;
    className?: string;
}

function applyWrap(
    textarea: HTMLTextAreaElement,
    value: string,
    onChange: (nextValue: string) => void,
    startToken: string,
    endToken: string = startToken
) {
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = value.slice(start, end);
    const next = `${value.slice(0, start)}${startToken}${selected}${endToken}${value.slice(end)}`;
    onChange(next);

    const cursorStart = start + startToken.length;
    const cursorEnd = end + startToken.length;
    requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorStart, cursorEnd);
    });
}

function applyLinePrefix(
    textarea: HTMLTextAreaElement,
    value: string,
    onChange: (nextValue: string) => void,
    prefix: string
) {
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', end);
    const blockEnd = lineEnd === -1 ? value.length : lineEnd;
    const block = value.slice(lineStart, blockEnd);
    const lines = block.split('\n');
    const updatedLines = lines.map((line) => (line.trim().length ? `${prefix}${line}` : line));
    const nextBlock = updatedLines.join('\n');
    const next = `${value.slice(0, lineStart)}${nextBlock}${value.slice(blockEnd)}`;
    onChange(next);

    const delta = nextBlock.length - block.length;
    requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + delta);
    });
}

export function MarkdownToolbar({ textareaRef, value, onChange, className }: MarkdownToolbarProps) {
    const handleBold = useCallback(() => {
        if (!textareaRef.current) return;
        applyWrap(textareaRef.current, value, onChange, '**', '**');
    }, [textareaRef, value, onChange]);

    const handleItalic = useCallback(() => {
        if (!textareaRef.current) return;
        applyWrap(textareaRef.current, value, onChange, '*', '*');
    }, [textareaRef, value, onChange]);

    const handleUnderline = useCallback(() => {
        if (!textareaRef.current) return;
        applyWrap(textareaRef.current, value, onChange, '<u>', '</u>');
    }, [textareaRef, value, onChange]);

    const handleBullets = useCallback(() => {
        if (!textareaRef.current) return;
        applyLinePrefix(textareaRef.current, value, onChange, '- ');
    }, [textareaRef, value, onChange]);

    const handleNumbered = useCallback(() => {
        if (!textareaRef.current) return;
        applyLinePrefix(textareaRef.current, value, onChange, '1. ');
    }, [textareaRef, value, onChange]);

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
            <button
                type="button"
                onClick={handleBold}
                className="px-2 py-1 text-xs font-semibold border border-gray-200 rounded hover:bg-gray-50"
            >
                Bold
            </button>
            <button
                type="button"
                onClick={handleItalic}
                className="px-2 py-1 text-xs font-semibold border border-gray-200 rounded hover:bg-gray-50"
            >
                Italic
            </button>
            <button
                type="button"
                onClick={handleUnderline}
                className="px-2 py-1 text-xs font-semibold border border-gray-200 rounded hover:bg-gray-50"
            >
                Underline
            </button>
            <button
                type="button"
                onClick={handleBullets}
                className="px-2 py-1 text-xs font-semibold border border-gray-200 rounded hover:bg-gray-50"
            >
                Bullets
            </button>
            <button
                type="button"
                onClick={handleNumbered}
                className="px-2 py-1 text-xs font-semibold border border-gray-200 rounded hover:bg-gray-50"
            >
                Numbered
            </button>
        </div>
    );
}

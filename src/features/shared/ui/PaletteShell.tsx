/**
 * @fileoverview Shared palette shell
 * @description Shared container for palette UIs (runtime/admin)
 */

import type { ReactNode } from 'react';

interface PaletteShellProps {
    className?: string;
    children: ReactNode;
}

export function PaletteShell({ className = '', children }: PaletteShellProps) {
    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
            {children}
        </div>
    );
}

'use client';

import { useEffect, type RefObject } from 'react';

export function useFocusTrap(
    isOpen: boolean,
    containerRef: RefObject<HTMLElement | null>,
    onClose: () => void
) {
    useEffect(() => {
        if (!isOpen) return;
        const container = containerRef.current;
        if (!container) return;

        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
        ];
        const focusable = Array.from(
            container.querySelectorAll<HTMLElement>(focusableSelectors.join(','))
        );
        const previousActive = document.activeElement as HTMLElement | null;

        const focusFirst = () => {
            if (focusable.length > 0) {
                focusable[0].focus();
            } else {
                container.focus();
            }
        };

        focusFirst();

        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
                return;
            }
            if (event.key !== 'Tab') return;

            if (focusable.length === 0) {
                event.preventDefault();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement as HTMLElement | null;

            if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeydown);
        return () => {
            document.removeEventListener('keydown', handleKeydown);
            if (previousActive) {
                previousActive.focus();
            }
        };
    }, [containerRef, isOpen, onClose]);
}

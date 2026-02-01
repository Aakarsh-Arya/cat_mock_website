declare module 'react-katex' {
    import type { ComponentType } from 'react';

    export const BlockMath: ComponentType<{ math?: string | null; children?: string }>;
    export const InlineMath: ComponentType<{ math?: string | null; children?: string }>;
}

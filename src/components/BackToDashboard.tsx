import Link from 'next/link';

type BackToDashboardProps = {
    href?: string;
    label?: string;
    variant?: 'inline' | 'fixed';
    className?: string;
};

export function BackToDashboard({
    href = '/dashboard',
    label = 'Back to Dashboard',
    variant = 'inline',
    className = '',
}: BackToDashboardProps) {
    if (variant === 'fixed') {
        return (
            <div className="fixed left-4 top-4 z-50">
                <Link
                    href={href}
                    className={`inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm transition hover:bg-white/20 ${className}`}
                >
                    <span aria-hidden="true">{'<-'}</span>
                    {label}
                </Link>
            </div>
        );
    }

    return (
        <Link
            href={href}
            className={`inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700 transition hover:bg-blue-100 ${className}`}
        >
            <span aria-hidden="true">{'<-'}</span>
            {label}
        </Link>
    );
}

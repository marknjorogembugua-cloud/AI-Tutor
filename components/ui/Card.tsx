import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export function Card({
    className,
    interactive,
    ...r
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
    return <div className={clsx('card p-6', interactive && 'card-hover', className)} {...r} />;
}

export function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'center',
    action,
}: {
    eyebrow?: string;
    title: ReactNode;
    description?: ReactNode;
    align?: 'center' | 'left';
    action?: ReactNode;
}) {
    const centered = align === 'center';
    return (
        <div
            className={clsx(
                'mb-10 flex flex-col gap-3',
                centered
                    ? 'items-center text-center'
                    : 'items-start sm:flex-row sm:items-end sm:justify-between'
            )}
        >
            <div className="max-w-2xl">
                {eyebrow && (
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
                        {eyebrow}
                    </p>
                )}
                <h2 className="text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                    {title}
                </h2>
                {description && (
                    <p className="mt-4 text-pretty text-base leading-relaxed text-ink-soft">{description}</p>
                )}
            </div>
            {action}
        </div>
    );
}

export function Badge({
    children,
    tone = 'neutral',
    className,
    ...r
}: HTMLAttributes<HTMLSpanElement> & {
    children: ReactNode;
    tone?: 'neutral' | 'brand' | 'warn';
}) {
    return (
        <span
            className={clsx(
                'chip',
                tone === 'neutral' && 'bg-surface-muted text-ink-soft',
                tone === 'brand' && 'bg-brand-soft text-brand-ink',
                tone === 'warn' && 'bg-warn-soft text-warn-ink',
                className
            )}
            {...r}
        >
            {children}
        </span>
    );
}

export function ShieldIcon({ className }: { className?: string }) {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
            <path
                d="M12 3.2 19 6v5.4c0 4-2.9 7.6-7 9.4-4.1-1.8-7-5.4-7-9.4V6l7-2.8Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
            <path
                d="m9.2 12.2 2 2 3.6-3.8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function LockIcon({ className }: { className?: string }) {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
            <rect
                x="4.5"
                y="10.5"
                width="15"
                height="9.5"
                rx="2.4"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <path d="M8.5 10.5V8a3.5 3.5 0 1 1 7 0v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

export function TrustMark({ children }: { children: ReactNode }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-mute">
            <ShieldIcon />
            {children}
        </span>
    );
}

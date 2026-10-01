import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import { LockIcon, ShieldIcon } from '@/components/ui/Card';

export function TrustStrip({
    items,
    className,
}: {
    items: { title: string; body: string }[];
    className?: string;
}) {
    return (
        <div className={clsx('grid gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
            {items.map((i) => (
                <div key={i.title} className="card card-hover flex gap-3 p-5">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-ink">
                        <ShieldIcon />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-ink">{i.title}</p>
                        <p className="mt-1 text-pretty text-sm leading-relaxed text-ink-mute">{i.body}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function PrivacyNote({
    title = 'Your data stays yours',
    children,
    className,
}: {
    title?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <aside
            className={clsx(
                'flex items-start gap-3 rounded-2xl border border-brand-line bg-brand-soft/60 px-4 py-3.5',
                className
            )}
        >
            <span className="mt-0.5 text-brand-ink">
                <LockIcon />
            </span>
            <div className="text-sm leading-relaxed">
                <p className="font-medium text-brand-ink">{title}</p>
                <div className="text-ink-soft">{children}</div>
            </div>
        </aside>
    );
}

export function InlineTrust({ items, className }: { items: string[]; className?: string }) {
    return (
        <ul className={clsx('flex flex-wrap items-center gap-x-5 gap-y-2', className)}>
            {items.map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-mute">
                    <ShieldIcon className="text-brand" />
                    {t}
                </li>
            ))}
        </ul>
    );
}

export function Reveal({
    children,
    delay = 0,
    className,
    ...r
}: HTMLAttributes<HTMLDivElement> & { delay?: number }) {
    return (
        <div
            className={clsx('animate-fade-up', className)}
            style={{ animationDelay: `${delay}ms` }}
            {...r}
        >
            {children}
        </div>
    );
}

import clsx from 'clsx';

/**
 * Loading placeholders that use the `.skeleton` shimmer defined in globals.css.
 *
 * That utility existed but was never wired up, so every route transition in the
 * app was a blank frame. These give the shimmer a shape to fill.
 */

export function Skeleton({
    className,
    ...r
}: React.HTMLAttributes<HTMLDivElement>) {
    return <div aria-hidden className={clsx('skeleton rounded-lg', className)} {...r} />;
}

/** A line of body text. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
    return (
        <div className={clsx('space-y-2.5', className)}>
            {Array.from({ length: lines }, (_, i) => (
                <Skeleton
                    key={i}
                    // Last line is short, the way real paragraphs end.
                    className={i === lines - 1 ? 'h-3.5 w-3/5' : 'h-3.5 w-full'}
                />
            ))}
        </div>
    );
}

/** A stat tile matching the ones on the dashboard and parent page. */
export function SkeletonStat() {
    return (
        <div className="card p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2.5 h-7 w-14" />
            <Skeleton className="mt-1.5 h-2.5 w-16" />
        </div>
    );
}

/** A horizontal mastery bar, matching SkillBar's layout. */
export function SkeletonBar() {
    return (
        <div>
            <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3.5 w-8" />
            </div>
            <Skeleton className="mt-2 h-2 w-full rounded-full" />
        </div>
    );
}

/**
 * Screen-reader announcement for a route that is still loading. The skeletons
 * are all aria-hidden, so without this a screen reader hears nothing at all.
 */
export function LoadingLabel({ what }: { what: string }) {
    return (
        <span role="status" aria-live="polite" className="sr-only">
            Loading {what}…
        </span>
    );
}
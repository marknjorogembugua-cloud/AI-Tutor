import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Shared placeholder for the subject grid, used by the tutor's loading state
 * and its error boundary.
 *
 * Split out of SubjectCatalogue.tsx so both the server-rendered loading file
 * and the client error boundary can import it — a server component can't
 * import from a 'use client' module.
 */
export function SubjectCatalogueSkeleton({ count = 9 }: { count?: number }) {
    return (
        <div className="space-y-5" aria-hidden>
            {/* Filter chips */}
            <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }, (_, i) => (
                    <Skeleton key={i} className="h-9 w-28 rounded-full" />
                ))}
            </div>

            {/* Search */}
            <Skeleton className="h-11 w-full rounded-xl" />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: count }, (_, i) => (
                    <div key={i} className="card p-5">
                        <div className="flex items-start justify-between gap-3">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-4 w-14 rounded-full" />
                        </div>
                        <Skeleton className="mt-3 h-3 w-full" />
                        <Skeleton className="mt-2 h-3 w-4/5" />
                    </div>
                ))}
            </div>
        </div>
    );
}
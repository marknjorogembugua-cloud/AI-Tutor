import { Skeleton, SkeletonStat, LoadingLabel } from '@/components/ui/Skeleton';

/**
 * Dashboard placeholder.
 *
 * The dashboard is almost entirely server queries, so this shape mirrors the
 * real page: heading block, four stat tiles, skills panel, recommendation card.
 * Matching the layout means content lands in place instead of shifting.
 */
export default function LoadingDashboard() {
    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <LoadingLabel what="your dashboard" />

            <div>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-3 h-8 w-64" />
                <Skeleton className="mt-3 h-4 w-80" />
                <Skeleton className="mt-5 h-10 w-36 rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => (
                    <SkeletonStat key={i} />
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="card lg:col-span-2">
                    <Skeleton className="h-5 w-32" />
                    <div className="mt-5 space-y-5">
                        {Array.from({ length: 5 }, (_, i) => (
                            <div key={i}>
                                <Skeleton className="h-3.5 w-44" />
                                <Skeleton className="mt-2 h-2 w-full rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="card">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="mt-3 h-5 w-40" />
                    <Skeleton className="mt-3 h-3.5 w-full" />
                    <Skeleton className="mt-2 h-3.5 w-5/6" />
                    <Skeleton className="mt-5 h-9 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
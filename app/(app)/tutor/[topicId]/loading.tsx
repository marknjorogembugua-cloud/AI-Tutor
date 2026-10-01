import { Skeleton, LoadingLabel } from '@/components/ui/Skeleton';

/**
 * Placeholder for a topic session. The real page streams a question card, so
 * the placeholder reserves a card-shaped region rather than a spinner.
 */
export default function LoadingTopic() {
    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <LoadingLabel what="this question" />

            <div className="flex items-center justify-between gap-4">
                <div>
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="mt-2.5 h-6 w-56" />
                </div>
                <Skeleton className="h-10 w-24 rounded-xl" />
            </div>

            <div className="card p-6">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="mt-3 h-5 w-11/12" />
                <Skeleton className="mt-2 h-5 w-2/3" />

                <div className="mt-7 space-y-2.5">
                    {Array.from({ length: 4 }, (_, i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-xl" />
                    ))}
                </div>

                <Skeleton className="mt-6 h-11 w-full rounded-xl" />
            </div>
        </div>
    );
}
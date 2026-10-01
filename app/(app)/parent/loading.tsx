import { Skeleton, LoadingLabel } from '@/components/ui/Skeleton';

/** Placeholder for the parent's child-progress view. */
export default function LoadingParent() {
    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <LoadingLabel what="your child's progress" />

            <div>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-3 h-8 w-72" />
                <Skeleton className="mt-3 h-4 w-96 max-w-full" />
            </div>

            <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="card p-4">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="mt-2 h-7 w-12" />
                    </div>
                ))}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                {Array.from({ length: 2 }, (_, i) => (
                    <div key={i} className="card">
                        <Skeleton className="h-5 w-32" />
                        <div className="mt-4 space-y-4">
                            {Array.from({ length: 3 }, (_, k) => (
                                <div key={k}>
                                    <Skeleton className="h-3.5 w-36" />
                                    <Skeleton className="mt-2 h-2 w-full rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
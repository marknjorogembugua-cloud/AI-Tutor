import { Skeleton, LoadingLabel } from '@/components/ui/Skeleton';
import { SubjectCatalogueSkeleton } from './SubjectCatalogueSkeleton';

/**
 * Holds the frame while the subject list is queried, so opening the tutor on a
 * phone doesn't show an empty card grid followed by a jump.
 */
export default function LoadingTutor() {
    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <LoadingLabel what="the subject list" />
            <div>
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-3 h-8 w-72" />
                <Skeleton className="mt-3 h-4 w-96 max-w-full" />
            </div>
            <SubjectCatalogueSkeleton />
        </div>
    );
}
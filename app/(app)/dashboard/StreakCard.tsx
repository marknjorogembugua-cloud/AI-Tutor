import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { PrivacyNote } from '@/components/Trust';
import {
    fillDayRange,
    streakLabel,
    summariseActivity,
    type DayActivity,
} from '@/lib/activity';
import ActivityChart from '@/components/ActivityChart';

/** Days shown on the dashboard chart. Twelve weeks is long enough to see a habit. */
const CHART_DAYS = 84;

/**
 * Streak card for the student dashboard.
 *
 * Reads the rollup from practice_activity() rather than selecting answer rows:
 * a few thousand rows transferred and aggregated in the browser on every
 * dashboard load, for a number that is three digits.
 */
export default async function StreakCard({ studentId }: { studentId: string }) {
    const sb = createClient();

    const { data, error } = await sb.rpc('practice_activity', {
        p_student: studentId,
        p_days: CHART_DAYS,
    });

    // A deployment that has not applied migration 0009 yet has no such function.
    // Hiding the card is right: a streak that silently reads zero is worse than
    // no streak.
    if (error) return null;

    const rows = (data ?? []) as DayActivity[];
    const summary = summariseActivity(rows);
    const days = fillDayRange(summary.days, CHART_DAYS);

    return (
        <Card>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-semibold text-ink">Practice streak</h2>
                <p className="text-xs text-ink-mute">
                    {summary.longest > summary.current
                        ? `Best: ${summary.longest} days`
                        : `Last ${CHART_DAYS / 7} weeks`}
                </p>
            </div>

            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-ink">
                {streakLabel(summary.current)}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                {summary.current === 0
                    ? 'Answer a question today to start one. Yesterday still counts until midnight.'
                    : summary.practisedToday
                      ? 'Today is in the bag. Keep it going tomorrow.'
                      : 'Practise today to keep this streak alive.'}
            </p>

            <div className="mt-5">
                <ActivityChart days={days} />
            </div>

            <PrivacyNote className="mt-5" title="Counts every answer">
                A day counts once you have answered at least one question, right or wrong.
            </PrivacyNote>
        </Card>
    );
}
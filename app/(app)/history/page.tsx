import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ActivityChart from '@/components/ActivityChart';
import { PrivacyNote } from '@/components/Trust';
import { Card, SectionHeading } from '@/components/ui/Card';
import { fillDayRange, streakLabel, summariseActivity, type DayActivity } from '@/lib/activity';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Practice history — AI Personal Tutor' };

export const dynamic = 'force-dynamic';

/** How far back the history page goes. */
const DAYS = 365;

export default async function HistoryPage() {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await sb
        .from('students')
        .select('display_name, onboarded')
        .eq('id', user.id)
        .maybeSingle();
    if (!profile?.onboarded) redirect('/onboarding/profile');

    const { data: activity, error } = await sb.rpc('practice_activity', {
        p_student: user.id,
        p_days: DAYS,
    });

    // Migration 0009 not applied on this deployment. Say so rather than showing
    // an empty chart, which reads as "you have never practised".
    if (error) {
        return (
            <div className="mx-auto max-w-3xl space-y-6">
                <SectionHeading
                    align="left"
                    eyebrow="History"
                    title="Practice history"
                    description="Every day you have practised, and what it added up to."
                />
                <Card>
                    <p className="text-sm leading-relaxed text-ink-soft">
                        Practice history is not available on this deployment yet. It needs the
                        activity-rollup migration applied — your dashboard and lessons work
                        regardless.
                    </p>
                </Card>
            </div>
        );
    }

    const rows = (activity ?? []) as DayActivity[];
    const summary = summariseActivity(rows);
    const days = fillDayRange(summary.days, DAYS);

    const activeDays = days.filter((d) => d.questions > 0);
    const totalQuestions = activeDays.reduce((n, d) => n + d.questions, 0);
    const totalCorrect = activeDays.reduce((n, d) => n + d.correct, 0);
    const accuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : null;

    const { data: sessionCount } = await sb.rpc('session_count', { p_student: user.id });

    // Longest gap between practice days, within the window. Motivational rather
    // than clinical: the point is to make an on/off pattern visible.
    let longestGap = 0;
    for (let i = 1; i < activeDays.length; i++) {
        const gap =
            (Date.parse(`${activeDays[i].day}T00:00:00Z`) -
                Date.parse(`${activeDays[i - 1].day}T00:00:00Z`)) /
            86_400_000;
        if (gap > longestGap) longestGap = gap;
    }

    const { data: recent } = await sb
        .from('learning_sessions')
        .select('started_at, ended_at, topics(name, subjects(name))')
        .eq('student_id', user.id)
        .order('started_at', { ascending: false })
        .limit(10);

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <SectionHeading
                align="left"
                eyebrow="History"
                title="Practice history"
                description="Every day you have practised, and what it added up to."
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Current streak" value={summary.current} hint="days in a row" />
                <Stat label="Longest streak" value={summary.longest} hint="days" />
                <Stat label="Days practised" value={activeDays.length} hint="in the last year" />
                <Stat
                    label="Questions"
                    value={totalQuestions}
                    hint={accuracy === null ? 'answered' : `${accuracy}% correct`}
                />
            </div>

            <Card>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-semibold text-ink">Last 12 months</h2>
                    <p className="text-xs text-ink-mute">{streakLabel(summary.current)}</p>
                </div>
                <div className="mt-5">
                    <ActivityChart days={days} />
                </div>
                <p className="mt-4 text-xs text-ink-mute">
                    Solid bars are days where every answer was right; lighter bars include
                    mistakes. A missed day is a gap, not a failure.
                </p>
            </Card>

            {longestGap > 1 && (
                <Card className="border-brand-line bg-brand-soft/40">
                    <p className="text-pretty text-sm leading-relaxed text-ink-soft">
                        Your longest gap between practice days was {longestGap - 1}{' '}
                        {longestGap === 2 ? 'day' : 'days'}. Worth knowing, not worth beating
                        yourself up about.
                    </p>
                </Card>
            )}

            <Card>
                <h2 className="mb-4 font-semibold text-ink">Recent sessions</h2>
                {recent?.length ? (
                    <ul className="divide-y divide-line">
                        {recent.map((s: any, i: number) => (
                            <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                                <span className="text-sm font-medium text-ink">
                                    {s.topics?.name ?? 'Untitled session'}
                                    {s.topics?.subjects?.name ? (
                                        <span className="font-normal text-ink-mute">
                                            {' · '}
                                            {s.topics.subjects.name}
                                        </span>
                                    ) : null}
                                </span>
                                <span className="text-xs text-ink-mute">
                                    {new Date(s.started_at).toLocaleDateString(undefined, {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-ink-mute">No sessions recorded yet.</p>
                )}
                {typeof sessionCount === 'number' && sessionCount > 10 && (
                    <p className="mt-4 text-xs text-ink-mute">
                        Showing the 10 most recent of {sessionCount} sessions.
                    </p>
                )}
            </Card>

            <PrivacyNote title="Only you and a linked parent can see this">
                This page reads your own answers through the same row-level security that
                protects everything else.
            </PrivacyNote>
        </div>
    );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint: string }) {
    return (
        <div className="card card-hover p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-mute">{label}</p>
            <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-ink">
                {value}
            </p>
            <p className="mt-0.5 text-xs text-ink-mute">{hint}</p>
        </div>
    );
}
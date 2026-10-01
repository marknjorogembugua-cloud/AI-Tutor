import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SkillBar } from '@/components/ui/SkillBar';
import { Card, SectionHeading } from '@/components/ui/Card';
import { PrivacyNote } from '@/components/Trust';
import UpgradeBanner from './UpgradeBanner';
import StreakCard from './StreakCard';

export default async function Dashboard() {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) redirect('/login');

    // Start of today in UTC, not the server's local midnight: the daily quota
    // and the streak both key off UTC days, and a local boundary would let
    // "Questions today" disagree with the allowance the API actually enforces.
    const since = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);

    const [{ data: student }, { data: today }, { data: progress }, { data: recs }] = await Promise.all([
        sb.from('students').select('*').eq('id', user.id).maybeSingle(),
        sb.from('student_answers').select('*').eq('student_id', user.id).gte('created_at', since.toISOString()),
        sb.from('skill_progress')
            .select('mastery, skills(id, name, topic_id, topics(name, subject_id, subjects(name)))')
            .eq('student_id', user.id).order('mastery'),
        sb.from('recommendations')
            .select('id, reason, skills(name)')
            .eq('student_id', user.id).eq('dismissed', false)
            .order('created_at', { ascending: false }).limit(1),
    ]);

    if (!student?.onboarded) redirect('/onboarding/profile');

    const answered = today?.length ?? 0;
    const correct = (today ?? []).filter((a) => a.is_correct).length;
    const accuracy = answered ? Math.round((correct / answered) * 100) : null;
    const rec = recs?.[0] as { id: string; reason: string; skills?: { name: string } } | undefined;

    return (
        <div className="mx-auto max-w-3xl space-y-8">
            <UpgradeBanner />
            <SectionHeading
                align="left"
                eyebrow="Today"
                title={`Hi ${student.display_name}`}
                description="Here's how you're doing today. Keep going — consistency beats intensity."
                action={
                    <Link href="/tutor" className="btn-primary shrink-0">
                        Start a session
                    </Link>
                }
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Questions today" value={answered} hint="answered so far" />
                <Stat label="Correct today" value={correct} hint="right first time" />
                <Stat label="Accuracy" value={accuracy === null ? '—' : `${accuracy}%`} hint="today" />
                <Stat label="Skills practiced" value={progress?.length ?? 0} hint="all time" />
            </div>

            <StreakCard studentId={user.id} />

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <h2 className="font-semibold text-ink">Your skills</h2>
                        <Link href="/tutor" className="text-sm font-medium text-brand-ink hover:underline">
                            Practice →
                        </Link>
                    </div>
                    {progress?.length ? (
                        <div className="space-y-4">
                            {progress.slice(0, 8).map((p: any) => (
                                <SkillBar key={p.skills.id} label={p.skills.name} value={p.mastery} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState />
                    )}
                </Card>

                <div className="space-y-6">
                    {rec && (
                        <Card className="border-brand-line bg-brand-soft/50">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
                                Recommended next
                            </p>
                            <p className="mt-1.5 font-semibold text-ink">{rec.skills?.name}</p>
                            <p className="mt-1.5 text-pretty text-sm leading-relaxed text-ink-soft">
                                {rec.reason}
                            </p>
                            <Link href="/tutor" className="btn-primary mt-5 w-full text-sm">
                                Practise this
                            </Link>
                        </Card>
                    )}
                    <PrivacyNote title="Only you and your parent can see this">
                        Your answers, scores, and gaps are stored against your account alone.
                    </PrivacyNote>
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-xl border border-dashed border-line-strong px-4 py-8 text-center">
            <p className="text-sm font-medium text-ink-soft">No skills practised yet</p>
            <p className="mt-1 text-sm text-ink-mute">
                Start a session and your progress will appear here.
            </p>
            <Link href="/tutor" className="btn-outline mt-4 text-sm">
                Choose a topic
            </Link>
        </div>
    );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
    return (
        <div className="card card-hover p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-mute">{label}</p>
            <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-ink">
                {value}
            </p>
            {hint && <p className="mt-0.5 text-xs text-ink-mute">{hint}</p>}
        </div>
    );
}

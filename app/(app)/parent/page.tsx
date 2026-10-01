import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SkillBar } from '@/components/ui/SkillBar';
import { Card, SectionHeading } from '@/components/ui/Card';
import { PrivacyNote } from '@/components/Trust';
import { getEntitlements } from '@/lib/billing/entitlements';
import InviteManager from './InviteManager';
import ChildSwitcher from './ChildSwitcher';
import { MAX_CHILDREN, FREE_MAX_CHILDREN } from '@/lib/parent/limits';

export const metadata: Metadata = { title: 'My Child — AI Personal Tutor' };

export const dynamic = 'force-dynamic';

export default async function ParentDashboard({
    searchParams,
}: {
    searchParams: { child?: string };
}) {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) redirect('/login');

    const { data: roleRow } = await sb.from('users').select('role').eq('id', user.id).maybeSingle();
    if (roleRow?.role !== 'parent') redirect('/dashboard');

    const entitlements = await getEntitlements(user.id);
    const maxChildren = entitlements.isPaid ? MAX_CHILDREN : FREE_MAX_CHILDREN;

    const [{ data: children }, { data: invites }] = await Promise.all([
        sb.from('students').select('*').eq('parent_id', user.id)
            .order('display_name', { ascending: true }),
        sb
            .from('parent_invites')
            .select('code, child_label, status, expires_at, created_at, accepted_at, accepted_by')
            .eq('parent_id', user.id)
            .order('created_at', { ascending: false }),
    ]);

    // Join the accepted invite to the student's current name. Reading
    // students.display_name needs the "parent reads child" policy, which the
    // session already satisfies.
    const nameById = new Map((children ?? []).map((c: any) => [c.id, c.display_name]));

    const inviteRows = (invites ?? []).map((i: any) => ({
        ...i,
        childName: i.accepted_by ? (nameById.get(i.accepted_by) ?? null) : null,
    }));

    const visible = (children ?? []).slice(0, maxChildren);
    const hidden = (children ?? []).length - visible.length;
    const requested = searchParams.child;
    const child =
        visible.find((c: any) => c.id === requested) ??
        visible.find((c: any) => c.display_name === requested) ??
        visible[0];

    const { data: parentName } = await sb
        .from('parents')
        .select('display_name')
        .eq('id', user.id)
        .maybeSingle();

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <SectionHeading
                align="left"
                eyebrow={parentName?.display_name ? `Signed in as ${parentName.display_name}` : 'Parent view'}
                title="My child"
                description="Link your child's own account to see their progress, then follow along here."
            />

            <InviteManager
                invites={inviteRows}
                maxChildren={maxChildren}
                linked={children?.length ?? 0}
            />

            {!child ? (
                <Card>
                    <h2 className="text-xl font-semibold tracking-tight text-ink">
                        No child linked yet
                    </h2>
                    <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-soft">
                        Create an invite code above and give it to your child. They enter it on
                        their own account, and their progress appears here. Nothing is shared
                        until they do.
                    </p>
                    {hidden > 0 && (
                        <p className="mt-4 text-sm text-ink-soft">
                            {hidden} linked {hidden === 1 ? 'child is' : 'children are'} beyond
                            what this plan shows.{' '}
                            <Link href="/pricing" className="font-medium text-brand-ink hover:underline">
                                Compare plans
                            </Link>
                        </p>
                    )}
                </Card>
            ) : (
                <>
                    {visible.length > 1 && (
                        <nav aria-label="Choose a child" className="flex flex-wrap gap-2">
                            {visible.map((c: any) => {
                                const active = c.id === child.id;
                                return (
                                    <Link
                                        key={c.id}
                                        href={`/parent?child=${encodeURIComponent(c.id)}`}
                                        aria-current={active ? 'page' : undefined}
                                        className={active ? 'btn-primary' : 'btn-outline'}
                                    >
                                        {c.display_name}
                                    </Link>
                                );
                            })}
                        </nav>
                    )}

                    {hidden > 0 && (
                        <Card className="border-brand-line bg-brand-soft/40">
                            <p className="text-sm text-ink-soft">
                                {hidden} more {hidden === 1 ? 'child is' : 'children are'} linked
                                to your account. This plan shows up to {maxChildren}.
                            </p>
                            <Link href="/pricing" className="btn-primary mt-4">
                                Upgrade to Family
                            </Link>
                        </Card>
                    )}

                    <ChildSummary studentId={child.id} name={child.display_name} />

                    <Card>
                        <h2 className="font-semibold text-ink">Manage access</h2>
                        <p className="mt-1.5 text-pretty text-sm leading-relaxed text-ink-soft">
                            Removing access takes effect immediately. Your child keeps their
                            progress and can link again at any time.
                        </p>
                        <div className="mt-4">
                            <ChildSwitcher
                                children={visible.map((c: any) => ({
                                    id: c.id,
                                    display_name: c.display_name,
                                }))}
                                activeId={child.id}
                            />
                        </div>
                    </Card>

                    <PrivacyNote title="Visible because you are the linked parent">
                        Only linked parents and the student can read this data — enforced by
                        row-level security, not just by our interface.
                    </PrivacyNote>
                </>
            )}
        </div>
    );
}

/**
 * Progress detail for the selected child.
 *
 * Split into its own component so the link-management UI above can render even
 * when there is no child to report on yet.
 */
async function ChildSummary({ studentId, name }: { studentId: string; name: string }) {
    const sb = createClient();
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [{ data: answers }, { data: progress }, { data: recs }, { data: misc }] =
        await Promise.all([
            sb
                .from('student_answers')
                .select('is_correct, created_at')
                .eq('student_id', studentId)
                .gte('created_at', since.toISOString()),
            sb
                .from('skill_progress')
                .select('mastery, skills(id, name, topics(name))')
                .eq('student_id', studentId)
                .order('mastery', { ascending: false }),
            sb
                .from('recommendations')
                .select('reason, skills(name)')
                .eq('student_id', studentId)
                .eq('dismissed', false)
                .order('created_at', { ascending: false })
                .limit(1),
            sb
                .from('misconceptions')
                .select('description, skills(name)')
                .eq('student_id', studentId)
                .eq('resolved', false),
        ]);

    const total = answers?.length ?? 0;
    const correct = (answers ?? []).filter((a) => a.is_correct).length;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;
    const strengths = (progress ?? []).filter((p: any) => p.mastery >= 0.75).slice(0, 3);
    const needsWork = (progress ?? []).filter((p: any) => p.mastery < 0.5).slice(0, 3);
    const rec = recs?.[0] as { reason: string; skills?: { name: string } } | undefined;

    return (
        <div className="space-y-6">
            <SectionHeading
                align="left"
                eyebrow="Last 30 days"
                title={`${name}'s progress`}
                description="A summary you can read in a minute — strengths, gaps, and what to work on next."
            />

            <div className="grid grid-cols-3 gap-3">
                <Stat label="Questions" value={total} />
                <Stat label="Accuracy" value={`${accuracy}%`} />
                <Stat label="Concepts" value={progress?.length ?? 0} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                    <h3 className="mb-4 font-semibold text-ink">Strong areas</h3>
                    {strengths.length ? (
                        <div className="space-y-4">
                            {strengths.map((s: any) => (
                                <SkillBar key={s.skills.id} label={s.skills.name} value={s.mastery} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-ink-mute">Not enough data yet.</p>
                    )}
                </Card>

                <Card>
                    <h3 className="mb-4 font-semibold text-ink">Needs practice</h3>
                    {needsWork.length ? (
                        <div className="space-y-4">
                            {needsWork.map((s: any) => (
                                <SkillBar key={s.skills.id} label={s.skills.name} value={s.mastery} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-ink-mute">Nothing flagged yet.</p>
                    )}
                </Card>
            </div>

            {misc?.length ? (
                <Card>
                    <h3 className="mb-3 font-semibold text-ink">Patterns we&apos;ve noticed</h3>
                    <ul className="list-disc space-y-2 pl-5 text-sm text-ink-soft">
                        {misc.map((m: any, i: number) => (
                            <li key={i}>
                                {m.description} <span className="text-ink-mute">({m.skills?.name})</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            ) : null}

            {rec && (
                <Card className="border-brand-line bg-brand-soft/50">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
                        AI recommendation
                    </p>
                    <p className="mt-1.5 font-semibold text-ink">{rec.skills?.name}</p>
                    <p className="mt-1.5 text-pretty text-sm leading-relaxed text-ink-soft">
                        {rec.reason}
                    </p>
                </Card>
            )}
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="card card-hover p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-mute">{label}</p>
            <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-ink">
                {value}
            </p>
        </div>
    );
}
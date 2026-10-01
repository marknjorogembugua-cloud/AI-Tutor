import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PrivacyNote } from '@/components/Trust';
import { SectionHeading } from '@/components/ui/Card';
import { getEntitlements } from '@/lib/billing/entitlements';
import { createClient } from '@/lib/supabase/server';
import AccountPanel from './AccountPanel';
import DangerZone from './DangerZone';
import LinkParentPanel from './LinkParentPanel';
import PlanSettings from './PlanSettings';

export const metadata: Metadata = { title: 'Settings — AI Personal Tutor' };

export default async function SettingsPage() {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) redirect('/login');

    const [{ data: roleRow }, { data: profile }, entitlements] = await Promise.all([
        sb.from('users').select('role').eq('id', user.id).maybeSingle(),
        sb
            .from('students')
            .select('id, display_name, parent_id')
            .eq('id', user.id)
            .maybeSingle(),
        getEntitlements(user.id),
    ]);

    // Read the linked parent's name for the child-facing panel. RLS allows a
    // parent to read their children, not the reverse, so this goes through a
    // join the child can see — and a null here is expected and handled, since a
    // learner may have a parent_id with no visible parents row.
    const parentId = profile?.parent_id ?? null;
    const { data: parentRow } = parentId
        ? await sb
              .from('parents')
              .select('display_name')
              .eq('id', parentId)
              .maybeSingle()
        : { data: null };

    const role = roleRow?.role ?? 'student';

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <SectionHeading
                align="left"
                eyebrow="Account"
                title="Settings"
                description="Your plan, your daily allowance, and how to change or cancel billing."
            />

            <PlanSettings entitlements={entitlements} />

            {role === 'student' && (
                <LinkParentPanel
                    student={
                        profile
                            ? {
                                  id: profile.id,
                                  display_name: profile.display_name,
                                  parent_id: profile.parent_id,
                              }
                            : null
                    }
                    parentName={parentRow?.display_name ?? null}
                />
            )}

            <AccountPanel email={user.email ?? null} />

            <DangerZone email={user.email ?? null} />

            <PrivacyNote title="Billing data">
                We store your Stripe customer id and subscription status so we can show you your
                plan. We never see or store your card details.
            </PrivacyNote>
        </div>
    );
}
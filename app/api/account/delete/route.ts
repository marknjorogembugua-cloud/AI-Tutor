import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { BillingNotConfigured, requireStripe } from '@/lib/billing/stripe';

const Body = z.object({ password: z.string().min(1) });

/**
 * DELETE — delete the caller's account and everything attached to it.
 *
 * Requires the current password so a borrowed or unattended session cannot
 * destroy an account, and cancels any subscription first: deleting the auth user
 * leaves the Stripe subscription running, which is the single worst failure mode
 * of an unauthenticated delete endpoint.
 *
 * Order matters. Billing is stopped before the user row goes, because
 * cancellation is the step that can fail loudly and should not happen after the
 * data is already gone.
 */
export async function DELETE(req: Request) {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'password_required', detail: 'Confirm with your password.' },
            { status: 400 }
        );
    }

    // Re-authenticate. `getUser` alone only proves the cookie is still valid.
    const { error: authError } = await sb.auth.signInWithPassword({
        email: user.email ?? '',
        password: parsed.data.password,
    });
    if (authError) {
        return NextResponse.json(
            { error: 'invalid_password', detail: 'That password is not right.' },
            { status: 403 }
        );
    }

    // Best-effort cancellation. If Stripe is not configured, or the subscription
    // has already lapsed, deletion should still go ahead rather than leaving the
    // account undeletable — the user's data is their decision, ours is only the
    // billing record.
    let billingWarning: string | null = null;
    try {
        const { data: sub } = await sb
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (sub?.stripe_customer_id) {
            const stripe = requireStripe();
            await stripe.subscriptions.cancel(sub.stripe_customer_id);
        }
    } catch (e) {
        if (!(e instanceof BillingNotConfigured)) {
            console.error('subscription cancel during account delete failed', e);
        }
        billingWarning =
            'Your subscription may need cancelling separately from the Stripe dashboard.';
    }

    // Deleting an auth user is an admin operation; the session client is
    // deliberately read/write-scoped to the caller's own rows.
    const admin = createAdminClient();
    if (!admin) {
        return NextResponse.json(
            { error: 'not_configured', detail: 'Set SUPABASE_SERVICE_ROLE_KEY.' },
            { status: 503 }
        );
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) {
        console.error('account delete failed', deleteError);
        return NextResponse.json(
            { error: 'delete_failed', detail: 'Could not delete the account. Try again shortly.' },
            { status: 500 }
        );
    }

    return NextResponse.json({ ok: true, billingWarning });
}

export const dynamic = 'force-dynamic';
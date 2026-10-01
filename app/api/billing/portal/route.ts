import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BillingNotConfigured, requireStripe, siteUrl } from '@/lib/billing/stripe';

/**
 * POST — open the Stripe customer portal so a learner can update cards,
 * download invoices or cancel. Stripe rejects portal sessions without an
 * existing customer, so this only makes sense once checkout has happened.
 */
export async function POST() {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { data: sub } = await sb
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (!sub?.stripe_customer_id) {
        return NextResponse.json(
            { error: 'no_billing_account', detail: 'Start a subscription first.' },
            { status: 400 }
        );
    }

    let stripe;
    try {
        stripe = requireStripe();
    } catch (e) {
        if (e instanceof BillingNotConfigured) {
            return NextResponse.json(
                { error: 'billing_not_configured', detail: 'Set STRIPE_SECRET_KEY.' },
                { status: 503 }
            );
        }
        throw e;
    }

    try {
        const session = await stripe.billingPortal.sessions.create({
            customer: sub.stripe_customer_id,
            return_url: `${siteUrl()}/settings`,
        });
        return NextResponse.json({ url: session.url });
    } catch (e) {
        console.error('portal session failed', e);
        return NextResponse.json({ error: 'portal_failed' }, { status: 502 });
    }
}

export const dynamic = 'force-dynamic';
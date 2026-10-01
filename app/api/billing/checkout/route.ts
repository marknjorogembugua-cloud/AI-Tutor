import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getPlan } from '@/lib/billing/plans';
import {
    BillingNotConfigured,
    requireStripe,
    siteUrl,
    stripePriceId,
} from '@/lib/billing/stripe';

const Body = z.object({ plan: z.string(), returnPath: z.string().optional() });

/**
 * POST — create a Stripe Checkout session for the signed-in learner.
 * The plan is resolved server-side from our own catalogue; the client only ever
 * names which plan it wants, never a price.
 */
export async function POST(req: Request) {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: 'bad request' }, { status: 400 });

    const plan = getPlan(parsed.data.plan);
    if (plan.id === 'free') {
        return NextResponse.json({ error: 'free plan needs no checkout' }, { status: 400 });
    }

    const price = stripePriceId(plan);
    if (!price) {
        return NextResponse.json(
            {
                error: 'billing_not_configured',
                detail: `Set ${plan.stripePriceEnv} to your Stripe price id to enable checkout.`,
            },
            { status: 503 }
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

    // Reuse the existing customer so upgrades don't pile up Stripe records.
    const { data: existing } = await sb
        .from('subscriptions')
        .select('stripe_customer_id, stripe_subscription_id')
        .eq('user_id', user.id)
        .maybeSingle();

    const base = siteUrl();
    const returnTo =
        parsed.data.returnPath?.startsWith('/') && !parsed.data.returnPath.startsWith('//')
            ? `${base}${parsed.data.returnPath}`
            : `${base}/settings`;

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [{ price, quantity: 1 }],
            // Read back by the webhook to attribute the subscription.
            client_reference_id: user.id,
            customer: existing?.stripe_customer_id ?? undefined,
            customer_email: existing?.stripe_customer_id ? undefined : user.email,
            // Stripe only accepts these on creation, not on update — so
            // subscription updates go through the billing portal instead.
            subscription_data: {
                metadata: { user_id: user.id, plan: plan.id },
            },
            allow_promotion_codes: true,
            success_url: `${base}/settings?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${returnTo}?checkout=cancelled`,
        });

        return NextResponse.json({ url: session.url });
    } catch (e) {
        console.error('checkout session failed', e);
        return NextResponse.json({ error: 'checkout_failed' }, { status: 502 });
    }
}

export const dynamic = 'force-dynamic';
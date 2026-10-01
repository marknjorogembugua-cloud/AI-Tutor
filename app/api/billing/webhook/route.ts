import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { PLANS } from '@/lib/billing/plans';
import { planForPriceId, requireStripe } from '@/lib/billing/stripe';

/**
 * Stripe webhook — the only place paid entitlements are granted.
 *
 * Security posture: the raw body is verified against STRIPE_WEBHOOK_SECRET
 * before anything is parsed or trusted, and the caller's identity always comes
 * from Stripe metadata rather than the request. The service-role client is only
 * ever handed a user id that Stripe itself asserted.
 */

export const dynamic = 'force-dynamic';
// Node runtime: the body must be read as raw bytes for signature verification.
export const runtime = 'nodejs';

type SyncArgs = {
    userId: string;
    customerId: string | null;
    subscriptionId: string | null;
    priceId: string | null;
    status: string;
    periodEnd: string | null;
    cancelAtPeriodEnd: boolean;
};

async function syncSubscription(args: SyncArgs) {
    const admin = createAdminClient();
    if (!admin) {
        console.error('webhook: SUPABASE_SERVICE_ROLE_KEY missing, cannot sync');
        return;
    }
    const plan = planForPriceId(args.priceId);
    const { error } = await admin.rpc('sync_subscription', {
        p_user: args.userId,
        p_customer: args.customerId,
        p_subscription: args.subscriptionId,
        p_price: args.priceId,
        p_plan: plan.id,
        p_status: args.status,
        p_period_end: args.periodEnd,
        p_cancel_at_period_end: args.cancelAtPeriodEnd,
    });
    if (error) console.error('webhook sync failed', error);
}

async function downgrade(subscriptionId: string, customerId: string | null) {
    const admin = createAdminClient();
    if (!admin) return;

    // Resolve the owner from what we already stored — never from the payload.
    let q = admin
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscriptionId);
    const { data: bySub } = await q.maybeSingle();
    let userId = bySub?.user_id ?? null;

    if (!userId && customerId) {
        const { data: byCustomer } = await admin
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();
        userId = byCustomer?.user_id ?? null;
    }
    if (!userId) {
        console.error('webhook: cannot resolve user for subscription', subscriptionId);
        return;
    }

    const { error } = await admin.rpc('sync_subscription', {
        p_user: userId,
        p_customer: customerId,
        p_subscription: subscriptionId,
        p_price: null,
        p_plan: PLANS.free.id,
        p_status: 'canceled',
        p_period_end: null,
        p_cancel_at_period_end: false,
    });
    if (error) console.error('webhook downgrade failed', error);
}

function priceIdFrom(sub: Stripe.Subscription): string | null {
    const item = sub.items?.data?.[0];
    return item?.price?.id ?? null;
}

function periodEndFrom(sub: Stripe.Subscription): string | null {
    const value =
        (sub as unknown as { current_period_end?: number }).current_period_end ??
        sub.items?.data?.[0]?.current_period_end;
    return typeof value === 'number' ? new Date(value * 1000).toISOString() : null;
}

export async function POST(req: Request) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
        return NextResponse.json({ error: 'webhook not configured' }, { status: 503 });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
        return NextResponse.json({ error: 'missing signature' }, { status: 400 });
    }

    const stripe = requireStripe();
    const payload = await req.text();

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (e) {
        const message = e instanceof Error ? e.message : 'unknown';
        return NextResponse.json({ error: `bad signature: ${message}` }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId =
                    session.client_reference_id ?? session.metadata?.user_id ?? null;
                if (!userId) break;

                // The subscription object carries the authoritative state.
                if (typeof session.subscription === 'string') {
                    const sub = await stripe.subscriptions.retrieve(session.subscription);
                    await syncSubscription({
                        userId,
                        customerId:
                            typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null,
                        subscriptionId: sub.id,
                        priceId: priceIdFrom(sub),
                        status: sub.status,
                        periodEnd: periodEndFrom(sub),
                        cancelAtPeriodEnd: sub.cancel_at_period_end,
                    });
                } else {
                    await syncSubscription({
                        userId,
                        customerId:
                            typeof session.customer === 'string'
                                ? session.customer
                                : session.customer?.id ?? null,
                        subscriptionId: null,
                        priceId: null,
                        status: 'active',
                        periodEnd: null,
                        cancelAtPeriodEnd: false,
                    });
                }
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.resumed': {
                const sub = event.data.object as Stripe.Subscription;
                const userId = sub.metadata?.user_id ?? null;
                if (!userId) {
                    console.error('webhook: subscription has no user_id metadata', sub.id);
                    break;
                }
                await syncSubscription({
                    userId,
                    customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null,
                    subscriptionId: sub.id,
                    priceId: priceIdFrom(sub),
                    status: sub.status,
                    periodEnd: periodEndFrom(sub),
                    cancelAtPeriodEnd: sub.cancel_at_period_end,
                });
                break;
            }

            case 'customer.subscription.deleted': {
                const sub = event.data.object as Stripe.Subscription;
                await downgrade(
                    sub.id,
                    typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null
                );
                break;
            }

            default:
                break;
        }
    } catch (e) {
        // 500 tells Stripe to retry; without this a transient DB blip would
        // silently leave a paying learner on the free tier.
        console.error('webhook handler failed', event.type, e);
        return NextResponse.json({ error: 'handler failed' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
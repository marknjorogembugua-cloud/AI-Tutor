import 'server-only';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import {
    PLANS,
    getPlan,
    subscriptionIsLive,
    type Plan,
    type PlanId,
} from './plans';

export type Entitlements = {
    planId: PlanId;
    plan: Plan;
    /** True when a live paid subscription is backing this. */
    isPaid: boolean;
    dailyLimit: number;
    /** Non-null only when the limit is a real number. */
    usedToday: number | null;
    remainingToday: number | null;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string | null;
    hasStripeCustomer: boolean;
};

const FREE: Entitlements = {
    planId: 'free',
    plan: PLANS.free,
    isPaid: false,
    dailyLimit: PLANS.free.dailyQuestionLimit,
    usedToday: null,
    remainingToday: null,
    cancelAtPeriodEnd: false,
    currentPeriodEnd: null,
    hasStripeCustomer: false,
};

/**
 * Read the caller's entitlements using their own session, so RLS guarantees we
 * only ever read their row. No service role involved.
 */
export async function getEntitlements(userId: string): Promise<Entitlements> {
    const sb = createClient();
    const { data } = await sb
        .from('subscriptions')
        .select('plan, status, current_period_end, cancel_at_period_end, stripe_customer_id')
        .eq('user_id', userId)
        .maybeSingle();

    if (!data) return { ...FREE, usedToday: await usedToday(userId) };

    const plan = getPlan(data.plan);
    const isPaid = plan.id !== 'free' && subscriptionIsLive(data.status);

    return {
        planId: isPaid ? plan.id : 'free',
        plan: isPaid ? plan : PLANS.free,
        isPaid,
        dailyLimit: isPaid ? plan.dailyQuestionLimit : PLANS.free.dailyQuestionLimit,
        usedToday: await usedToday(userId),
        remainingToday: null,
        cancelAtPeriodEnd: Boolean(data.cancel_at_period_end),
        currentPeriodEnd: data.current_period_end ?? null,
        hasStripeCustomer: Boolean(data.stripe_customer_id),
    };
}

async function usedToday(userId: string): Promise<number | null> {
    const admin = createAdminClient();
    if (!admin) return null;
    const { data } = await admin
        .from('usage_counters')
        .select('questions')
        .eq('user_id', userId)
        .eq('day', new Date().toISOString().slice(0, 10))
        .maybeSingle();
    return data?.questions ?? 0;
}

export type QuotaResult =
    | { allowed: true; entitlements: Entitlements }
    | { allowed: false; entitlements: Entitlements };

/**
 * Atomically claim one question against the caller's daily allowance.
 *
 * The decision and the increment happen inside a Postgres function under a row
 * lock, so concurrent requests cannot both claim the last slot. Paid plans have
 * an unlimited limit and short-circuit without touching the counter.
 */
export async function consumeQuestionQuota(userId: string): Promise<QuotaResult> {
    const entitlements = await getEntitlements(userId);
    const limit = entitlements.dailyLimit;

    if (!Number.isFinite(limit)) return { allowed: true, entitlements };

    const sb = createClient();
    const { data, error } = await sb.rpc('consume_question_quota', {
        p_user: userId,
        p_limit: limit,
    });

    if (error || !data?.[0]) {
        // Fail closed on the limiter itself: an unmetered question is unbounded
        // spend. The learner can still see their dashboard and retry.
        return {
            allowed: false,
            entitlements: { ...entitlements, usedToday: null, remainingToday: 0 },
        };
    }

    const row = data[0] as { allowed: boolean; used: number; remaining: number };
    return {
        allowed: row.allowed,
        entitlements: {
            ...entitlements,
            usedToday: row.used,
            remainingToday: row.remaining,
        },
    };
}
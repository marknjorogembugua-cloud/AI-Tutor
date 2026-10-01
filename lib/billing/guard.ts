import 'server-only';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { consumeQuestionQuota, type Entitlements } from './entitlements';

export type Allowance =
    | { ok: true; entitlements: Entitlements }
    | { ok: false; response: NextResponse };

/**
 * Charge one question against the caller's daily allowance before any paid work
 * happens.
 *
 * Metered: every route that generates new tutor content — next-question,
 * diagnostic, hint, explain.
 *
 * Deliberately not metered: /api/tutor/analyze. It grades an answer to a question
 * the learner has already been charged for, so charging again would bill them
 * twice for one exercise and could strand them mid-question with no way to
 * submit what they had already worked out.
 */
export async function requireQuestionAllowance(userId: string): Promise<Allowance> {
    const { allowed, entitlements } = await consumeQuestionQuota(userId);
    if (allowed) return { ok: true, entitlements };

    return {
        ok: false,
        response: NextResponse.json(
            {
                error: 'daily_limit_reached',
                message: `You have used all ${entitlements.dailyLimit} free questions for today. They reset at midnight, or upgrade for unlimited questions.`,
                plan: entitlements.planId,
                limit: entitlements.dailyLimit,
                usedToday: entitlements.usedToday,
            },
            // 402 Payment Required — accurate: the work is blocked pending payment.
            { status: 402 }
        ),
    };
}
/**
 * Give a reserved slot back when the paid work it was reserved for never
 * happened.
 *
 * The allowance is claimed before the AI call so concurrent requests can't both
 * take the last slot. If the provider then fails, the learner was not served,
 * so decrementing keeps a transient outage (or an exhausted provider balance)
 * from silently costing them their daily questions.
 */
export async function refundQuestionAllowance(userId: string): Promise<void> {
    try {
        const sb = createClient();
        await sb.rpc('release_question_quota', { p_user: userId });
    } catch (e) {
        // Best effort: never let the refund path mask the original failure.
        console.error('quota refund failed', e);
    }
}

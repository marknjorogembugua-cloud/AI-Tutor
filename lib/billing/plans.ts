/**
 * Plan catalogue — the single source of truth for pricing, quotas and feature
 * gating. The pricing page, the API routes and the Stripe checkout all read
 * from here, so a price or limit is changed in one place.
 */

import { CURRICULUM_STATS } from '@/lib/curriculum.generated';

export type PlanId = 'free' | 'family';

export type Plan = {
    id: PlanId;
    name: string;
    tagline: string;
    /** Price in the smallest currency unit (cents). */
    priceCents: number;
    /** Stripe price id. Null for the free plan, which is never sold. */
    stripePriceEnv: string | null;
    /** Questions the learner may generate per calendar day. */
    dailyQuestionLimit: number;
    features: string[];
    featured: boolean;
};

export const FREE_DAILY_QUESTIONS = 5;

/**
 * Counts come from the generated catalogue rather than being written out, so the
 * marketing copy cannot claim a subject total the tutor does not serve.
 */
const EVERYTHING = `All ${CURRICULUM_STATS.subjects} subjects and ${CURRICULUM_STATS.topics} topics`;

export const PLANS: Record<PlanId, Plan> = {
    free: {
        id: 'free',
        name: 'Free',
        tagline: 'Try it out',
        priceCents: 0,
        stripePriceEnv: null,
        dailyQuestionLimit: FREE_DAILY_QUESTIONS,
        features: [
            `${FREE_DAILY_QUESTIONS} AI questions per day`,
            EVERYTHING,
            'Diagnostic assessment',
            'Basic progress tracking',
        ],
        featured: false,
    },
    family: {
        id: 'family',
        name: 'Family',
        tagline: 'For ongoing learning',
        priceCents: 1900,
        stripePriceEnv: 'STRIPE_PRICE_FAMILY',
        dailyQuestionLimit: Number.POSITIVE_INFINITY,
        features: [
            'Unlimited AI questions',
            EVERYTHING,
            'Full progress tracking',
            'Parent dashboard',
            'Personalised recommendations',
            'Up to 5 children',
        ],
        featured: true,
    },
};

export const PLAN_LIST: Plan[] = [PLANS.free, PLANS.family];

export function isPlanId(value: unknown): value is PlanId {
    return value === 'free' || value === 'family';
}

export function getPlan(id: string | null | undefined): Plan {
    return isPlanId(id) ? PLANS[id] : PLANS.free;
}

export function formatPrice(cents: number): string {
    if (cents === 0) return '$0';
    return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

/**
 * A subscription only grants paid entitlements while Stripe considers it live.
 * Everything else (trialling, past due, paused) falls back to free so we never
 * serve an unpaid learner the paid tier.
 */
export const ACTIVE_STATUSES = new Set(['active', 'trialing']);

export function subscriptionIsLive(status: string | null): boolean {
    return ACTIVE_STATUSES.has(status ?? 'active');
}
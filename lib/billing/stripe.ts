import 'server-only';
import Stripe from 'stripe';
import { PLANS, type Plan } from './plans';

let client: Stripe | null = null;

/**
 * Lazily constructed so a missing key never breaks a build or a public page.
 * Routes that genuinely need Stripe call requireStripe() and handle the error.
 */
export function stripe(): Stripe | null {
    if (!process.env.STRIPE_SECRET_KEY) return null;
    if (!client) {
        client = new Stripe(process.env.STRIPE_SECRET_KEY, {
            // Pinned to the SDK's bundled version so a library upgrade can't
            // silently change response shapes underneath us.
            apiVersion: '2026-09-30.endive',
            typescript: true,
            appInfo: { name: 'AI Personal Tutor' },
        });
    }
    return client;
}

export class BillingNotConfigured extends Error {
    constructor() {
        super('Stripe is not configured');
        this.name = 'BillingNotConfigured';
    }
}

export function requireStripe(): Stripe {
    const s = stripe();
    if (!s) throw new BillingNotConfigured();
    return s;
}

/** The real Stripe price id for a plan, or null if that plan isn't purchasable. */
export function stripePriceId(plan: Plan): string | null {
    if (!plan.stripePriceEnv) return null;
    return process.env[plan.stripePriceEnv] || null;
}

export function siteUrl(): string {
    const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
    if (configured) return configured;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'http://localhost:3000';
}

/** Map a Stripe price id back to one of our plans. */
export function planForPriceId(priceId: string | null | undefined): Plan {
    for (const plan of Object.values(PLANS)) {
        const id = plan.stripePriceEnv ? process.env[plan.stripePriceEnv] : null;
        if (id && id === priceId) return plan;
    }
    return PLANS.free;
}
import 'server-only';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
    const cookieStore = cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
                set(name: string, value: string, options: CookieOptions) {
                    try { cookieStore.set({ name, value, ...options }); } catch { }
                },
                remove(name: string, options: CookieOptions) {
                    try { cookieStore.set({ name, value: '', ...options }); } catch { }
                },
            },
        }
    );
}

/**
 * Service-role client. Bypasses RLS, so it must only ever be used with an
 * id that came from a verified source (Stripe webhook metadata, or the caller's
 * own verified Supabase session) — never straight from a request body.
 *
 * Returns null when the key is absent so the app still runs without billing
 * configured; callers fall back to free-tier behaviour.
 */
export function createAdminClient() {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) return null;
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        key,
        { auth: { persistSession: false, autoRefreshToken: false } }
    );
}
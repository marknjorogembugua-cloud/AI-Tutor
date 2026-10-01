import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    // Fast path: no auth cookies means there is nothing to refresh. Skipping the
    // Supabase round trip here keeps anonymous traffic (marketing, auth pages,
    // static assets) at near-zero middleware cost.
    if (!hasAuthCookie(req)) return NextResponse.next({ request: { headers: req.headers } });

    let res = NextResponse.next({ request: { headers: req.headers } });

    const sb = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    req.cookies.set({ name, value, ...options });
                    res = NextResponse.next({ request: { headers: req.headers } });
                    res.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    req.cookies.set({ name, value: '', ...options });
                    res = NextResponse.next({ request: { headers: req.headers } });
                    res.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    // Validates the JWT against the auth server and refreshes it when near expiry.
    await sb.auth.getUser();

    return res;
}

const AUTH_COOKIE = /^sb-[a-z0-9]+-auth-token/;

function hasAuthCookie(req: NextRequest): boolean {
    return req.cookies.getAll().some((c) => AUTH_COOKIE.test(c.name));
}

export const config = {
    // Exclude Next internals, the icon, and any path with a file extension
    // (css, js, images, fonts). Everything else hits the cheap fast path above.
    matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.[a-zA-Z0-9]+$).*)'],
};

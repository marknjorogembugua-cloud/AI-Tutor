import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const Body = z.object({
    code: z
        .string()
        .trim()
        .min(4)
        // Long enough to allow a pasted code with spaces or dashes, short enough
        // that this cannot be used to push megabytes at the function.
        .max(32),
});

/**
 * POST — redeem an invite code as the signed-in student.
 *
 * All of the validation (code exists, is pending, unexpired, and this account
 * is not already linked) lives in redeem_parent_invite(), because it has to be
 * atomic — two children racing for the same code must not both win. This route
 * only translates the SQL error into HTTP.
 */
export async function POST(req: Request) {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
        return NextResponse.json({ error: 'bad request' }, { status: 400 });
    }

    const { data: roleRow } = await sb
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
    if (roleRow?.role === 'parent') {
        return NextResponse.json(
            { error: 'not_a_student', detail: 'Parent accounts cannot redeem a code.' },
            { status: 403 }
        );
    }

    const { data: parentId, error } = await sb.rpc('redeem_parent_invite', {
        p_code: parsed.data.code,
    });

    if (error) {
        // P0002 is the raise we use for a rejected code; 42501 is an auth
        // problem. Both are the caller's fault to fix, so 400 is right for them.
        const rejected =
            error.code === 'P0002' || error.code === '42501';
        if (!rejected) {
            console.error('redeem_parent_invite failed', error);
            return NextResponse.json({ error: 'could_not_redeem' }, { status: 500 });
        }
        return NextResponse.json(
            { error: 'invalid_code', detail: error.message },
            { status: 400 }
        );
    }

    return NextResponse.json({ ok: true, parentId });
}

export const dynamic = 'force-dynamic';
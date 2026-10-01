import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const Body = z.object({ studentId: z.string().uuid() });

/**
 * POST — drop a parent → child link.
 *
 * Rides on a SECURITY DEFINER function because the migration's guard trigger
 * blocks application-level writes to students.parent_id; the alternative would
 * be a policy that lets a parent write that column directly, which is the hole
 * the trigger exists to close.
 *
 * Takes the student id as an argument rather than reading it from the body
 * unchecked — RLS inside the function scopes the update to the caller's own
 * children, so a wrong id is a no-op, not a data leak.
 */
export async function POST(req: Request) {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
        return NextResponse.json({ error: 'bad request' }, { status: 400 });
    }

    const { data: unlinked, error } = await sb.rpc('unlink_child', {
        p_student: parsed.data.studentId,
    });

    if (error) {
        console.error('unlink_child failed', error);
        return NextResponse.json({ error: 'could_not_unlink' }, { status: 500 });
    }

    // found = false means no row matched, i.e. that child was not linked to
    // this parent. Report it as 404 rather than a silent success so the UI can
    // refresh to the true state.
    if (!unlinked) {
        return NextResponse.json(
            { error: 'not_linked', detail: 'That child is not linked to your account.' },
            { status: 404 }
        );
    }

    return NextResponse.json({ ok: true });
}

export const dynamic = 'force-dynamic';
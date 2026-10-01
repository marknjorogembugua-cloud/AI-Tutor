import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getEntitlements } from '@/lib/billing/entitlements';
import { MAX_CHILDREN, FREE_MAX_CHILDREN } from '@/lib/parent/limits';

/**
 * Parent → child linking, over invite codes.
 *
 * A code is the right primitive here rather than matching on email: a parent
 * and child rarely share an inbox, and email-based linking would let anyone who
 * knows a learner's address attach themselves to that learner's history.
 * Possession of a short, expiring code is the authorisation.
 *
 * Code shape: 8 characters from a 31-symbol alphabet. 31^8 is ~8.5e11, so
 * guessing one is hopeless within a 7-day expiry, and the generator retries on
 * the (vanishingly unlikely) collision.
 */

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I/L
const CODE_LENGTH = 8;

const CreateBody = z.object({
    /** The parent's label for the invite, e.g. "Ada — maths". Optional. */
    childLabel: z.string().trim().max(60).optional(),
});

async function newCode(): Promise<string> {
    const bytes = new Uint8Array(CODE_LENGTH);
    // Web Crypto is available in the Node and Edge runtimes Next uses here.
    crypto.getRandomValues(bytes);
    return Array.from(
        bytes,
        (b) => ALPHABET[b % ALPHABET.length]
    ).join('');
}

async function requireParent(sb: ReturnType<typeof createClient>, userId: string) {
    const { data: roleRow } = await sb
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
    return roleRow?.role === 'parent';
}

/**
 * POST — issue an invite code for the signed-in parent.
 */
export async function POST(req: Request) {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    // Defence in depth: migration 0009's RLS enforces this too, so a client that
    // bypasses this route still cannot mint codes.
    if (!(await requireParent(sb, user.id))) {
        return NextResponse.json(
            { error: 'not_a_parent', detail: 'Only parent accounts can issue invite codes.' },
            { status: 403 }
        );
    }

    const parsed = CreateBody.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
        return NextResponse.json({ error: 'bad request' }, { status: 400 });
    }

    // A live child is linked; a pending or revoked invite is not. Counting both
    // would let an expired row permanently consume a slot.
    const [{ count: linkedCount }, { count: pendingCount }] = await Promise.all([
        sb.from('students').select('id', { count: 'exact', head: true }).eq('parent_id', user.id),
        sb
            .from('parent_invites')
            .select('id', { count: 'exact', head: true })
            .eq('parent_id', user.id)
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString()),
    ]);

    const entitlements = await getEntitlements(user.id);
    const maxChildren = entitlements.isPaid ? MAX_CHILDREN : FREE_MAX_CHILDREN;
    const inUse = (linkedCount ?? 0) + (pendingCount ?? 0);

    if (inUse >= maxChildren) {
        return NextResponse.json(
            {
                error: 'child_limit_reached',
                detail: entitlements.isPaid
                    ? `The Family plan links up to ${MAX_CHILDREN} children.`
                    : `The free plan links ${FREE_MAX_CHILDREN} child. Upgrade to Family for up to ${MAX_CHILDREN}.`,
                maxChildren,
                linked: linkedCount ?? 0,
            },
            { status: 409 }
        );
    }

    // Two attempts is far more than the collision probability warrants, but the
    // unique index is the real guarantee and this just avoids a 500 in the
    // vanishingly unlikely case where it fires.
    for (let attempt = 0; attempt < 2; attempt++) {
        const code = await newCode();
        const { data, error } = await sb
            .from('parent_invites')
            .insert({ parent_id: user.id, code, child_label: parsed.data.childLabel ?? null })
            .select('code, child_label, expires_at')
            .single();

        if (!error) {
            return NextResponse.json({ invite: data, maxChildren, linked: linkedCount ?? 0 });
        }

        // 23505 = unique_violation, i.e. the code already existed.
        if (error.code === '23505') continue;
        console.error('invite insert failed', error);
        return NextResponse.json({ error: 'could_not_create_invite' }, { status: 500 });
    }

    return NextResponse.json(
        { error: 'could_not_create_invite', detail: 'Could not allocate a unique code.' },
        { status: 503 }
    );
}

/**
 * DELETE — revoke an invite.
 *
 * Revoking rather than deleting keeps the row as a record that the code existed
 * and was retired, so a code that leaks after revocation is still dead.
 */
export async function DELETE(req: Request) {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = z
        .object({ code: z.string().trim().min(1).max(32) })
        .safeParse(await req.json().catch(() => ({})));
    if (!body.success) return NextResponse.json({ error: 'bad request' }, { status: 400 });

    if (!(await requireParent(sb, user.id))) {
        return NextResponse.json(
            { error: 'not_a_parent', detail: 'Only parent accounts can revoke invite codes.' },
            { status: 403 }
        );
    }

    // Scoped by parent_id in the RLS policy, so this cannot revoke someone
    // else's invite even if a code is guessed.
    const { error } = await sb
        .from('parent_invites')
        .update({ status: 'revoked', expires_at: new Date().toISOString() })
        .eq('code', body.data.code.toUpperCase())
        .eq('status', 'pending');

    if (error) {
        console.error('invite revoke failed', error);
        return NextResponse.json({ error: 'could_not_revoke' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}

export const dynamic = 'force-dynamic';
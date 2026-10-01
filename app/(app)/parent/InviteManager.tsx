'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Card';

export type Invite = {
    code: string;
    child_label: string | null;
    status: 'pending' | 'accepted' | 'revoked';
    expires_at: string;
    created_at: string;
    accepted_at: string | null;
    childName: string | null;
};

/**
 * Parent-side invite management: create a code, show it for copying, revoke it.
 *
 * The code is rendered as selectable text rather than a "copy" button that needs
 * the clipboard API, because a parent is as likely to read it out over a table as
 * paste it. Copy is offered as an extra, not the only route.
 */
export default function InviteManager({
    invites,
    maxChildren,
    linked,
}: {
    invites: Invite[];
    maxChildren: number;
    linked: number;
}) {
    const router = useRouter();
    const [label, setLabel] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [revoking, setRevoking] = useState<string | null>(null);

    const pending = invites.filter(
        (i) => i.status === 'pending' && new Date(i.expires_at) > new Date()
    );
    const closed = invites.filter((i) => !pending.includes(i));
    const atLimit = linked + pending.length >= maxChildren;

    async function create(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setNotice(null);
        setBusy(true);

        try {
            const res = await fetch('/api/parent/invites', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ childLabel: label.trim() || undefined }),
            });
            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                setErr(json.detail ?? 'Could not create an invite code.');
                return;
            }

            setLabel('');
            setNotice('Code created. Give it to your child, then ask them to enter it.');
            router.refresh();
        } catch {
            setErr('Could not reach the server. Please try again.');
        } finally {
            setBusy(false);
        }
    }

    async function revoke(code: string) {
        setErr(null);
        setNotice(null);
        setRevoking(code);

        try {
            const res = await fetch('/api/parent/invites', {
                method: 'DELETE',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ code }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                setErr(json.detail ?? 'Could not withdraw that code.');
                return;
            }
            setNotice('Code withdrawn. It can no longer be used.');
            router.refresh();
        } catch {
            setErr('Could not reach the server. Please try again.');
        } finally {
            setRevoking(null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="card">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-semibold text-ink">Link a child</h2>
                    <p className="text-xs text-ink-mute">
                        {linked} linked · {pending.length} pending · {maxChildren} max
                    </p>
                </div>

                {linked === 0 && (
                    <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-soft">
                        Your child needs their own student account first — that separation is what
                        stops one family seeing another&apos;s work. Create a code below, then give
                        it to them.
                    </p>
                )}

                <form onSubmit={create} className="mt-5 space-y-4">
                    <div>
                        <label className="label" htmlFor="child-label">
                            Label for this child (optional)
                        </label>
                        <Input
                            id="child-label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="e.g. Ada — maths"
                            maxLength={60}
                        />
                        <p className="mt-1.5 text-xs text-ink-mute">
                            Only you see this. Your child never does.
                        </p>
                    </div>

                    {err && (
                        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                            {err}
                        </p>
                    )}
                    {notice && (
                        <p role="status" className="rounded-lg bg-brand-soft px-3 py-2 text-sm text-brand-ink">
                            {notice}
                        </p>
                    )}

                    <Button type="submit" disabled={busy || atLimit} className="w-full sm:w-auto">
                        {busy
                            ? 'Creating…'
                            : atLimit
                                ? `Limit of ${maxChildren} reached`
                                : 'Create invite code'}
                    </Button>

                    {atLimit && (
                        <p className="text-xs text-ink-mute">
                            Withdraw a pending code or unlink a child to make room.{' '}
                            <a href="/pricing" className="font-medium text-brand-ink hover:underline">
                                Compare plans
                            </a>
                        </p>
                    )}
                </form>
            </div>

            {pending.length > 0 && (
                <div className="card">
                    <h2 className="font-semibold text-ink">Waiting for your child</h2>
                    <ul className="mt-4 space-y-3">
                        {pending.map((invite) => (
                            <li
                                key={invite.code}
                                className="rounded-xl border border-line bg-surface-muted px-4 py-3.5"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-mono text-lg font-semibold tracking-widest text-ink">
                                            {invite.code}
                                        </p>
                                        <p className="mt-1 text-xs text-ink-mute">
                                            {invite.child_label ?? 'Unlabelled invite'}
                                            {' · expires '}
                                            {new Date(invite.expires_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={revoking === invite.code}
                                        onClick={() => revoke(invite.code)}
                                    >
                                        {revoking === invite.code ? 'Withdrawing…' : 'Withdraw'}
                                    </Button>
                                </div>
                                <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-ink-soft">
                                    <li>Ask your child to sign in to their own account.</li>
                                    <li>
                                        Have them open Settings and enter this code — or enter it
                                        during onboarding.
                                    </li>
                                </ol>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {closed.length > 0 && (
                <div className="card">
                    <h2 className="font-semibold text-ink">Earlier codes</h2>
                    <ul className="mt-4 space-y-2">
                        {closed.map((invite) => {
                            const expired =
                                invite.status === 'pending' &&
                                new Date(invite.expires_at) <= new Date();
                            return (
                                <li
                                    key={invite.code}
                                    className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2 last:border-0 last:pb-0"
                                >
                                    <span className="font-mono text-sm tracking-widest text-ink-mute">
                                        {invite.code}
                                    </span>
                                    <span className="text-xs text-ink-mute">
                                        {invite.child_label ?? 'Unlabelled'}
                                    </span>
                                    {invite.status === 'accepted' ? (
                                        <Badge tone="brand">
                                            Linked{invite.childName ? ` — ${invite.childName}` : ''}
                                        </Badge>
                                    ) : (
                                        <Badge tone={expired ? 'warn' : 'neutral'}>
                                            {expired ? 'Expired' : 'Withdrawn'}
                                        </Badge>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
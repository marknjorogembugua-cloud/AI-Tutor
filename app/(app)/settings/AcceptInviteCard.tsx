'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/**
 * The child's side of linking: paste a code from a parent, get access.
 *
 * Shows the parent account's display name on success so the child can see who
 * now has access — the link is meant to be visible in both directions, not a
 * silent grant.
 */
export default function AcceptInviteCard({ linkedTo }: { linkedTo: string | null }) {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [done, setDone] = useState<string | null>(linkedTo);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setBusy(true);

        try {
            const res = await fetch('/api/parent/accept', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ code }),
            });
            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                setErr(json.detail ?? 'That code did not work. Check it and try again.');
                return;
            }

            setDone('your parent');
            setCode('');
            // The dashboard and parent page both branch on this link.
            router.refresh();
        } catch {
            setErr('Could not reach the server. Please try again.');
        } finally {
            setBusy(false);
        }
    }

    if (done) {
        return (
            <div className="card border-brand-line bg-brand-soft/40">
                <h2 className="font-semibold text-ink">Linked to {done}</h2>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-soft">
                    {done === 'your parent'
                        ? 'They can now see your practice history, strengths and gaps. You can see the link too — it is never hidden from you.'
                        : 'A parent account can read your practice history, strengths and gaps.'}
                </p>
            </div>
        );
    }

    return (
        <div className="card">
            <h2 className="font-semibold text-ink">Have a code from a parent?</h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-soft">
                Enter the code they gave you to let them follow your progress. They&apos;ll see
                your questions, scores and gaps — nothing is shared until you do this.
            </p>

            <form onSubmit={submit} className="mt-5 space-y-4">
                <div>
                    <label className="label" htmlFor="invite-code">
                        Invite code
                    </label>
                    <Input
                        id="invite-code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="e.g. K7M2QP4X"
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        maxLength={32}
                        className="font-mono tracking-widest"
                        required
                    />
                </div>
                {err && (
                    <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                        {err}
                    </p>
                )}
                <Button type="submit" disabled={busy || !code.trim()} className="w-full sm:w-auto">
                    {busy ? 'Linking…' : 'Link to my parent'}
                </Button>
            </form>
        </div>
    );
}
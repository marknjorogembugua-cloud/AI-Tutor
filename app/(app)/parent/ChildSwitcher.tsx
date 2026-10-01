'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

/**
 * Remove a parent → child link.
 *
 * Destructive, so it asks twice: once to reveal, then by typing the child's
 * name. Removing a link means the parent immediately loses access to that
 * child's history, which is the correct outcome but not one to trigger by a
 * mis-tap.
 */
export default function ChildSwitcher({
    children,
    activeId,
}: {
    children: { id: string; display_name: string }[];
    activeId: string;
}) {
    const router = useRouter();
    const [confirming, setConfirming] = useState<string | null>(null);
    const [typed, setTyped] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const target = children.find((c) => c.id === confirming);

    async function unlink() {
        if (!target) return;
        setBusy(true);
        setErr(null);

        try {
            const res = await fetch('/api/parent/unlink', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ studentId: target.id }),
            });
            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                setErr(json.detail ?? 'Could not remove that link.');
                return;
            }

            setConfirming(null);
            setTyped('');
            router.refresh();
        } catch {
            setErr('Could not reach the server. Please try again.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="space-y-3">
            {children.map((child) => (
                <div
                    key={child.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0"
                >
                    <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{child.display_name}</p>
                        {child.id === activeId && (
                            <p className="text-xs text-ink-mute">Showing progress below</p>
                        )}
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setConfirming(child.id);
                            setTyped('');
                            setErr(null);
                        }}
                    >
                        Remove access
                    </Button>
                </div>
            ))}

            {target && (
                <div className="rounded-xl border border-danger/40 bg-danger-soft px-4 py-4">
                    <p className="text-sm font-semibold text-danger">
                        Remove {target.display_name}?
                    </p>
                    <p className="mt-1.5 text-pretty text-sm leading-relaxed text-ink-soft">
                        You&apos;ll lose access to their history immediately. Their account and
                        their progress are untouched, and they can link again with a new code.
                    </p>

                    <div className="mt-4">
                        <label className="label" htmlFor="confirm-name">
                            Type <strong>{target.display_name}</strong> to confirm
                        </label>
                        <input
                            id="confirm-name"
                            value={typed}
                            onChange={(e) => setTyped(e.target.value)}
                            autoComplete="off"
                            className="input"
                        />
                    </div>

                    {err && (
                        <p role="alert" className="mt-3 text-sm text-danger">
                            {err}
                        </p>
                    )}

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setConfirming(null)}
                            disabled={busy}
                        >
                            Keep access
                        </Button>
                        <button
                            type="button"
                            onClick={unlink}
                            disabled={busy || typed.trim() !== target.display_name}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                        >
                            {busy ? 'Removing…' : 'Remove access'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
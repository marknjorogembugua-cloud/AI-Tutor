'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/**
 * Delete-account controls.
 *
 * Behind two gates on purpose. The password check is enforced server-side, so
 * this is not just a UI trick; and the type-the-word confirmation exists because
 * the button is one tap away from every other button on the page and the outcome
 * is not undoable.
 *
 * The subscription is cancelled server-side before the account is removed. The
 * warning text says so explicitly, since "I deleted my account" followed by a
 * Stripe charge would be the worst outcome this flow could produce.
 */
export default function DangerZone({ email }: { email: string | null }) {
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const confirmed = confirmText.trim().toUpperCase() === 'DELETE';
    const canSubmit = Boolean(password) && confirmed && !busy;

    async function destroy() {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch('/api/account/delete', {
                method: 'DELETE',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(json.detail ?? 'Could not delete the account. Try again shortly.');
                return;
            }
            // A full navigation rather than a client-side redirect: the session
            // cookie is dead server-side, and the landing page must not try to
            // render anything from the destroyed account.
            window.location.href = json.billingWarning
                ? `/login?deleted=1&billing=${encodeURIComponent(json.billingWarning)}`
                : '/login?deleted=1';
        } catch {
            setError('Could not reach the server. Please try again.');
        } finally {
            setBusy(false);
        }
    }

    if (!open) {
        return (
            <div className="card border-line">
                <h2 className="font-semibold text-ink">Delete account</h2>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-soft">
                    Removes your account, progress and history permanently. Any paid plan is
                    cancelled as part of this.
                </p>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setOpen(true)}>
                    Delete my account
                </Button>
            </div>
        );
    }

    return (
        <div className="card border-danger/40 bg-danger-soft/40 p-6">
            <h2 className="text-lg font-semibold text-danger">Delete this account</h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-soft">
                This cannot be undone. Your questions, scores, streaks and any link to a
                parent&apos;s account are erased.
                {email && <> Signed in as <span className="font-medium text-ink">{email}</span>.</>}
            </p>

            <div className="mt-5 space-y-4">
                <div>
                    <label className="label" htmlFor="delete-password">
                        Your password
                    </label>
                    <Input
                        id="delete-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />
                </div>

                <div>
                    <label className="label" htmlFor="delete-confirm">
                        Type <span className="font-mono text-ink">DELETE</span> to confirm
                    </label>
                    <Input
                        id="delete-confirm"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                    />
                </div>

                {error && (
                    <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                        {error}
                    </p>
                )}

                <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="danger" disabled={!canSubmit} onClick={destroy}>
                        {busy ? 'Deleting…' : 'Delete permanently'}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => {
                            setOpen(false);
                            setPassword('');
                            setConfirmText('');
                            setError(null);
                        }}
                    >
                        Keep my account
                    </Button>
                </div>
            </div>
        </div>
    );
}
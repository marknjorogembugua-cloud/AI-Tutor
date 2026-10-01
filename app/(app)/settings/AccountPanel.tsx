'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/**
 * Email and password controls.
 *
 * Password change goes through Supabase directly from the browser rather than
 * through an API route: the client library re-authenticates the session before
 * re-authenticating the user, which is the part that is easy to get wrong
 * server-side (an endpoint that only checks the cookie lets a stolen cookie
 * change the password).
 *
 * The email is read-only here on purpose. Changing an address needs
 * re-verification and a bounce-handling flow; a field that silently accepts an
 * unverified new address is worse than no field.
 */
export default function AccountPanel({ email }: { email: string | null }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState<string | null>(null);

    const mismatch = confirm.length > 0 && next !== confirm;
    const canSubmit = current.length > 0 && next.length >= 8 && next === confirm && !busy;

    async function changePassword(e: React.FormEvent) {
        e.preventDefault();
        if (!canSubmit) return;
        setBusy(true);
        setError(null);

        try {
            const { createClient } = await import('@/lib/supabase/client');
            const sb = createClient();
            const { error: reauthError } = await sb.auth.signInWithPassword({
                email: email ?? '',
                password: current,
            });
            if (reauthError) {
                setError('That current password is not right.');
                return;
            }

            const { error: updateError } = await sb.auth.updateUser({ password: next });
            if (updateError) {
                setError(updateError.message);
                return;
            }

            setCurrent('');
            setNext('');
            setConfirm('');
            setDone('Password changed. Other devices stay signed in; sign them out from here if that is a problem.');
            router.refresh();
        } catch {
            setError('Could not reach the server. Please try again.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="card p-6">
            <h2 className="text-lg font-semibold text-ink">Account</h2>

            <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-ink-mute">Email</p>
                <p className="mt-1 text-sm text-ink">{email ?? 'Not set'}</p>
                <p className="mt-1 text-xs text-ink-mute">
                    Your sign-in address. Contact us if it needs to change.
                </p>
            </div>

            {!open ? (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-5"
                    onClick={() => setOpen(true)}
                >
                    Change password
                </Button>
            ) : (
                <form onSubmit={changePassword} className="mt-5 space-y-4">
                    <div>
                        <label className="label" htmlFor="current-password">
                            Current password
                        </label>
                        <Input
                            id="current-password"
                            type="password"
                            value={current}
                            onChange={(e) => setCurrent(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    <div>
                        <label className="label" htmlFor="new-password">
                            New password
                        </label>
                        <Input
                            id="new-password"
                            type="password"
                            value={next}
                            onChange={(e) => setNext(e.target.value)}
                            autoComplete="new-password"
                        />
                        <p className="mt-1.5 text-xs text-ink-mute">At least 8 characters.</p>
                    </div>

                    <div>
                        <label className="label" htmlFor="confirm-password">
                            Confirm new password
                        </label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            autoComplete="new-password"
                            aria-invalid={mismatch || undefined}
                        />
                        {mismatch && (
                            <p className="mt-1.5 text-xs text-danger">Those do not match.</p>
                        )}
                    </div>

                    {error && (
                        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                            {error}
                        </p>
                    )}
                    {done && (
                        <p role="status" className="rounded-lg bg-brand-soft px-3 py-2 text-sm text-brand-ink">
                            {done}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-3">
                        <Button type="submit" disabled={!canSubmit}>
                            {busy ? 'Saving…' : 'Update password'}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={busy}
                            onClick={() => {
                                setOpen(false);
                                setError(null);
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
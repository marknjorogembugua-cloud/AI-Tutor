'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/**
 * Set a new password after following a reset link.
 *
 * Supabase's recovery link arrives with tokens in the URL fragment, which
 * createBrowserClient detects and exchanges for a session automatically. The
 * important subtlety: that session is a *recovery* session, so `updateUser`
 * works, but it must not be treated as a normal logged-in session — hence the
 * explicit check and sign-out on success.
 *
 * If JS is disabled or the fragment never arrives, we must not pretend the
 * reset failed. Showing the "link expired" state with a route back to
 * /forgot-password is the recoverable path.
 */
type State = 'checking' | 'ready' | 'expired' | 'done';

export default function ResetPasswordForm() {
    const sb = createClient();
    const router = useRouter();
    const [state, setState] = useState<State>('checking');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        // Supabase parses the fragment asynchronously on the client, so a
        // session may not exist on the first tick after mount.
        sb.auth.getSession().then(({ data }) => {
            if (cancelled) return;
            setState(data.session ? 'ready' : 'expired');
        });

        // Catches the case where the exchange completes after our first check.
        const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
            if (cancelled) return;
            if (event === 'PASSWORD_RECOVERY' || session) setState('ready');
        });

        return () => {
            cancelled = true;
            sub.subscription.unsubscribe();
        };
    }, [sb]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);

        if (password !== confirm) {
            setErr('Those passwords do not match.');
            return;
        }
        if (password.length < 8) {
            setErr('Use at least 8 characters.');
            return;
        }

        setBusy(true);
        const { error } = await sb.auth.updateUser({ password });
        setBusy(false);

        if (error) {
            setErr(error.message);
            return;
        }

        // The recovery session is still active. Sign out so the user lands on
        // the login page and signs in with the password they just chose, rather
        // than riding a session that was scoped to a single update.
        await sb.auth.signOut();
        setState('done');
    }

    if (state === 'checking') {
        return (
            <div className="card p-8 shadow-lift" aria-busy>
                <span role="status" aria-live="polite" className="sr-only">
                    Checking your reset link…
                </span>
                <div aria-hidden className="skeleton h-6 w-48 rounded-lg" />
                <div aria-hidden className="skeleton mt-4 h-3.5 w-full rounded-lg" />
                <div aria-hidden className="skeleton mt-2 h-3.5 w-3/5 rounded-lg" />
            </div>
        );
    }

    if (state === 'expired') {
        return (
            <div className="card p-8 shadow-lift">
                <h1 className="text-2xl font-semibold tracking-tight text-ink">
                    This link has expired
                </h1>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-soft">
                    Reset links last one hour and can only be used once. If you opened this page
                    after an hour, or already used the link, request a fresh one.
                </p>
                <div className="mt-7 flex flex-col gap-3">
                    <Link href="/forgot-password" className="btn-primary w-full">
                        Request a new link
                    </Link>
                    <Link href="/login" className="btn-outline w-full">
                        Back to log in
                    </Link>
                </div>
            </div>
        );
    }

    if (state === 'done') {
        return (
            <div className="card p-8 shadow-lift">
                <h1 className="text-2xl font-semibold tracking-tight text-ink">
                    Password updated
                </h1>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-soft">
                    Your new password is saved. Log in with it to carry on where you left off.
                </p>
                <Link
                    href="/login"
                    className="btn-primary mt-7 w-full"
                    onClick={() => router.refresh()}
                >
                    Log in
                </Link>
            </div>
        );
    }

    return (
        <div className="card p-8 shadow-lift">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Choose a new password</h1>
            <p className="mb-6 mt-1 text-sm text-ink-mute">
                You&apos;ll stay signed in on this device afterwards.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="label" htmlFor="password">
                        New password
                    </label>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        required
                        autoFocus
                    />
                </div>
                <div>
                    <label className="label" htmlFor="confirm">
                        Confirm new password
                    </label>
                    <Input
                        id="confirm"
                        type="password"
                        autoComplete="new-password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        minLength={8}
                        required
                    />
                </div>
                {err && (
                    <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                        {err}
                    </p>
                )}
                <Button type="submit" disabled={busy} className="w-full">
                    {busy ? 'Saving…' : 'Save new password'}
                </Button>
            </form>
        </div>
    );
}
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/**
 * Request a password reset email.
 *
 * The response is deliberately identical whether or not the address exists.
 * Reporting "no account with that email" would turn this form into a way to
 * enumerate which learners are registered, and the address is the only thing
 * attackers would want to learn here.
 */
export default function ForgotPasswordForm() {
    const sb = createClient();
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setBusy(true);

        const { error } = await sb.auth.resetPasswordForEmail(email, {
            // Must match a Supabase allowed redirect URL, or the link lands
            // somewhere unusable.
            redirectTo: `${window.location.origin}/reset-password`,
        });

        setBusy(false);
        // Supabase returns a success response for unknown addresses too, so
        // there is no error branch that reveals whether the account exists.
        if (error) {
            setErr('We could not send the email. Please try again in a moment.');
            return;
        }
        setSent(true);
    }

    if (sent) {
        return (
            <div className="card p-8 shadow-lift">
                <h1 className="text-2xl font-semibold tracking-tight text-ink">
                    Reset link sent
                </h1>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-soft">
                    If an account exists for that address, a reset link is on its way. It is valid
                    for one hour — open it on this device so you can set a new password straight
                    away.
                </p>
                <p className="mt-4 text-sm text-ink-mute">
                    Nothing arrived? Check your spam folder, or{' '}
                    <button
                        type="button"
                        onClick={() => setSent(false)}
                        className="font-medium text-brand-ink hover:underline"
                    >
                        try a different address
                    </button>
                    .
                </p>
                <Button
                    type="button"
                    variant="ghost"
                    className="mt-7 w-full"
                    onClick={() => setSent(false)}
                >
                    Back
                </Button>
            </div>
        );
    }

    return (
        <div className="card p-8 shadow-lift">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Forgot your password?</h1>
            <p className="mb-6 mt-1 text-sm text-ink-mute">
                We&apos;ll email you a link to set a new one.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="label" htmlFor="email">
                        Email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                    />
                </div>
                {err && (
                    <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                        {err}
                    </p>
                )}
                <Button type="submit" disabled={busy} className="w-full">
                    {busy ? 'Sending…' : 'Send reset link'}
                </Button>
            </form>
        </div>
    );
}
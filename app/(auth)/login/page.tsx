'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/Logo';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { InlineTrust, PrivacyNote } from '@/components/Trust';

function safeNext(raw: string | null): string {
    // Only allow same-origin relative paths — blocks open-redirect via ?next=
    if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/dashboard';
    return raw;
}

function LoginForm() {
    const sb = createClient();
    const router = useRouter();
    const params = useSearchParams();
    const next = safeNext(params.get('next'));
    // Set by the account deletion flow. Confirms what happened, since the user
    // has just been signed out with no other explanation on screen.
    const deleted = params.get('deleted') === '1';
    const billingWarning = params.get('billing');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null); setLoading(true);
        const { error } = await sb.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) return setErr(error.message);
        router.push(next); router.refresh();
    }

    return (
        <div className="relative min-h-screen bg-aurora">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
            <div className="absolute right-4 top-4">
                <ThemeSwitcher compact />
            </div>
            <div className="relative grid min-h-screen place-items-center px-4 py-12">
                <div className="w-full max-w-md animate-fade-up">
                    <Logo className="mb-8 justify-center text-lg" />
                    <div className="card p-8 shadow-lift">
                        <h1 className="text-2xl font-semibold tracking-tight text-ink">Welcome back</h1>
                        <p className="mb-6 mt-1 text-sm text-ink-mute">Log in to continue learning.</p>
                        {deleted && (
                            <div role="status" className="mb-5 rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand-ink">
                                <p className="font-medium">Your account has been deleted.</p>
                                {billingWarning && <p className="mt-1 text-pretty">{billingWarning}</p>}
                            </div>
                        )}
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div>
                                <label className="label" htmlFor="email">Email</label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="label" htmlFor="password">Password</label>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {err && (
                                <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                                    {err}
                                </p>
                            )}
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? 'Signing in…' : 'Log in'}
                            </Button>
                        </form>
                        <div className="mt-4 flex flex-col items-center gap-2 text-sm text-ink-mute">
                            <Link href="/forgot-password" className="hover:text-ink">
                                Forgot your password?
                            </Link>
                            <span>
                                New here?{' '}
                                <Link href="/signup" className="font-medium text-brand-ink hover:underline">
                                    Create an account
                                </Link>
                            </span>
                        </div>
                    </div>
                    <PrivacyNote className="mt-4" title="Signed-in sessions are private">
                        Your child&apos;s answers are readable only by their account and any linked
                        parent account. Nothing is visible to other families.
                    </PrivacyNote>
                    <InlineTrust
                        className="mt-5 justify-center"
                        items={['Encrypted in transit', 'No tracking']}
                    />
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="grid min-h-screen place-items-center px-4 text-ink-mute">
                    Loading…
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}

'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/Logo';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { InlineTrust, PrivacyNote } from '@/components/Trust';

const STRENGTH = [
    { label: 'Too short', test: (v: string) => v.length >= 8 },
    { label: 'Okay', test: (v: string) => /[a-zA-Z]/.test(v) && /[0-9]/.test(v) },
    { label: 'Good', test: (v: string) => /[a-zA-Z]/.test(v) && /[0-9]/.test(v) && v.length >= 12 },
    { label: 'Strong', test: (v: string) => /[a-zA-Z]/.test(v) && /[0-9]/.test(v) && /[^a-zA-Z0-9]/.test(v) },
];

export default function SignupPage() {
    const sb = createClient();
    const router = useRouter();
    const [role, setRole] = useState<'student' | 'parent'>('student');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const strength = useMemo(() => {
        if (!password) return -1;
        let idx = 0;
        for (const s of STRENGTH) if (s.test(password)) idx = STRENGTH.indexOf(s);
        return idx;
    }, [password]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null); setLoading(true);
        const { data, error } = await sb.auth.signUp({
            email, password,
            options: { data: { role, display_name: name } },
        });
        setLoading(false);
        if (error) return setErr(error.message);

        // Email confirmation is a project setting and may be on. Without a
        // session the account exists but nothing is signed in, and pushing to
        // /onboarding would bounce straight back to /login with no explanation.
        if (!data.session) {
            router.push('/check-email');
            return;
        }

        // They may have arrived here from an upgrade button. Onboarding has to
        // happen before checkout, so the intent stays in sessionStorage and the
        // dashboard resumes the upgrade once onboarding is out of the way.
        router.push(role === 'student' ? '/onboarding/profile' : '/parent');
        router.refresh();
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
                        <h1 className="text-2xl font-semibold tracking-tight text-ink">Create account</h1>
                        <p className="mb-6 mt-1 text-sm text-ink-mute">
                            Start with a free tutoring session. No card needed.
                        </p>

                        <div className="mb-5 grid grid-cols-2 gap-2">
                            {(['student', 'parent'] as const).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r)}
                                    aria-pressed={role === r}
                                    className={clsx(
                                        'rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition duration-200 ease-smooth',
                                        role === r
                                            ? 'border-brand bg-brand-soft text-brand-ink shadow-soft'
                                            : 'border-line bg-surface-card text-ink-soft hover:border-line-strong hover:bg-surface-muted'
                                    )}
                                >
                                    I&apos;m a {r}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={onSubmit} className="space-y-4">
                            <div>
                                <label className="label" htmlFor="name">
                                    {role === 'parent' ? 'Your name' : 'First name'}
                                </label>
                                <Input
                                    id="name"
                                    autoComplete="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
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
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={8}
                                    required
                                    aria-describedby="password-help"
                                />
                                <div id="password-help" className="mt-2 flex items-center gap-2">
                                    <div className="flex flex-1 gap-1" aria-hidden>
                                        {[0, 1, 2, 3].map((i) => (
                                            <span
                                                key={i}
                                                className={clsx(
                                                    'h-1 flex-1 rounded-full transition duration-300',
                                                    strength > i
                                                        ? strength >= 2
                                                            ? 'bg-brand'
                                                            : 'bg-warn'
                                                        : 'bg-surface-muted'
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span className="shrink-0 text-xs text-ink-mute">
                                        {strength < 0 ? '8+ characters' : STRENGTH[strength].label}
                                    </span>
                                </div>
                            </div>
                            {err && (
                                <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                                    {err}
                                </p>
                            )}
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? 'Creating…' : 'Create account'}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-ink-mute">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-brand-ink hover:underline">
                                Log in
                            </Link>
                        </p>
                    </div>

                    <PrivacyNote
                        className="mt-4"
                        title="What we collect, and what we don't"
                    >
                        Only what the tutor needs to teach: name, optional age and grade, and the answers
                        given in a session. No advertising, no third-party tracking.
                    </PrivacyNote>
                    <InlineTrust className="mt-5 justify-center" items={['No ads', 'Delete anytime']} />
                </div>
            </div>
        </div>
    );
}

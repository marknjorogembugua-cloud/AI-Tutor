'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { PrivacyNote } from '@/components/Trust';
import { Stepper } from '@/components/Stepper';

export default function OnboardingProfile() {
    const sb = createClient();
    const router = useRouter();
    const [f, setF] = useState({ display_name: '', age: '', grade: '', country: '', goals: '' });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    // Optional parent code, entered on the same screen. Optional in both
    // directions: plenty of learners have no parent account, and requiring it
    // here would strand them.
    const [inviteCode, setInviteCode] = useState('');
    const [inviteErr, setInviteErr] = useState<string | null>(null);

    function up(k: keyof typeof f, v: string) { setF((p) => ({ ...p, [k]: v })); }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null); setLoading(true);
        const { data: { user } } = await sb.auth.getUser();
        if (!user) { setErr('Session expired'); setLoading(false); return; }

        const { error } = await sb.from('students').upsert({
            id: user.id,
            display_name: f.display_name,
            age: f.age ? Number(f.age) : null,
            grade: f.grade ? Number(f.grade) : null,
            country: f.country || null,
            goals: f.goals || null,
            onboarded: false,
        });
        if (error) { setErr(error.message); setLoading(false); return; }
        await sb.from('student_profiles').upsert({ student_id: user.id, learning_style: {} });

        // Redeem the code after the profile row exists, so the parent's link and
        // the profile land together. A bad or expired code must not block
        // onboarding — the learner can enter it again from Settings.
        if (inviteCode.trim()) {
            const res = await fetch('/api/parent/accept', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ code: inviteCode.trim() }),
            });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                setInviteErr(json.detail ?? 'That code did not work. You can add it later in Settings.');
            }
        }

        setLoading(false);
        router.push('/onboarding/subject');
    }

    return (
        <div className="mx-auto max-w-lg">
            <Stepper current={0} />
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">Tell us about you</h1>
            <p className="mb-6 mt-1 text-sm text-ink-mute">
                We use this to pick the right questions. Everything except your name is optional.
            </p>
            <form onSubmit={submit} className="card space-y-4 p-6">
                <div>
                    <label className="label" htmlFor="display_name">First name</label>
                    <Input
                        id="display_name"
                        autoComplete="given-name"
                        value={f.display_name}
                        onChange={(e) => up('display_name', e.target.value)}
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="label" htmlFor="age">Age</label>
                        <Input
                            id="age"
                            type="number"
                            inputMode="numeric"
                            min={6}
                            max={18}
                            value={f.age}
                            onChange={(e) => up('age', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label" htmlFor="grade">Grade</label>
                        <Input
                            id="grade"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={12}
                            value={f.grade}
                            onChange={(e) => up('grade', e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="label" htmlFor="country">Country</label>
                    <Input
                        id="country"
                        autoComplete="country-name"
                        value={f.country}
                        onChange={(e) => up('country', e.target.value)}
                        placeholder="e.g. Kenya"
                    />
                </div>
                <div>
                    <label className="label" htmlFor="goals">Learning goals (optional)</label>
                    <Input
                        id="goals"
                        value={f.goals}
                        onChange={(e) => up('goals', e.target.value)}
                        placeholder="e.g. Get better at fractions"
                    />
                </div>
                <div className="rounded-xl border border-dashed border-line-strong px-4 py-4">
                    <label className="label" htmlFor="invite-code">
                        Parent invite code (optional)
                    </label>
                    <Input
                        id="invite-code"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        placeholder="e.g. K7M2QP4X"
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        maxLength={32}
                        className="font-mono tracking-widest"
                    />
                    <p className="mt-1.5 text-xs text-ink-mute">
                        If a parent gave you a code, enter it here and they can follow your
                        progress. You can do this later in Settings instead.
                    </p>
                    {inviteErr && (
                        <p role="alert" className="mt-2 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                            {inviteErr}
                        </p>
                    )}
                </div>
                {err && (
                    <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                        {err}
                    </p>
                )}
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Saving…' : 'Continue'}
                </Button>
            </form>
            <PrivacyNote className="mt-4" title="We keep this minimal">
            These details shape question difficulty and language. They are not used for marketing
            and are never shared with advertisers — there aren&apos;t any.
            </PrivacyNote>
        </div>
    );
}

'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { PrivacyNote } from '@/components/Trust';

interface Q { id: string; prompt: string; difficulty: number; skill_id: string; skill_name: string; }

const MAX = 5;

export function DiagnosticClient(props: {
    sessionId: string; topicId: string; subjectId: string; topicName: string;
}) {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [q, setQ] = useState<Q | null>(null);
    const [answer, setAnswer] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const load = useCallback(async () => {
        setBusy(true); setErr(null);
        try {
            const r = await fetch('/api/tutor/next-question', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ session_id: props.sessionId, topic_id: props.topicId, subject_id: props.subjectId }),
            });
            const j = await r.json();
            if (!r.ok) throw new Error(j.error || 'Could not load a question');
            setQ(j.question);
        } catch (e: any) {
            setErr(e.message);
        } finally {
            setBusy(false);
        }
    }, [props.sessionId, props.topicId, props.subjectId]);

    useEffect(() => {
        load();
    }, [load]);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!q || !answer.trim() || busy) return;
        setBusy(true); setErr(null);
        try {
            const r = await fetch('/api/tutor/analyze', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    question_id: q.id, topic_id: props.topicId, subject_id: props.subjectId,
                    skill_id: q.skill_id, answer: answer.trim(), hints_used: 0,
                }),
            });
            if (!r.ok) {
                const j = await r.json().catch(() => ({}));
                throw new Error(j.error || 'Could not check that answer');
            }
            setAnswer('');
            const next = step + 1;
            setStep(next);
            if (next >= MAX) {
                await fetch('/api/tutor/end-session', {
                    method: 'POST', headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ session_id: props.sessionId }),
                });
                await fetch('/api/onboarding/complete', { method: 'POST' });
                router.push('/dashboard');
                router.refresh();
                return;
            }
            await load();
        } catch (e: any) {
            setErr(e.message);
        } finally {
            setBusy(false);
        }
    }

    const pct = Math.round((Math.min(step, MAX) / MAX) * 100);

    return (
        <div className="mx-auto max-w-xl">
            <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-ink-mute">
                <span>Diagnostic · {Math.min(step + 1, MAX)} of {MAX}</span>
                <span>{props.topicName}</span>
            </div>
            <div
                className="mb-6 h-1.5 overflow-hidden rounded-full bg-surface-muted"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Diagnostic progress"
            >
                <div
                    className="h-full rounded-full bg-brand transition-[width] duration-500 ease-smooth"
                    style={{ width: `${pct}%` }}
                />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-ink">
                Let&apos;s see what you already know
            </h1>
            <p className="mb-6 mt-1 text-sm text-ink-mute">
                No pressure — wrong answers help the tutor pick where to start.
            </p>

            {q && (
                <Card className="mb-4 p-6">
                    <p className="text-lg font-medium text-ink">{q.prompt}</p>
                </Card>
            )}

            {err ? (
                <Card className="mb-4">
                    <p className="mb-3 text-sm text-danger">{err}</p>
                    <Button variant="outline" onClick={load} disabled={busy}>Try again</Button>
                </Card>
            ) : !q && busy ? (
                <Card className="mb-4">
                    <p className="text-sm text-ink-mute">Loading your first question…</p>
                </Card>
            ) : null}

            <form onSubmit={submit} className="flex gap-2">
                <Input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Your answer"
                    disabled={busy || !q}
                    aria-label="Your answer"
                    autoFocus
                />
                <Button type="submit" disabled={busy || !q || !answer.trim()}>
                    {step + 1 === MAX ? 'Finish' : 'Next'}
                </Button>
            </form>

            <PrivacyNote className="mt-4" title="What happens to these answers">
                They set your starting level and belong to your account only. Nothing is shared with
                your school, class, or any advertiser.
            </PrivacyNote>
        </div>
    );
}

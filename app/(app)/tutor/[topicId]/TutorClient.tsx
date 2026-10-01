'use client';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, LockIcon } from '@/components/ui/Card';
import Paywall, { type QuotaError } from '@/app/(app)/tutor/Paywall';

type Msg =
    | { role: 'tutor' | 'student'; kind: 'text'; content: string }
    | { role: 'tutor'; kind: 'hint' | 'explanation'; content: string };

interface Q {
    id: string; prompt: string; difficulty: number; skill_name: string; skill_id: string;
}

export function TutorClient(props: {
    sessionId: string; topicId: string; topicName: string; subjectId: string;
}) {
    const [messages, setMessages] = useState<Msg[]>([]);
    const [question, setQuestion] = useState<Q | null>(null);
    const [answer, setAnswer] = useState('');
    const [hintLevel, setHintLevel] = useState(0);
    const [hintsUsedOnQ, setHintsUsedOnQ] = useState(0);
    const [busy, setBusy] = useState(false);
    const [startedAt, setStartedAt] = useState<number>(Date.now());
    const [err, setErr] = useState<string | null>(null);
    const [quota, setQuota] = useState<QuotaError | null>(null);
    const feedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadNextQuestion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, question]);

    /**
     * Turns an API response into either data or a thrown error, mapping the
     * 402 daily-limit response onto the paywall instead of a raw error string.
     */
    async function unwrap<T>(r: Response): Promise<T> {
        const j = await r.json().catch(() => ({}));
        if (r.status === 402 && j?.error === 'daily_limit_reached') {
            setQuota(j as QuotaError);
            throw new Error(j.message ?? 'Daily limit reached');
        }
        if (!r.ok) throw new Error(j?.error || j?.message || 'Something went wrong');
        return j as T;
    }

    async function loadNextQuestion() {
        setBusy(true); setErr(null); setQuota(null);
        try {
            const r = await fetch('/api/tutor/next-question', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ session_id: props.sessionId, topic_id: props.topicId, subject_id: props.subjectId }),
            });
            const j = await unwrap<any>(r);
            const q: Q = { ...j.question, skill_id: j.question.skill_id };
            setQuestion(q);
            setHintLevel(0);
            setHintsUsedOnQ(0);
            setStartedAt(Date.now());
            setMessages((m) => [...m, { role: 'tutor', kind: 'text', content: `Let's try this (level ${q.difficulty}/5, ${q.skill_name}):` }]);
        } catch (e: any) { setErr(e.message); }
        finally { setBusy(false); }
    }

    async function submitAnswer(e: React.FormEvent) {
        e.preventDefault();
        if (!question || !answer.trim()) return;
        setBusy(true); setErr(null);
        const studentAns = answer;
        setAnswer('');
        setMessages((m) => [...m, { role: 'student', kind: 'text', content: studentAns }]);

        try {
            const r = await fetch('/api/tutor/analyze', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    question_id: question.id,
                    topic_id: props.topicId,
                    subject_id: props.subjectId,
                    skill_id: question.skill_id,
                    answer: studentAns,
                    time_taken_ms: Date.now() - startedAt,
                    hints_used: hintsUsedOnQ,
                }),
            });
            const j = await unwrap<any>(r);
            setMessages((m) => [...m, { role: 'tutor', kind: 'text', content: j.analysis.feedback }]);
            if (j.followUp) {
                setMessages((m) => [...m, { role: 'tutor', kind: j.followUp.kind, content: j.followUp.content }]);
            }
            if (j.analysis.next_step === 'next_question') {
                await loadNextQuestion();
            }
        } catch (e: any) { setErr(e.message); }
        finally { setBusy(false); }
    }

    async function requestHint() {
        if (!question) return;
        const next = Math.min(5, hintLevel + 1);
        setBusy(true); setErr(null);
        try {
            const r = await fetch('/api/tutor/hint', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    question_id: question.id, level: next,
                    topic_id: props.topicId, subject_id: props.subjectId, skill_id: question.skill_id,
                }),
            });
            const j = await unwrap<any>(r);
            setHintLevel(next);
            setHintsUsedOnQ((n) => n + 1);
            setMessages((m) => [...m, { role: 'tutor', kind: 'hint', content: `Hint ${next}/5 — ${j.hint}` }]);
        } catch (e: any) { setErr(e.message); }
        finally { setBusy(false); }
    }

    async function requestExplain() {
        if (!question) return;
        setBusy(true); setErr(null);
        try {
            const r = await fetch('/api/tutor/explain', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    question_id: question.id,
                    topic_id: props.topicId, subject_id: props.subjectId, skill_id: question.skill_id,
                }),
            });
            const j = await unwrap<any>(r);
            setMessages((m) => [...m, { role: 'tutor', kind: 'explanation', content: j.explanation }]);
        } catch (e: any) { setErr(e.message); }
        finally { setBusy(false); }
    }

    const canAct = !quota && !busy && !!question;

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-ink">{props.topicName}</h1>
                    <p className="mt-0.5 text-sm text-ink-mute">Adaptive session in progress</p>
                </div>
                <span className="chip bg-surface-muted text-ink-mute">
                    <LockIcon />
                    Private session
                </span>
            </div>

            <Card className="scrollbar-slim mb-4 h-[52vh] space-y-3 overflow-y-auto p-4">
                {messages.map((m, i) => (
                    <div key={i} className={clsx('flex', m.role === 'student' ? 'justify-end' : 'justify-start')}>
                        <div
                            className={clsx(
                                'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm',
                                m.role === 'student' && 'bg-brand text-ink-inverse',
                                m.role === 'tutor' && m.kind === 'hint' &&
                                    'border border-warn-line bg-warn-soft text-warn-ink',
                                m.role === 'tutor' && m.kind === 'explanation' &&
                                    'border border-line bg-surface-subtle text-ink-soft',
                                m.role === 'tutor' && m.kind === 'text' &&
                                    'bg-surface-muted text-ink'
                            )}
                        >
                            {m.content}
                        </div>
                    </div>
                ))}
                {busy && <p className="text-xs text-ink-mute animate-pulse">Tutor is thinking…</p>}
            </Card>

            {question && (
                <Card className="mb-4 p-5">
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-xs font-medium uppercase tracking-wider text-ink-mute">
                            {question.skill_name} · level {question.difficulty}/5
                        </span>
                        <HintPips level={hintLevel} />
                    </div>
                    <p className="text-lg font-medium text-ink">{question.prompt}</p>
                </Card>
            )}

            {quota && (
                <div className="mb-5">
                    <Paywall detail={quota} onDismiss={() => setQuota(null)} />
                </div>
            )}

            <form onSubmit={submitAnswer} className="mb-3 flex gap-2">
                <Input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer…"
                    disabled={busy || !question || !!quota}
                    autoFocus
                    aria-label="Your answer"
                />
                <Button type="submit" disabled={busy || !question || !!quota || !answer.trim()}>
                    Submit
                </Button>
            </form>

            <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={requestHint} disabled={!canAct}>
                    Hint ({hintLevel}/5)
                </Button>
                <Button type="button" variant="outline" onClick={requestExplain} disabled={!canAct}>
                    Explain
                </Button>
                <Button type="button" variant="ghost" onClick={loadNextQuestion} disabled={busy}>
                    Skip
                </Button>
            </div>

            {err && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-danger-soft px-4 py-3">
                    <p className="text-sm text-danger">{err}</p>
                    <Button type="button" variant="outline" size="sm" onClick={loadNextQuestion} disabled={busy}>
                        Retry
                    </Button>
                </div>
            )}
        </div>
    );
}

function HintPips({ level }: { level: number }) {
    return (
        <span className="flex items-center gap-1" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
                <span
                    key={i}
                    className={clsx(
                        'h-1.5 w-1.5 rounded-full transition duration-300',
                        i < level ? 'bg-brand' : 'bg-line-strong'
                    )}
                />
            ))}
        </span>
    );
}

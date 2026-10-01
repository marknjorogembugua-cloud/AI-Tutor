'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { PrivacyNote } from '@/components/Trust';
import { Stepper } from '@/components/Stepper';

type Subject = { id: string; name: string; description: string | null; emoji: string | null };

export default function OnboardingSubject() {
    const sb = createClient();
    const router = useRouter();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [query, setQuery] = useState('');
    // No hardcoded default: the first subject returned by the catalogue wins, so
    // this works for any curriculum without editing this file.
    const [chosen, setChosen] = useState<string | null>(null);

    useEffect(() => {
        sb.from('subjects')
            .select('id, name, description, emoji')
            .order('sort_order')
            .then(({ data }) => {
                const list = (data ?? []) as Subject[];
                setSubjects(list);
                setChosen((prev) => prev ?? list[0]?.id ?? null);
            });
    }, [sb]);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return subjects;
        return subjects.filter(
            (s) =>
                s.name.toLowerCase().includes(q) ||
                (s.description ?? '').toLowerCase().includes(q)
        );
    }, [subjects, query]);

    return (
        <div className="mx-auto max-w-2xl">
            <Stepper current={1} />
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">
                What would you like help with?
            </h1>
            <p className="mb-4 mt-1 text-sm text-ink-mute">
                {subjects.length} subjects available. You can switch any time.
            </p>

            <div className="mb-4">
                <label htmlFor="subject-search" className="sr-only">
                    Search subjects
                </label>
                <input
                    id="subject-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search subjects…"
                    autoComplete="off"
                    className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-mute/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
            </div>

            <div
                role="radiogroup"
                aria-label="Choose a subject"
                className="mb-6 grid max-h-[26rem] gap-3 overflow-y-auto pr-1 sm:grid-cols-2"
            >
                {visible.map((s) => (
                    <button
                        key={s.id}
                        type="button"
                        role="radio"
                        onClick={() => setChosen(s.id)}
                        aria-checked={chosen === s.id}
                        className={clsx(
                            'card p-5 text-left transition duration-200 ease-smooth',
                            chosen === s.id
                                ? 'border-brand bg-brand-soft/50 shadow-soft'
                                : 'card-hover'
                        )}
                    >
                        <span className="flex items-start justify-between gap-3">
                            <span className="min-w-0">
                                <span className="flex items-center gap-2">
                                    {s.emoji && (
                                        <span aria-hidden className="text-lg leading-none">
                                            {s.emoji}
                                        </span>
                                    )}
                                    <span
                                        className={clsx(
                                            'font-semibold',
                                            chosen === s.id ? 'text-brand-ink' : 'text-ink'
                                        )}
                                    >
                                        {s.name}
                                    </span>
                                </span>
                                <span className="mt-1 block text-sm text-ink-mute">
                                    {s.description ?? 'Curriculum coming soon'}
                                </span>
                            </span>
                            <span
                                aria-hidden
                                className={clsx(
                                    'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition duration-200',
                                    chosen === s.id
                                        ? 'border-brand bg-brand text-ink-inverse'
                                        : 'border-line-strong'
                                )}
                            >
                                {chosen === s.id && (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="m5 12.5 4.5 4.5L19 7.5"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </span>
                        </span>
                    </button>
                ))}
                {!visible.length && (
                    <p className="col-span-full py-8 text-center text-sm text-ink-mute">
                        No subjects match “{query}”.
                    </p>
                )}
            </div>

            <Button
                onClick={() => chosen && router.push(`/onboarding/diagnostic?subject=${chosen}`)}
                disabled={!chosen}
                className="w-full"
            >
                Start diagnostic
            </Button>
            <PrivacyNote className="mt-4" title="The diagnostic is short">
                About two minutes. Wrong answers are the useful part — they tell the tutor where to
                start, and nothing is graded or recorded against you beyond this account.
            </PrivacyNote>
        </div>
    );
}
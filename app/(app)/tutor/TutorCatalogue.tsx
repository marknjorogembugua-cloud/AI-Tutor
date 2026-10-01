'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Card, SectionHeading } from '@/components/ui/Card';
import { PrivacyNote } from '@/components/Trust';

export type TutorTopic = { id: string; name: string };
export type TutorSubject = {
    id: string;
    name: string;
    description: string | null;
    emoji: string | null;
    /** Catalogue order from the DB; lower comes first. */
    sortOrder: number;
    topics: TutorTopic[];
};

export default function TutorCatalogue({ subjects }: { subjects: TutorSubject[] }) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState<string | null>(null);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return subjects;
        return subjects
            .map((s) => ({
                ...s,
                topics: s.topics.filter(
                    (t) =>
                        t.name.toLowerCase().includes(q) ||
                        s.name.toLowerCase().includes(q) ||
                        (s.description ?? '').toLowerCase().includes(q)
                ),
            }))
            .filter((s) => s.topics.length > 0);
    }, [subjects, query]);

    const totalTopics = subjects.reduce((n, s) => n + s.topics.length, 0);

    return (
        <div className="mx-auto max-w-3xl">
            <SectionHeading
                align="left"
                eyebrow="Practice"
                title="Start a session"
                description="Pick a topic. The tutor will adapt as you go — difficulty, hints, and explanations all shift to what you need next."
            />

            {subjects.length > 0 && (
                <div className="mb-5">
                    <label htmlFor="topic-search" className="sr-only">
                        Search topics and subjects
                    </label>
                    <input
                        id="topic-search"
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Search ${subjects.length} subjects and ${totalTopics} topics…`}
                        autoComplete="off"
                        className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-mute/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                    />
                </div>
            )}

            {subjects.length === 0 && (
                <Card>
                    <p className="text-sm text-ink-mute">
                        No topics are available yet. Check back shortly.
                    </p>
                </Card>
            )}

            <div className="space-y-3">
                {visible.map((s) => {
                    const expanded = query.trim().length > 0 || open === s.id;
                    return (
                        <section
                            key={s.id}
                            className="overflow-hidden rounded-2xl border border-line bg-surface"
                        >
                            <h2>
                                <button
                                    type="button"
                                    onClick={() => setOpen(expanded && !query.trim() ? null : s.id)}
                                    aria-expanded={expanded}
                                    className="flex w-full items-center gap-3 px-5 py-4 text-left transition duration-200 hover:bg-brand-soft/30"
                                >
                                    {s.emoji && (
                                        <span aria-hidden className="text-xl leading-none">
                                            {s.emoji}
                                        </span>
                                    )}
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-semibold text-ink">
                                            {s.name}
                                        </span>
                                        <span className="mt-0.5 block truncate text-sm text-ink-mute">
                                            {s.description ?? `${s.topics.length} topics`}
                                        </span>
                                    </span>
                                    <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand-ink">
                                        {s.topics.length}
                                    </span>
                                    <svg
                                        aria-hidden
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className={clsx(
                                            'shrink-0 text-ink-mute transition-transform duration-200',
                                            expanded && 'rotate-180'
                                        )}
                                    >
                                        <path
                                            d="m6 9 6 6 6-6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            </h2>

                            {expanded && (
                                <div className="grid gap-3 border-t border-line px-5 py-4 sm:grid-cols-2">
                                    {s.topics.map((t) => (
                                        <Link
                                            key={t.id}
                                            href={`/tutor/${t.id}`}
                                            className="card card-hover group p-4"
                                        >
                                            <p className="font-semibold text-ink group-hover:text-brand-ink">
                                                {t.name}
                                            </p>
                                            <p className="mt-1 text-xs text-ink-mute">
                                                Adaptive practice · hints before answers
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>
                    );
                })}

                {subjects.length > 0 && visible.length === 0 && (
                    <Card>
                        <p className="text-sm text-ink-mute">
                            Nothing matches “{query}”. Try a different word.
                        </p>
                    </Card>
                )}
            </div>

            <PrivacyNote className="mt-10" title="Your session is private">
                Questions, answers, and the tutor&apos;s feedback in this session belong to you and
                your linked parent only.
            </PrivacyNote>
        </div>
    );
}
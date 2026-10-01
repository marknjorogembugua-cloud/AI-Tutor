'use client';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import type { CatalogueSubject } from '@/lib/curriculum.generated';
import { CURRICULUM_STATS } from '@/lib/curriculum.generated';

/**
 * Subject filters follow the sort_order bands the generator uses, so adding a
 * subject to a band in the curriculum script is enough to make it appear here.
 */
const FILTERS = [
    { id: 'all', label: 'All', test: () => true },
    { id: 'science', label: 'Science & maths', test: (s: CatalogueSubject) => s.order < 200 },
    {
        id: 'humanities',
        label: 'Humanities & social',
        test: (s: CatalogueSubject) => s.order >= 200 && s.order < 300,
    },
    {
        id: 'business',
        label: 'Business & careers',
        test: (s: CatalogueSubject) => s.order >= 300 && s.order < 400,
    },
    {
        id: 'creative',
        label: 'Creative & practical',
        test: (s: CatalogueSubject) => s.order >= 400 && s.order < 500,
    },
    {
        id: 'languages',
        label: 'Languages',
        test: (s: CatalogueSubject) => s.order >= 500 && s.order < 600,
    },
    {
        id: 'skills',
        label: 'Study & life skills',
        test: (s: CatalogueSubject) => s.order >= 600,
    },
] as const;

export default function SubjectCatalogue({ subjects }: { subjects: CatalogueSubject[] }) {
    const [query, setQuery] = useState('');
    const [band, setBand] = useState<string>('all');
    const [expanded, setExpanded] = useState<string | null>(null);

    const activeFilter = FILTERS.find((f) => f.id === band) ?? FILTERS[0];

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return subjects.filter((s) => {
            if (!activeFilter.test(s)) return false;
            if (!q) return true;
            return (
                s.name.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q) ||
                s.topics.some((t) => t.name.toLowerCase().includes(q))
            );
        });
    }, [subjects, query, activeFilter]);

    // Only offer bands that actually contain something, so a curriculum without
    // languages does not show an empty Languages chip.
    const filters = FILTERS.filter(
        (f) => f.id === 'all' || subjects.some((s) => f.test(s))
    );

    return (
        <div>
            <div className="mb-8 space-y-4">
                <div>
                    <label htmlFor="subject-search" className="sr-only">
                        Search subjects and topics
                    </label>
                    <input
                        id="subject-search"
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Search ${CURRICULUM_STATS.subjects} subjects and ${CURRICULUM_STATS.topics} topics…`}
                        autoComplete="off"
                        className="input"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            type="button"
                            onClick={() => setBand(f.id)}
                            aria-pressed={band === f.id}
                            className={clsx(
                                'rounded-full px-3.5 py-1.5 text-sm font-medium transition duration-200 ease-smooth',
                                band === f.id
                                    ? 'bg-brand text-ink-inverse'
                                    : 'bg-surface-card text-ink-soft ring-1 ring-inset ring-line hover:bg-surface-muted hover:text-ink'
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {visible.length === 0 ? (
                <div className="card p-6">
                    <p className="text-sm text-ink-mute">
                        Nothing matches “{query}”. Try a different word or another category.
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((s) => {
                        const open = expanded === s.id;
                        const topicCount = s.topics.length;
                        const skillCount = s.topics.reduce((n, t) => n + t.skills, 0);
                        return (
                            <section
                                key={s.id}
                                className="card card-hover flex flex-col p-5"
                            >
                                <button
                                    type="button"
                                    onClick={() => setExpanded(open ? null : s.id)}
                                    aria-expanded={open}
                                    className="flex items-start gap-3 text-left"
                                >
                                    <span aria-hidden className="text-2xl leading-none">
                                        {s.emoji}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-semibold text-ink">
                                            {s.name}
                                        </span>
                                        <span className="mt-1 block text-sm leading-relaxed text-ink-mute">
                                            {s.description}
                                        </span>
                                    </span>
                                </button>

                                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                                    <span className="chip bg-brand-soft text-brand-ink">
                                        {topicCount} topics
                                    </span>
                                    <span className="chip bg-surface-muted text-ink-soft">
                                        {skillCount} skills
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setExpanded(open ? null : s.id)}
                                    aria-expanded={open}
                                    className="mt-3 self-start text-xs font-medium text-brand-ink hover:underline"
                                >
                                    {open ? 'Hide topics' : 'View topics'}
                                </button>

                                {open && (
                                    <ul className="mt-3 space-y-2 border-t border-line pt-3">
                                        {s.topics.map((t) => (
                                            <li
                                                key={t.slug}
                                                className="flex items-baseline justify-between gap-3 text-sm"
                                            >
                                                <span className="text-ink-soft">{t.name}</span>
                                                <span className="shrink-0 text-xs text-ink-mute">
                                                    {t.skills} skills
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
'use client';

import { useState } from 'react';

/**
 * Compact practice-history chart.
 *
 * Deliberately not a charting library: this is one bar per day with a fixed
 * height scale, which is a dozen lines of divs. Pulling in a chart package for
 * it would add weight to every page that imports this component.
 *
 * Bars are buttons so each day is reachable by keyboard and announces its own
 * count, rather than relying on a hover tooltip that touch users never see.
 */

export type DayCell = { day: string; questions: number; correct: number };

function formatDay(iso: string): string {
    // Parse as UTC to match how the keys were generated; `new Date(iso)` alone
    // would read them as local midnight and can shift a day either way.
    const d = new Date(`${iso}T00:00:00Z`);
    return d.toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
    });
}

export default function ActivityChart({ days }: { days: DayCell[] }) {
    const [active, setActive] = useState<number | null>(null);
    const peak = Math.max(1, ...days.map((d) => d.questions));

    const activeDay = active === null ? null : days[active];

    return (
        <div>
            <div className="flex items-end gap-[3px]" role="group" aria-label="Practice activity by day">
                {days.map((d, i) => {
                    const heightPct = Math.round((d.questions / peak) * 100);
                    const isActive = active === i;
                    return (
                        <button
                            key={d.day}
                            type="button"
                            onClick={() => setActive(isActive ? null : i)}
                            // Percentage heights keep the chart fluid instead of
                            // fixed-pixel, which would break inside a narrow card.
                            style={{ height: `${Math.max(heightPct, 4)}%` }}
                            className={
                                d.questions === 0
                                    ? 'min-h-[3px] flex-1 rounded-sm bg-surface-muted'
                                    : d.correct === d.questions
                                      ? 'min-h-[3px] flex-1 rounded-sm bg-brand'
                                      : 'min-h-[3px] flex-1 rounded-sm bg-brand/45'
                            }
                            aria-label={`${formatDay(d.day)}: ${d.questions} ${d.questions === 1 ? 'question' : 'questions'}${d.questions ? `, ${d.correct} correct` : ', nothing practised'}`}
                        />
                    );
                })}
            </div>

            <div className="mt-2 flex justify-between text-[11px] text-ink-mute">
                <span>{days.length ? formatDay(days[0].day) : ''}</span>
                <span>{days.length ? 'Today' : ''}</span>
            </div>

            <p aria-live="polite" className="mt-3 min-h-[1.25rem] text-sm text-ink-soft">
                {activeDay
                    ? activeDay.questions === 0
                        ? `${formatDay(activeDay.day)}: nothing practised.`
                        : `${formatDay(activeDay.day)}: ${activeDay.questions} ${
                              activeDay.questions === 1 ? 'question' : 'questions'
                          }, ${activeDay.correct} correct.`
                    : 'Tap a bar for that day’s detail.'}
            </p>
        </div>
    );
}
/**
 * Streak and practice-history maths.
 *
 * Kept out of the database and out of the route so the rules are testable and
 * reviewable in one place: the definitions of "current streak", "longest streak"
 * and "active today" are easy to get subtly wrong, and getting them wrong is
 * the kind of bug a user notices immediately and trusts nothing else about.
 *
 * Days are UTC throughout, matching practice_activity() in migration 0009 and
 * the day key used by the daily usage quota. Using local time anywhere in this
 * chain would make a streak disagree with the question allowance.
 */

export type DayActivity = {
    /** UTC calendar day, `YYYY-MM-DD`. */
    day: string;
    questions: number;
    correct: number;
};

export type StreakSummary = {
    /**
     * Consecutive days ending today or yesterday.
     *
     * Yesterday counts so that a streak does not appear broken all morning for
     * someone who has simply not practised yet — that is the behaviour that
     * makes streak counters feel punitive rather than motivating.
     */
    current: number;
    /** Longest run anywhere in the supplied window. */
    longest: number;
    practisedToday: boolean;
    /** Every day in the window, oldest first, for the activity chart. */
    days: { day: string; questions: number; correct: number }[];
};

export function utcDayKey(date: Date = new Date()): string {
    return date.toISOString().slice(0, 10);
}

/** Whole days between two UTC day keys. */
function daysBetween(from: string, to: string): number {
    const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`);
    return Math.round(ms / 86_400_000);
}

function shiftDayKey(day: string, delta: number): string {
    const d = new Date(`${day}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + delta);
    return utcDayKey(d);
}

/**
 * Build a streak summary from raw daily counts.
 *
 * `rows` may arrive in any order and may contain days with zero questions (an
 * answer graded as incorrect still counts as practice, but a day with no
 * answers at all must break the chain).
 */
export function summariseActivity(rows: DayActivity[], now: Date = new Date()): StreakSummary {
    const today = utcDayKey(now);
    const byDay = new Map<string, DayActivity>();
    for (const r of rows) {
        if (r.questions > 0) byDay.set(r.day, r);
    }

    const sorted = [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));

    // Longest run: walk the sorted days and count consecutive ones.
    let longest = 0;
    let run = 0;
    let previous: string | null = null;
    for (const r of sorted) {
        run = previous !== null && daysBetween(previous, r.day) === 1 ? run + 1 : 1;
        if (run > longest) longest = run;
        previous = r.day;
    }

    // Current run: anchored to today if practised, otherwise yesterday.
    const practisedToday = byDay.has(today);
    let current = 0;
    let cursor = practisedToday ? today : shiftDayKey(today, -1);
    while (byDay.has(cursor)) {
        current++;
        cursor = shiftDayKey(cursor, -1);
    }

    return { current, longest, practisedToday, days: sorted };
}

/**
 * Fill in zero-days so the activity chart has one slot per day.
 *
 * A sparse list would make the chart lie about how lumpy practice is — three
 * dots on a chart implies three practice days in a row.
 */
export function fillDayRange(
    days: { day: string; questions: number; correct: number }[],
    span: number,
    now: Date = new Date()
): { day: string; questions: number; correct: number }[] {
    const today = utcDayKey(now);
    const byDay = new Map(days.map((d) => [d.day, d]));
    const out: { day: string; questions: number; correct: number }[] = [];
    for (let i = span - 1; i >= 0; i--) {
        const key = shiftDayKey(today, -i);
        out.push(byDay.get(key) ?? { day: key, questions: 0, correct: 0 });
    }
    return out;
}

/** Human phrasing for a streak count. */
export function streakLabel(streak: number): string {
    if (streak <= 0) return 'Start a streak today';
    if (streak === 1) return '1 day in a row';
    return `${streak} days in a row`;
}
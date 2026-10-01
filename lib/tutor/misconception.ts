import { createClient } from '@/lib/supabase/server';
import type { DBMisconception } from '@/lib/supabase/types';

type SB = ReturnType<typeof createClient>;

const STOPWORDS = new Set([
    // Generic function/meta words only — content words carry the meaning of the
    // misconception, so domain verbs like "adds" must be kept.
    'the', 'a', 'an', 'to', 'of', 'in', 'on', 'for', 'with', 'and', 'or',
    'that', 'this', 'these', 'those', 'it', 'its', 'is', 'are', 'was', 'were',
    'be', 'been', 'they', 'their', 'student', 'students', 'when', 'instead',
]);

/** Lowercase, strip punctuation, drop filler words — so trivial variants collapse. */
export function normalizeDescription(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s/]/gu, ' ')
        .split(/\s+/)
        .filter((w) => w && !STOPWORDS.has(w))
        .join(' ')
        .trim();
}

function tokens(text: string): Set<string> {
    return new Set(normalizeDescription(text).split(' ').filter(Boolean));
}

/** Jaccard overlap on normalized tokens. 0..1 */
export function similarity(a: string, b: string): number {
    const ta = tokens(a);
    const tb = tokens(b);
    if (!ta.size || !tb.size) return 0;
    let shared = 0;
    for (const t of ta) if (tb.has(t)) shared++;
    return shared / (ta.size + tb.size - shared);
}

/**
 * The AI rewords the same underlying mistake across questions. We only want one
 * tracked record per real misconception, so anything above SIMILARITY_THRESHOLD
 * is treated as "already known" rather than inserted as a new row.
 */
export const SIMILARITY_THRESHOLD = 0.6;

export interface RecordInput {
    studentId: string;
    skillId: string;
    description: string;
    confidence: number;
}

/**
 * Upsert a misconception, folding it into an existing near-duplicate if one exists.
 * Returns the stored row, or null when the input was not a real misconception.
 */
export async function recordMisconception(
    input: RecordInput,
    sb: SB = createClient()
): Promise<DBMisconception | null> {
    const raw = input.description?.trim();
    if (!raw) return null;

    const normalized = normalizeDescription(raw);
    if (!normalized) return null;

    const { data: existing } = await sb
        .from('misconceptions')
        .select('*')
        .eq('student_id', input.studentId)
        .eq('skill_id', input.skillId);

    const list = (existing ?? []) as DBMisconception[];

    // Prefer the closest known record so we update it instead of inserting a twin.
    const match = list
        .map((m) => ({ row: m, score: similarity(m.description, normalized) }))
        .filter((c) => c.score >= SIMILARITY_THRESHOLD)
        .sort((a, b) => b.score - a.score)[0];

    const now = new Date().toISOString();
    const description = match ? match.row.description : raw;

    // Repeated sightings raise confidence toward 1; a fresh correct streak lowers it.
    const seenBefore = Boolean(match);
    const confidence = clamp01(
        seenBefore
            ? Math.max(match!.row.confidence, input.confidence) + 0.05
            : input.confidence
    );

    const { data, error } = await sb
        .from('misconceptions')
        .upsert(
            {
                student_id: input.studentId,
                skill_id: input.skillId,
                description,
                confidence,
                resolved: false,
                last_seen: now,
                ...(seenBefore ? {} : { first_seen: now }),
            },
            { onConflict: 'student_id,skill_id,description' }
        )
        .select('*')
        .single();

    if (error) throw new Error(error.message);
    return data as DBMisconception;
}

/** Mark a misconception as fixed — called after the student answers correctly. */
export async function resolveMisconception(
    studentId: string,
    skillId: string,
    description: string,
    sb: SB = createClient()
): Promise<boolean> {
    const { error } = await sb
        .from('misconceptions')
        .update({ resolved: true })
        .eq('student_id', studentId)
        .eq('skill_id', skillId)
        .eq('description', description);
    return !error;
}

/** The misconception this skill most needs work on, if any. */
export function topMisconception(
    list: DBMisconception[]
): DBMisconception | null {
    const active = list.filter((m) => !m.resolved);
    if (!active.length) return null;
    return [...active].sort((a, b) => b.confidence - a.confidence)[0];
}

function clamp01(n: number): number {
    return Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));
}

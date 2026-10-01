import { createClient } from '@/lib/supabase/server';

type SB = ReturnType<typeof createClient>;

export interface LearningStyle {
    /** Share of answered questions marked correct, 0..1. */
    accuracy: number;
    /** Mean hints requested per question — high means hint-dependent. */
    hintsPerQuestion: number;
    /** 'slow' | 'steady' | 'fast' relative to difficulty. */
    pace: 'slow' | 'steady' | 'fast' | 'unknown';
    /** Median seconds spent on a question, or null when no timings recorded. */
    medianSeconds: number | null;
    /** Skills answered correctly more often than the student average. */
    strengths: string[];
    /** Skills answered incorrectly more often than the student average. */
    weaknesses: string[];
    /** True once there is enough history for the read to mean anything. */
    established: boolean;
}

export const MIN_ANSWERS_FOR_PROFILE = 5;

export interface AnswerSignal {
    is_correct: boolean | null;
    hints_used: number | null;
    time_taken_ms: number | null;
    /** Not a column on student_answers — resolved from the questions table. */
    skill_id?: string | null;
}

export interface SkillSignal {
    skill_id: string;
    correct: number;
    total: number;
}

/**
 * Pure derivation — no I/O, so it is cheap to unit test and safe to call per request.
 * Unanswered questions are excluded rather than counted as wrong.
 */
export function deriveLearningStyle(
    answers: AnswerSignal[],
    skills: SkillSignal[]
): LearningStyle {
    const graded = answers.filter((a) => a.is_correct !== null);
    const attempts = graded.length;
    const correct = graded.filter((a) => a.is_correct === true).length;

    const hints = answers.reduce((s, a) => s + (a.hints_used ?? 0), 0);
    const hintsPerQuestion = answers.length ? hints / answers.length : 0;

    const times = answers
        .map((a) => a.time_taken_ms)
        .filter((t): t is number => typeof t === 'number' && t > 0)
        .sort((a, b) => a - b);
    const medianSeconds = times.length
        ? Math.round(times[Math.floor(times.length / 2)] / 1000)
        : null;

    const accuracy = attempts ? correct / attempts : 0;

    const strengthBar = attempts ? Math.max(1, Math.ceil(attempts * 0.2)) : 1;
    const scored = [...skills]
        .filter((s) => s.total > 0)
        .map((s) => ({ id: s.skill_id, rate: s.correct / s.total, total: s.total }))
        .filter((s) => s.total >= strengthBar);

    const strengths = scored
        .filter((s) => s.rate > accuracy + 0.1)
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 3)
        .map((s) => s.id);

    const weaknesses = scored
        .filter((s) => s.rate < accuracy - 0.1)
        .sort((a, b) => a.rate - b.rate)
        .slice(0, 3)
        .map((s) => s.id);

    return {
        accuracy: round(accuracy),
        hintsPerQuestion: round(hintsPerQuestion),
        pace: paceOf(medianSeconds),
        medianSeconds,
        strengths,
        weaknesses,
        established: attempts >= MIN_ANSWERS_FOR_PROFILE,
    };
}

function paceOf(medianSeconds: number | null): LearningStyle['pace'] {
    if (medianSeconds === null) return 'unknown';
    if (medianSeconds <= 20) return 'fast';
    if (medianSeconds <= 60) return 'steady';
    return 'slow';
}

function round(n: number): number {
    return Math.round(n * 100) / 100;
}

export async function saveLearningStyle(
    studentId: string,
    style: LearningStyle,
    sb: SB = createClient()
): Promise<void> {
    const { error } = await sb.from('student_profiles').upsert({
        student_id: studentId,
        learning_style: style,
        updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
}

/**
 * Recompute the profile from recent history and persist it.
 * Call sparingly — it hits the DB, so it belongs at session boundaries, not per answer.
 */
export async function refreshLearningStyle(
    studentId: string,
    sb: SB = createClient()
): Promise<LearningStyle> {
    const { data: answers } = await sb
        .from('student_answers')
        .select('question_id, is_correct, hints_used, time_taken_ms')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(50);

    const raw = (answers ?? []) as {
        question_id: string | null;
        is_correct: boolean | null;
        hints_used: number | null;
        time_taken_ms: number | null;
    }[];

    // student_answers has no skill_id — resolve it through questions.
    const questionIds = [...new Set(raw.map((a) => a.question_id).filter((q): q is string => Boolean(q)))];
    let skillByQuestion = new Map<string, string | null>();
    if (questionIds.length) {
        const { data: qs } = await sb
            .from('questions')
            .select('id, skill_id')
            .in('id', questionIds);
        for (const q of (qs ?? []) as { id: string; skill_id: string | null }[]) {
            skillByQuestion.set(q.id, q.skill_id);
        }
    }

    const rows: AnswerSignal[] = raw.map((a) => ({
        is_correct: a.is_correct,
        hints_used: a.hints_used,
        time_taken_ms: a.time_taken_ms,
        skill_id: a.question_id ? (skillByQuestion.get(a.question_id) ?? null) : null,
    }));

    const bySkill = new Map<string, SkillSignal>();
    for (const a of rows) {
        if (!a.skill_id || a.is_correct === null) continue;
        const cur = bySkill.get(a.skill_id) ?? { skill_id: a.skill_id, correct: 0, total: 0 };
        cur.total += 1;
        if (a.is_correct) cur.correct += 1;
        bySkill.set(a.skill_id, cur);
    }

    const style = deriveLearningStyle(rows, [...bySkill.values()]);
    await saveLearningStyle(studentId, style, sb);
    return style;
}

/** Compact rendering for injection into AI prompts. */
export function styleToPrompt(style: Record<string, unknown> | null): string {
    if (!style) return 'Learning style: not yet established';

    const accuracy = typeof style.accuracy === 'number' ? style.accuracy : null;
    const hints = typeof style.hintsPerQuestion === 'number' ? style.hintsPerQuestion : null;
    const pace = typeof style.pace === 'string' ? style.pace : null;

    const parts: string[] = [];
    if (accuracy !== null) parts.push(`accuracy ${Math.round(accuracy * 100)}%`);
    if (hints !== null) parts.push(`${hints.toFixed(1)} hints/question`);
    if (pace) parts.push(`pace ${pace}`);

    const line = parts.length ? parts.join(', ') : 'insufficient history';
    return style.established === false
        ? `Learning style (early, ${line}) — do not over-fit to it`
        : `Learning style (${line})`;
}

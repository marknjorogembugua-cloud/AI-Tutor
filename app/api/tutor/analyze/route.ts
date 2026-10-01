import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { loadStudentContext } from '@/lib/tutor/context';
import { analyzeAnswer, generateHint, generateExplanation } from '@/lib/tutor/engine';
import { recordMisconception, resolveMisconception } from '@/lib/tutor/misconception';
import { checkInput } from '@/lib/safety/moderation';

/** Mastery at which we stop treating a skill's logged misconceptions as active. */
const MISCONCEPTION_RESOLVE_MASTERY = 0.8;

const Body = z.object({
    question_id: z.string().uuid(),
    topic_id: z.string().uuid(),
    subject_id: z.string(),
    answer: z.string().min(1).max(2000),
    time_taken_ms: z.number().int().nonnegative().optional(),
    hints_used: z.number().int().nonnegative().default(0),
    skill_id: z.string().uuid(),
});

export async function POST(req: Request) {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'bad request' }, { status: 400 });

    // Reject unsafe input before it reaches the model or gets stored.
    const moderated = checkInput(parsed.data.answer);
    if (!moderated.ok) {
        return NextResponse.json(
            { error: moderated.reason, analysis: null, followUp: null },
            { status: 422 }
        );
    }

    const { data: question } = await sb
        .from('questions').select('*').eq('id', parsed.data.question_id).single();
    if (!question) return NextResponse.json({ error: 'question not found' }, { status: 404 });

    const ctx = await loadStudentContext({
        studentId: user.id,
        subjectId: parsed.data.subject_id,
        topicId: parsed.data.topic_id,
        skillId: parsed.data.skill_id,
    });

    const analysis = await analyzeAnswer(
        ctx,
        { prompt: question.prompt, answer: question.answer },
        parsed.data.answer,
        parsed.data.hints_used
    );

    // Persist the answer
    await sb.from('student_answers').insert({
        question_id: question.id,
        student_id: user.id,
        answer: parsed.data.answer,
        is_correct: analysis.is_correct,
        time_taken_ms: parsed.data.time_taken_ms ?? null,
        hints_used: parsed.data.hints_used,
    });

    // Update skill progress
    const { data: prev } = await sb
        .from('skill_progress')
        .select('*')
        .eq('student_id', user.id)
        .eq('skill_id', parsed.data.skill_id)
        .maybeSingle();

    const attempts = (prev?.attempts ?? 0) + 1;
    const correct = (prev?.correct ?? 0) + (analysis.is_correct ? 1 : 0);
    const mastery = attempts ? correct / attempts : 0;

    await sb.from('skill_progress').upsert({
        student_id: user.id,
        skill_id: parsed.data.skill_id,
        attempts,
        correct,
        mastery,
        updated_at: new Date().toISOString(),
    });

    // Misconception
    if (analysis.misconception) {
        try {
            await recordMisconception({
                studentId: user.id,
                skillId: parsed.data.skill_id,
                description: analysis.misconception,
                confidence: analysis.confidence,
            }, sb);
        } catch {
            // Tracking is best-effort — never fail an answer over a bookkeeping write.
        }
    } else if (analysis.is_correct && mastery >= MISCONCEPTION_RESOLVE_MASTERY) {
        // Consistently strong on this skill — the tracked gaps here are no longer live.
        try {
            for (const m of ctx.misconceptions.filter((x) => x.skill_id === parsed.data.skill_id)) {
                await resolveMisconception(user.id, parsed.data.skill_id, m.description, sb);
            }
        } catch {
            // best-effort
        }
    }

    // If next step is hint/explain, generate inline so UI can render
    let followUp: { kind: 'hint' | 'explanation'; content: string } | null = null;
    if (analysis.next_step === 'hint') {
        followUp = { kind: 'hint', content: await generateHint(ctx, { prompt: question.prompt, answer: question.answer }, analysis.hint_level) };
    } else if (analysis.next_step === 'explain' || analysis.next_step === 'worked_example') {
        followUp = { kind: 'explanation', content: await generateExplanation(ctx, { prompt: question.prompt, answer: question.answer }) };
    }

    return NextResponse.json({ analysis, followUp });
}
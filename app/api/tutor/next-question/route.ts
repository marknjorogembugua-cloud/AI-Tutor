import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { refundQuestionAllowance, requireQuestionAllowance } from '@/lib/billing/guard';
import { loadStudentContext } from '@/lib/tutor/context';
import { generateQuestion, nextDifficulty } from '@/lib/tutor/engine';
import type { DBSkill } from '@/lib/supabase/types';

const Body = z.object({
    session_id: z.string().uuid(),
    topic_id: z.string().uuid(),
    subject_id: z.string(),
});

export async function POST(req: Request) {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    // Metered: this route generates new tutor content.
    const allowance = await requireQuestionAllowance(user.id);
    if (!allowance.ok) return allowance.response;

    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
        await refundQuestionAllowance(user.id);
        return NextResponse.json({ error: 'bad request' }, { status: 400 });
    }

    const { data: skills } = await sb
        .from('skills').select('*').eq('topic_id', parsed.data.topic_id).order('order_index');
    const skillList = (skills ?? []) as DBSkill[];
    if (!skillList.length) {
        await refundQuestionAllowance(user.id);
        return NextResponse.json({ error: 'no skills' }, { status: 400 });
    }

    // Current difficulty: last question's difficulty, adjusted by recent performance
    const { data: lastQ } = await sb
        .from('questions')
        .select('difficulty, skill_id')
        .eq('session_id', parsed.data.session_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    const { data: recentAnswers } = await sb
        .from('student_answers')
        .select('is_correct, hints_used')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

    const recent = recentAnswers ?? [];
    const difficulty = nextDifficulty({
        recentCorrect: recent.filter((a) => a.is_correct).length,
        recentTotal: recent.length,
        hintsUsed: recent.reduce((s, a) => s + (a.hints_used ?? 0), 0),
        avgTimeRatio: 1,
        repeatedMistakes: 0,
        currentDifficulty: lastQ?.difficulty ?? 2,
    });

    const ctx = await loadStudentContext({
        studentId: user.id,
        subjectId: parsed.data.subject_id,
        topicId: parsed.data.topic_id,
        skillId: lastQ?.skill_id ?? undefined,
    });

    let q;
    try {
        q = await generateQuestion(ctx, skillList, difficulty);
    } catch (e) {
        // No question was produced, so the reserved slot goes back. This keeps a
        // provider outage from silently costing the learner their daily quota.
        await refundQuestionAllowance(user.id);
        throw e;
    }

    const { data: inserted, error } = await sb.from('questions').insert({
        session_id: parsed.data.session_id,
        skill_id: q.skill_id,
        prompt: q.prompt,
        answer: q.answer,
        difficulty: q.difficulty,
        source: 'ai',
    }).select('*').single();

    if (error) {
        await refundQuestionAllowance(user.id);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        question: {
            id: inserted.id,
            prompt: inserted.prompt,
            difficulty: inserted.difficulty,
            skill_id: q.skill_id,
            skill_name: q.skill_name,
        },
    });
}
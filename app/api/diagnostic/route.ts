import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { refundQuestionAllowance, requireQuestionAllowance } from '@/lib/billing/guard';
import { loadStudentContext } from '@/lib/tutor/context';
import { generateDiagnosticOpener } from '@/lib/tutor/engine';
import { topMisconception } from '@/lib/tutor/misconception';
import { refreshLearningStyle } from '@/lib/tutor/profile';
import type { DBSkill } from '@/lib/supabase/types';

const StartBody = z.object({
    subject_id: z.string(),
    topic_id: z.string().uuid().optional(),
});

/**
 * POST — start (or resume) a calibration session and hand back the first question.
 */
export async function POST(req: Request) {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    // Metered: the diagnostic generates a real question.
    const allowance = await requireQuestionAllowance(user.id);
    if (!allowance.ok) return allowance.response;

    const parsed = StartBody.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: 'bad request' }, { status: 400 });

    const { subject_id, topic_id } = parsed.data;

    let topicId: string;
    if (topic_id) {
        topicId = topic_id;
    } else {
        // Only diagnose a published topic that actually has skills, otherwise the
        // tutor has nothing to generate questions from.
        const { data: topics } = await sb
            .from('topics').select('id')
            .eq('subject_id', subject_id).eq('is_published', true)
            .order('name');
        const candidates = topics ?? [];
        if (!candidates.length) {
            await refundQuestionAllowance(user.id);
            return NextResponse.json({ error: 'subject has no topics' }, { status: 400 });
        }
        const { data: withSkills } = await sb
            .from('skills').select('topic_id').in('topic_id', candidates.map((t) => t.id));
        const skilled = new Set((withSkills ?? []).map((s: { topic_id: string }) => s.topic_id));
        const topic = candidates.find((t) => skilled.has(t.id));
        if (!topic) {
            await refundQuestionAllowance(user.id);
            return NextResponse.json({ error: 'subject has no topics with skills' }, { status: 400 });
        }
        topicId = topic.id;
    }

    // Reuse an open diagnostic rather than stacking duplicates on every click.
    const { data: existing } = await sb
        .from('learning_sessions').select('*')
        .eq('student_id', user.id)
        .eq('topic_id', topicId)
        .eq('kind', 'diagnostic')
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1).maybeSingle();

    let session = existing;
    if (!session) {
        const { data, error } = await sb.from('learning_sessions')
            .insert({ student_id: user.id, subject_id, topic_id: topicId, kind: 'diagnostic' })
            .select('*').single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        session = data;
    }

    // If the session already has a question, return it instead of generating another.
    const { data: priorQuestion } = await sb
        .from('questions').select('id, prompt, difficulty, skill_id, skills(name)')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true })
        .limit(1).maybeSingle();

    if (priorQuestion) {
        // Resuming hands back a question that already exists — no AI call, so
        // give the reserved slot back.
        await refundQuestionAllowance(user.id);
        return NextResponse.json({
            session,
            topic_id: topicId,
            question: {
                id: priorQuestion.id,
                prompt: priorQuestion.prompt,
                difficulty: priorQuestion.difficulty,
                skill_id: priorQuestion.skill_id,
                skill_name: (priorQuestion.skills as { name?: string } | null)?.name ?? '',
            },
        });
    }

    const [{ data: skills }, { data: topic }] = await Promise.all([
        sb.from('skills').select('*').eq('topic_id', topicId).order('order_index'),
        sb.from('topics').select('name').eq('id', topicId).single(),
    ]);

    const skillList = (skills ?? []) as DBSkill[];
    if (!skillList.length) {
        await refundQuestionAllowance(user.id);
        return NextResponse.json({ error: 'no skills for topic' }, { status: 400 });
    }

    const ctx = await loadStudentContext({
        studentId: user.id, subjectId: subject_id, topicId, skillId: skillList[0].id,
    });
    ctx.topicName = topic?.name ?? ctx.topicName;

    let q;
    try {
        q = await generateDiagnosticOpener(ctx, skillList);
    } catch (e) {
        await refundQuestionAllowance(user.id);
        throw e;
    }

    const { data: inserted, error: insertErr } = await sb.from('questions').insert({
        session_id: session.id,
        skill_id: q.skill_id,
        prompt: q.prompt,
        answer: q.answer,
        difficulty: q.difficulty,
        source: 'diagnostic',
    }).select('*').single();

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

    return NextResponse.json({
        session,
        topic_id: topicId,
        question: {
            id: inserted.id,
            prompt: inserted.prompt,
            difficulty: inserted.difficulty,
            skill_id: q.skill_id,
            skill_name: q.skill_name,
        },
    });
}

/**
 * GET ?session_id= — calibration report: per-skill outcome, misconceptions, and
 * the profile the answers imply. Also refreshes the stored learning style.
 */
export async function GET(req: Request) {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const sessionId = new URL(req.url).searchParams.get('session_id');
    if (!sessionId) return NextResponse.json({ error: 'session_id required' }, { status: 400 });

    const { data: session } = await sb
        .from('learning_sessions').select('*')
        .eq('id', sessionId).eq('student_id', user.id).maybeSingle();
    if (!session) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const { data: questions } = await sb
        .from('questions').select('id, skill_id, difficulty, skills(id, name)')
        .eq('session_id', session.id);

    const questionIds = (questions ?? []).map((q: any) => q.id as string);

    const [{ data: answers }, { data: misconceptions }] = await Promise.all([
        questionIds.length
            ? sb.from('student_answers')
                .select('question_id, is_correct, hints_used')
                .eq('student_id', user.id)
                .in('question_id', questionIds)
            : Promise.resolve({ data: [] as unknown[] }),
        sb.from('misconceptions').select('*')
            .eq('student_id', user.id).eq('resolved', false),
    ]);

    const answerByQuestion = new Map(
        (answers ?? []).map((a: any) => [a.question_id, a])
    );

    const rows = (questions ?? []).map((q: any) => {
        const a = answerByQuestion.get(q.id) as { is_correct: boolean | null; hints_used: number } | undefined;
        return {
            skill_id: q.skill_id,
            skill_name: q.skills?.name ?? '',
            difficulty: q.difficulty,
            answered: Boolean(a),
            is_correct: a?.is_correct ?? null,
            hints_used: a?.hints_used ?? 0,
        };
    });

    const graded = rows.filter((r) => r.is_correct !== null);
    const correct = graded.filter((r) => r.is_correct).length;

    const learningStyle = await refreshLearningStyle(user.id, sb);

    return NextResponse.json({
        session: { id: session.id, kind: session.kind, ended_at: session.ended_at },
        summary: {
            asked: rows.length,
            answered: graded.length,
            correct,
            accuracy: graded.length ? Math.round((correct / graded.length) * 100) : 0,
            complete: graded.length >= Math.min(5, rows.length),
        },
        results: rows,
        misconceptions: (misconceptions ?? []).map((m: any) => ({
            skill_id: m.skill_id,
            description: m.description,
            confidence: Number(m.confidence),
        })),
        focus: topMisconception(misconceptions ?? [] as any)?.description ?? null,
        learningStyle,
    });
}

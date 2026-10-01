import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { refundQuestionAllowance, requireQuestionAllowance } from '@/lib/billing/guard';
import { loadStudentContext } from '@/lib/tutor/context';
import { generateHint } from '@/lib/tutor/engine';

const Body = z.object({
    question_id: z.string().uuid(),
    level: z.number().int().min(1).max(5),
    topic_id: z.string().uuid(),
    subject_id: z.string(),
    skill_id: z.string().uuid(),
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

    const { data: q } = await sb.from('questions').select('*').eq('id', parsed.data.question_id).single();
    if (!q) {
        await refundQuestionAllowance(user.id);
        return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    const ctx = await loadStudentContext({
        studentId: user.id,
        subjectId: parsed.data.subject_id,
        topicId: parsed.data.topic_id,
        skillId: parsed.data.skill_id,
    });

    try {
        const hint = await generateHint(ctx, { prompt: q.prompt, answer: q.answer }, parsed.data.level);
        return NextResponse.json({ hint, level: parsed.data.level });
    } catch (e) {
        // No hint was delivered, so the reserved slot goes back.
        await refundQuestionAllowance(user.id);
        throw e;
    }
}
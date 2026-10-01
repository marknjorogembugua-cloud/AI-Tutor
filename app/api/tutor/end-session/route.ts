import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getAI, safeJSON } from '@/lib/ai/provider';
import { RECOMMEND_PROMPT, TUTOR_SYSTEM } from '@/lib/ai/prompts';

const Body = z.object({ session_id: z.string().uuid() });

export async function POST(req: Request) {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'bad request' }, { status: 400 });

    await sb.from('learning_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', parsed.data.session_id).eq('student_id', user.id);

    // Gather weak skills + misconceptions
    const { data: progress } = await sb
        .from('skill_progress')
        .select('mastery, skills(id, name, topic_id)')
        .eq('student_id', user.id)
        .order('mastery').limit(5);

    if (!progress?.length) return NextResponse.json({ ok: true, recommendation: null });

    const ai = getAI();
    const raw = await ai.complete({
        system: TUTOR_SYSTEM,
        json: true,
        messages: [{
            role: 'user',
            content:
                `${RECOMMEND_PROMPT}\n\nWeak skills:\n` +
                progress.map((p: any) => `- id=${p.skills.id} "${p.skills.name}" mastery=${p.mastery}`).join('\n'),
        }],
    });
    const rec = safeJSON<{ skill_id: string; reason: string }>(raw);

    await sb.from('recommendations').insert({
        student_id: user.id,
        skill_id: rec.skill_id,
        reason: rec.reason,
    });

    return NextResponse.json({ ok: true, recommendation: rec });
}
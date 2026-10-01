import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const Body = z.object({
    subject_id: z.string(),
    topic_id: z.string().uuid(),
    kind: z.enum(['diagnostic', 'practice']).default('practice'),
});

export async function POST(req: Request) {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { data: existing } = await sb
        .from('learning_sessions')
        .select('*')
        .eq('student_id', user.id)
        .eq('topic_id', parsed.data.topic_id)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (existing) return NextResponse.json({ session: existing });

    const { data, error } = await sb.from('learning_sessions').insert({
        student_id: user.id,
        subject_id: parsed.data.subject_id,
        topic_id: parsed.data.topic_id,
        kind: parsed.data.kind,
    }).select('*').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ session: data });
}
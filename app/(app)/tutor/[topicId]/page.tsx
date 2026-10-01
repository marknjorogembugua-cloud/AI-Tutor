import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TutorClient } from './TutorClient';

export default async function TutorPage({
    params, searchParams,
}: { params: { topicId: string }; searchParams: { subject?: string } }) {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) redirect('/login');

    const { data: topic } = await sb
        .from('topics')
        .select('id, name, subject_id, subjects(name)')
        .eq('id', params.topicId)
        .single();
    if (!topic) redirect('/tutor');

    const subjectId = searchParams.subject ?? topic.subject_id;

    // Start/resume session server-side
    const { data: existing } = await sb
        .from('learning_sessions')
        .select('*')
        .eq('student_id', user.id)
        .eq('topic_id', params.topicId)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    let session = existing;
    if (!session) {
        const { data } = await sb.from('learning_sessions').insert({
            student_id: user.id, subject_id: subjectId, topic_id: params.topicId, kind: 'practice',
        }).select('*').single();
        session = data;
    }
    if (!session) redirect('/tutor');

    return (
        <TutorClient
            sessionId={session.id}
            topicId={params.topicId}
            topicName={topic.name}
            subjectId={subjectId}
        />
    );
}
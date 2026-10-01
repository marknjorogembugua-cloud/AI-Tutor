import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DiagnosticClient } from './DiagnosticClient';

export default async function DiagnosticPage({
    searchParams,
}: { searchParams: { subject?: string } }) {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) redirect('/login');

    // No hardcoded default subject — an absent or unknown subject sends the
    // learner back to the picker rather than silently starting Mathematics.
    const subjectId = searchParams.subject;
    if (!subjectId) redirect('/onboarding/subject');

    const { data: subject } = await sb
        .from('subjects').select('id').eq('id', subjectId).maybeSingle();
    if (!subject) redirect('/onboarding/subject');

    const { data: topics } = await sb
        .from('topics').select('id, name')
        .eq('subject_id', subjectId).eq('is_published', true)
        .order('name');

    const candidates = topics ?? [];
    if (!candidates.length) redirect('/onboarding/subject');

    // Only diagnose a topic the tutor can actually generate questions for.
    const { data: withSkills } = await sb
        .from('skills').select('topic_id').in('topic_id', candidates.map((t) => t.id));
    const skilled = new Set((withSkills ?? []).map((s: { topic_id: string }) => s.topic_id));
    const topic = candidates.find((t) => skilled.has(t.id));
    if (!topic) redirect('/onboarding/subject');

    const { data: session } = await sb.from('learning_sessions').insert({
        student_id: user.id, subject_id: subjectId, topic_id: topic.id, kind: 'diagnostic',
    }).select('*').single();
    if (!session) redirect('/onboarding/subject');

    return (
        <DiagnosticClient
            sessionId={session.id}
            topicId={topic.id}
            subjectId={subjectId}
            topicName={topic.name}
        />
    );
}
import { createClient } from '@/lib/supabase/server';
import type { DBSkill, DBSkillProgress, DBMisconception, DBStudent } from '@/lib/supabase/types';
import { styleToPrompt } from './profile';

export interface StudentContext {
    student: DBStudent;
    subjectId: string;
    topicId: string;
    topicName: string;
    skill: DBSkill;
    skillProgress: DBSkillProgress[];
    misconceptions: DBMisconception[];
    recentAnswers: { is_correct: boolean | null; created_at: string }[];
    learningStyle: Record<string, unknown>;
}

export async function loadStudentContext(params: {
    studentId: string;
    subjectId: string;
    topicId: string;
    skillId?: string;
}): Promise<StudentContext> {
    const sb = createClient();

    const [{ data: student }, { data: topic }, { data: skills }, { data: prog }, { data: misc }, { data: recent }, { data: prof }] =
        await Promise.all([
            sb.from('students').select('*').eq('id', params.studentId).single(),
            sb.from('topics').select('*').eq('id', params.topicId).single(),
            sb.from('skills').select('*').eq('topic_id', params.topicId).order('order_index'),
            sb.from('skill_progress').select('*').eq('student_id', params.studentId),
            sb.from('misconceptions').select('*').eq('student_id', params.studentId).eq('resolved', false),
            sb.from('student_answers').select('is_correct, created_at').eq('student_id', params.studentId).order('created_at', { ascending: false }).limit(10),
            sb.from('student_profiles').select('*').eq('student_id', params.studentId).maybeSingle(),
        ]);

    const skillList = (skills ?? []) as DBSkill[];
    const chosen =
        (params.skillId && skillList.find((s) => s.id === params.skillId)) ||
        skillList[0];
    if (!chosen) throw new Error('No skills available for this topic');

    return {
        student: student as DBStudent,
        subjectId: params.subjectId,
        topicId: params.topicId,
        topicName: topic?.name ?? '',
        skill: chosen,
        skillProgress: (prog ?? []) as DBSkillProgress[],
        misconceptions: (misc ?? []) as DBMisconception[],
        recentAnswers: (recent ?? []) as { is_correct: boolean | null; created_at: string }[],
        learningStyle: (prof?.learning_style as Record<string, unknown>) ?? {},
    };
}

export function contextToPrompt(ctx: StudentContext): string {
    const sp = ctx.skillProgress.find((p) => p.skill_id === ctx.skill.id);
    return [
        `Student: ${ctx.student.display_name}, grade ${ctx.student.grade ?? '?'}`,
        `Country: ${ctx.student.country ?? 'unknown'}`,
        `Subject topic: ${ctx.topicName}`,
        `Current skill: ${ctx.skill.name}`,
        `Skill mastery: ${sp ? Math.round((sp.mastery ?? 0) * 100) + '%' : 'unknown'}`,
        `Recent correctness: ${ctx.recentAnswers.filter((a) => a.is_correct).length}/${ctx.recentAnswers.length || 0}`,
        `Known misconceptions: ${ctx.misconceptions.map((m) => m.description).join('; ') || 'none'}`,
        styleToPrompt(ctx.learningStyle),
    ].join('\n');
}
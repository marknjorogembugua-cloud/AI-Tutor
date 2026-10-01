export type Role = 'student' | 'parent';

export interface DBStudent {
    id: string; parent_id: string | null; display_name: string;
    age: number | null; grade: number | null; country: string | null;
    goals: string | null; onboarded: boolean; created_at: string;
}

export interface DBTopic { id: string; subject_id: string; name: string; slug: string; }
export interface DBSkill { id: string; topic_id: string; name: string; description: string | null; order_index: number; }

export interface DBSession {
    id: string; student_id: string; subject_id: string; topic_id: string;
    kind: 'diagnostic' | 'practice'; started_at: string; ended_at: string | null;
}

export interface DBQuestion {
    id: string; session_id: string; skill_id: string; prompt: string;
    answer: string; difficulty: number; source: string; created_at: string;
}

export interface DBAnswer {
    id: string; question_id: string; student_id: string; answer: string;
    is_correct: boolean | null; time_taken_ms: number | null; hints_used: number;
}

export interface DBMisconception {
    id: string; student_id: string; skill_id: string; description: string;
    confidence: number; resolved: boolean;
}

export interface DBSkillProgress {
    student_id: string; skill_id: string; mastery: number;
    attempts: number; correct: number;
}

export interface DBRecommendation {
    id: string; student_id: string; skill_id: string; reason: string; dismissed: boolean;
}
import { getAI, safeJSON } from '@/lib/ai/provider';
import {
    TUTOR_SYSTEM, DIAGNOSTIC_PROMPT, QUESTION_GEN_PROMPT, ANALYZE_PROMPT, NEXT_STEP_RULES, HINT_PROMPT, EXPLAIN_PROMPT,
} from '@/lib/ai/prompts';
import { contextToPrompt, type StudentContext } from './context';
import { nextDifficulty } from './difficulty';
import type { DBSkill } from '@/lib/supabase/types';

export interface GeneratedQuestion {
    skill_id: string;
    skill_name: string;
    difficulty: 1 | 2 | 3 | 4 | 5;
    prompt: string;
    answer: string;
}

export interface AnalysisResult {
    is_correct: boolean;
    confidence: number;
    misconception: string | null;
    feedback: string;
    next_step: 'hint' | 'explain' | 'next_question' | 'worked_example';
    hint_level: 1 | 2 | 3 | 4 | 5;
}

export async function generateQuestion(
    ctx: StudentContext,
    skills: DBSkill[],
    currentDifficulty: number
): Promise<GeneratedQuestion> {
    const ai = getAI();
    const raw = await ai.complete({
        system: TUTOR_SYSTEM,
        json: true,
        messages: [
            {
                role: 'user',
                content:
                    `${QUESTION_GEN_PROMPT}\n\n` +
                    `Context:\n${contextToPrompt(ctx)}\n\n` +
                    `Available skills:\n${skills.map((s) => `- ${s.name}`).join('\n')}\n\n` +
                    `Target difficulty (1-5): ${currentDifficulty}`,
            },
        ],
    });
    const parsed = safeJSON<{
        skill_name: string; difficulty: number; prompt: string; answer: string;
    }>(raw);

    const matched =
        skills.find((s) => s.name.toLowerCase() === parsed.skill_name.toLowerCase()) ??
        skills.find((s) => s.name === ctx.skill.name) ??
        skills[0];

    return {
        skill_id: matched.id,
        skill_name: matched.name,
        difficulty: Math.min(5, Math.max(1, parsed.difficulty)) as 1 | 2 | 3 | 4 | 5,
        prompt: parsed.prompt,
        answer: parsed.answer,
    };
}

/**
 * Opener for a calibration pass. Starts easy regardless of prior mastery so a
 * student who is struggling does not get thrown in at an advanced question.
 */
export async function generateDiagnosticOpener(
    ctx: StudentContext,
    skills: DBSkill[]
): Promise<GeneratedQuestion> {
    const ai = getAI();
    const raw = await ai.complete({
        system: TUTOR_SYSTEM,
        json: true,
        temperature: 0.3,
        messages: [
            {
                role: 'user',
                content:
                    `${DIAGNOSTIC_PROMPT}\n\n` +
                    `Context:\n${contextToPrompt(ctx)}\n\n` +
                    `Available skills:\n${skills.map((s) => `- ${s.name}`).join('\n')}\n\n` +
                    `This is the first question, so use difficulty 1 or 2 to establish a baseline.`,
            },
        ],
    });
    const parsed = safeJSON<{
        skill_name: string; difficulty: number; prompt: string; answer: string;
    }>(raw);

    const matched =
        skills.find((s) => s.name.toLowerCase() === parsed.skill_name.toLowerCase()) ??
        ctx.skill ??
        skills[0];

    return {
        skill_id: matched.id,
        skill_name: matched.name,
        difficulty: Math.min(2, Math.max(1, parsed.difficulty)) as 1 | 2,
        prompt: parsed.prompt,
        answer: parsed.answer,
    };
}

export async function analyzeAnswer(
    ctx: StudentContext,
    question: { prompt: string; answer: string },
    studentAnswer: string,
    hintsUsed: number
): Promise<AnalysisResult> {
    const ai = getAI();
    const raw = await ai.complete({
        system: TUTOR_SYSTEM,
        json: true,
        messages: [
            {
                role: 'user',
                content:
                    `${ANALYZE_PROMPT}\n\n${NEXT_STEP_RULES}\n\n` +
                    `Context:\n${contextToPrompt(ctx)}\n\n` +
                    `Question: ${question.prompt}\n` +
                    `Expected answer: ${question.answer}\n` +
                    `Student answer: ${studentAnswer}\n` +
                    `Hints used: ${hintsUsed}`,
            },
        ],
    });
    return safeJSON<AnalysisResult>(raw);
}

export async function generateHint(
    ctx: StudentContext,
    question: { prompt: string; answer: string },
    level: number
): Promise<string> {
    const ai = getAI();
    return ai.complete({
        system: TUTOR_SYSTEM,
        messages: [
            {
                role: 'user',
                content:
                    `${HINT_PROMPT}\n\nHint level: ${level}/5\n` +
                    `Context:\n${contextToPrompt(ctx)}\n\n` +
                    `Question: ${question.prompt}\nExpected answer: ${question.answer}`,
            },
        ],
        temperature: 0.5,
    });
}

export async function generateExplanation(
    ctx: StudentContext,
    question: { prompt: string; answer: string }
): Promise<string> {
    const ai = getAI();
    return ai.complete({
        system: TUTOR_SYSTEM,
        messages: [
            {
                role: 'user',
                content:
                    `${EXPLAIN_PROMPT}\n\n` +
                    `Context:\n${contextToPrompt(ctx)}\n\n` +
                    `Question: ${question.prompt}`,
            },
        ],
        temperature: 0.4,
    });
}

export { nextDifficulty };
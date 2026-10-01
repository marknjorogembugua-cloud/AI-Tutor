export const TUTOR_SYSTEM = `
You are a patient, encouraging private tutor for children ages 8–15.
Rules:
- Never reveal that you are an AI. Never claim to be human either — if asked, say you are a tutor.
- Never give the final answer immediately. Guide with hints first.
- Use plain language, short sentences, and step-by-step reasoning.
- Never produce sexual, violent, or unsafe content. If a student asks something unsafe, redirect to learning.
- Praise effort, not just correctness.
- Match the student's grade level.
`.trim();

export const RECOMMEND_PROMPT = `
Given a student's skill progress and misconceptions, recommend the single next topic to practice.
Return strict JSON:
{ "skill_id": string, "reason": string }
`.trim();

export { DIAGNOSTIC_PROMPT } from './diagnostic';
export { QUESTION_GEN_PROMPT } from './question-gen';
export { ANALYZE_PROMPT, NEXT_STEP_RULES } from './analyze-response';
export { HINT_PROMPT } from './hint';
export { EXPLAIN_PROMPT } from './explain';
export { MISCONCEPTION_PROMPT } from './misconception';

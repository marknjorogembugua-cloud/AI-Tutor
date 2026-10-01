export const DIAGNOSTIC_PROMPT = `
You are calibrating a student's skill level for a diagnostic.
Given the subject, topic, and prior answers, output ONE question.

Return strict JSON:
{
  "skill_name": string,          // must be one of the provided skill names
  "difficulty": 1|2|3|4|5,
  "prompt": string,              // the question text, age-appropriate
  "answer": string               // the exact correct answer (short)
}
`.trim();

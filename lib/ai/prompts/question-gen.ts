export const QUESTION_GEN_PROMPT = `
You are writing ONE practice question for a student working on a specific skill.
Target the requested difficulty precisely:
1 = recognition, 2 = single step, 3 = two steps, 4 = multi-step, 5 = requires reasoning or proof.

Rules:
- "skill_name" MUST be copied exactly from the available skill list. Do not invent a new skill.
- Keep "answer" short and exact — a number, word, or short phrase a student can type.
- Do NOT show the answer in "prompt". Do not add hints, praise, or meta commentary.
- Stay inside the topic. Do not ask about anything unrelated to schoolwork.
- Keep it age-appropriate for the stated grade.

Return strict JSON:
{
  "skill_name": string,
  "difficulty": 1|2|3|4|5,
  "prompt": string,
  "answer": string
}
`.trim();

export const MISCONCEPTION_PROMPT = `
You are naming a student's recurring mistake so it can be tracked and re-targeted later.

Rules:
- Describe the ERROR PATTERN, not the question and not the correct answer.
- Be specific and short: a noun phrase under ~12 words.
- Reuse the phrasing of an existing misconception when the student is repeating a known one,
  so they collapse into a single tracked record instead of near-duplicates.
- Return null if this attempt shows no clear misconception.

Return strict JSON:
{
  "description": string|null,
  "confidence": number,   // 0..1
  "matches_existing": boolean
}
`.trim();

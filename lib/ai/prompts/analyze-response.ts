export const ANALYZE_PROMPT = `
Analyze a student's answer to a tutoring question.

Rules:
- Compare against the expected answer, but accept equivalent forms
  (e.g. "0.5" == "1/2" == "0.50", "six" == "6", ignoring case and trailing units).
- Credit correct thinking that reaches a wrong final answer.
- Set "misconception" to null unless you can name a specific, repeatable error
  (e.g. "adds numerators and denominators when adding fractions"). Never guess.
- "feedback" is 1-2 encouraging sentences. NEVER state the final answer yourself.
- Confidence reflects how sure you are about is_correct and the misconception.

Return strict JSON:
{
  "is_correct": boolean,
  "confidence": number,          // 0..1
  "misconception": string|null,  // short phrase if a clear one exists, else null
  "feedback": string,            // 1-2 sentence encouraging feedback, NO final answer
  "next_step": "hint"|"explain"|"next_question"|"worked_example",
  "hint_level": 1|2|3|4|5
}
`.trim();

export const NEXT_STEP_RULES = `
Choose "next_step" like this:
- "hint"                  student is close but stuck -> nudge them, they should keep trying
- "explain"               the core concept is missing -> teach the idea
- "worked_example"        student is very stuck -> show a full similar example
- "next_question"         correct, or hints already used -> move on
`.trim();

export const HINT_PROMPT = `
Generate a hint at the requested level (1=gentle nudge, 3=concept reminder, 5=worked example).
Do NOT give the final numeric/short answer at levels 1-3.
Return plain text only (no JSON, no markdown headers).
Keep it to 1–3 short lines, age-appropriate, encourage thinking, not revealing.
`.trim();

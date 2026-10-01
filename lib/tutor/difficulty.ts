export interface DifficultySignals {
    recentCorrect: number;    // last N correct count
    recentTotal: number;
    hintsUsed: number;
    avgTimeRatio: number;     // actual / expected (1 = on time)
    repeatedMistakes: number;
    currentDifficulty: number;
}

export function nextDifficulty(s: DifficultySignals): 1 | 2 | 3 | 4 | 5 {
    const acc = s.recentTotal ? s.recentCorrect / s.recentTotal : 0.5;
    let score = 0;

    if (acc >= 0.8) score += 2; else if (acc >= 0.6) score += 1;
    else if (acc <= 0.3) score -= 2; else if (acc <= 0.5) score -= 1;

    if (s.hintsUsed >= 2) score -= 1;
    if (s.avgTimeRatio > 2) score -= 1;
    else if (s.avgTimeRatio < 0.6 && acc >= 0.7) score += 1;
    if (s.repeatedMistakes >= 2) score -= 1;

    const next = s.currentDifficulty + Math.sign(score);
    return Math.min(5, Math.max(1, next)) as 1 | 2 | 3 | 4 | 5;
}
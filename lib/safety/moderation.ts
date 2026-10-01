const BLOCKLIST = [
    // crude keyword blocklist — expand with a proper moderation API in production
    'sex', 'porn', 'kill myself', 'suicide', 'weapon', 'bomb',
];

export function checkInput(text: string): { ok: boolean; reason?: string } {
    const lower = text.toLowerCase();
    for (const w of BLOCKLIST) {
        if (lower.includes(w)) {
            return { ok: false, reason: 'I can only help with learning questions.' };
        }
    }
    return { ok: true };
}
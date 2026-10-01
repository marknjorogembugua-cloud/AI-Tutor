export function SkillBar({ label, value }: { label: string; value: number }) {
    const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
    const tone = pct >= 75 ? 'bg-brand' : pct >= 40 ? 'bg-brand/70' : 'bg-brand/45';
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink-soft">{label}</span>
                <span className="shrink-0 font-medium tabular-nums text-ink-mute">{pct}%</span>
            </div>
            <div
                className="h-2 overflow-hidden rounded-full bg-surface-muted"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${label} mastery`}
            >
                <div
                    className={`h-full rounded-full transition-[width] duration-700 ease-smooth ${tone}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

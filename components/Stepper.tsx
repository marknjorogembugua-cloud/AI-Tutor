const STEPS = ['Profile', 'Subject', 'Diagnostic'] as const;

export function Stepper({ current }: { current: number }) {
    return (
        <ol className="flex items-center gap-2" aria-label="Setup progress">
            {STEPS.map((s, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <li key={s} className="flex items-center gap-2">
                        <span
                            className={
                                'grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition duration-300 ' +
                                (active
                                    ? 'bg-brand text-ink-inverse'
                                    : done
                                        ? 'bg-brand-soft text-brand-ink'
                                        : 'bg-surface-muted text-ink-mute')
                            }
                            aria-current={active ? 'step' : undefined}
                        >
                            {done ? <CheckIcon /> : i + 1}
                        </span>
                        <span className={'text-xs font-medium ' + (active ? 'text-ink' : 'text-ink-mute')}>
                            {s}
                        </span>
                        {i < STEPS.length - 1 && (
                            <span
                                aria-hidden
                                className={'h-px w-6 rounded sm:w-10 ' + (done ? 'bg-brand-line' : 'bg-line')}
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

function CheckIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
                d="m5 12.5 4.5 4.5L19 7.5"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

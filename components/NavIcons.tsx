/**
 * Small line icons for navigation.
 *
 * Hand-rolled rather than pulled from an icon package: this is four glyphs, and
 * a dependency for four SVGs is not worth the install and the bundle. They all
 * share a 24×24 viewBox, 1.7 stroke and round caps so they sit consistently next
 * to text at 11px in the bottom nav.
 */

type IconProps = { className?: string };

const base = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    'aria-hidden': true as const,
};

export function HomeIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            <path
                d="M4 10.6 12 4.5l8 6.1"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M6 10v8.5h12V10"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M10 18.5v-4.2h4v4.2"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function TutorIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            {/* Open book */}
            <path
                d="M4 6.2c2.6-1.1 5.2-1.1 8 .3 2.8-1.4 5.4-1.4 8-.3v10.9c-2.6-1.1-5.2-1.1-8 .3-2.8-1.4-5.4-1.4-8-.3V6.2Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
            />
            <path d="M12 6.5v10.9" stroke="currentColor" strokeWidth="1.7" />
        </svg>
    );
}

export function ChildIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            <circle cx="12" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.7" />
            <path
                d="M5.6 19.4c.4-3.1 3-5.1 6.4-5.1s6 2 6.4 5.1"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function HistoryIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            {/* Clock: reads as "past" at a glance, where a bar chart would look
                like the activity chart one screen away. */}
            <circle cx="12" cy="12" r="7.6" stroke="currentColor" strokeWidth="1.7" />
            <path
                d="M12 7.6V12l3 1.8"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function SettingsIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            {/* Sliders, not a cog: at this size a cog turns into a blob. */}
            <path d="M4 8h6M14 8h6M4 16h10M18 16h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="12" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.7" />
            <circle cx="16" cy="16" r="2.2" stroke="currentColor" strokeWidth="1.7" />
        </svg>
    );
}
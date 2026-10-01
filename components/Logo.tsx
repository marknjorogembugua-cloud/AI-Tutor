import Link from 'next/link';
import clsx from 'clsx';

export function Logo({
    href = '/',
    className,
    showMark = true,
}: {
    href?: string;
    className?: string;
    showMark?: boolean;
}) {
    return (
        <Link
            href={href}
            className={clsx(
                'group inline-flex items-center gap-2.5 rounded-lg font-semibold tracking-tight text-ink',
                className
            )}
        >
            {showMark && (
                <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand text-ink-inverse shadow-soft transition duration-200 ease-smooth group-hover:scale-105">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                            d="M4 7.5 12 4l8 3.5-8 3.5-8-3.5Z"
                            fill="currentColor"
                            opacity="0.95"
                        />
                        <path
                            d="M7 10v4.6c0 .5.3 1 .8 1.2 1.3.7 2.7 1 4.2 1s2.9-.3 4.2-1c.5-.2.8-.7.8-1.2V10"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                        />
                    </svg>
                </span>
            )}
            <span className="leading-tight">
                AI Personal Tutor
            </span>
        </Link>
    );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Logo } from '@/components/Logo';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LogoutButton } from '@/components/LogoutButton';
import { LockIcon } from '@/components/ui/Card';
import { ChildIcon, HistoryIcon, HomeIcon, SettingsIcon, TutorIcon } from '@/components/NavIcons';

const LINKS: Record<string, { href: string; label: string; icon: React.ReactNode }[]> = {
    student: [
        { href: '/dashboard', label: 'Dashboard', icon: <HomeIcon /> },
        { href: '/tutor', label: 'Tutor', icon: <TutorIcon /> },
        { href: '/history', label: 'History', icon: <HistoryIcon /> },
        { href: '/settings', label: 'Settings', icon: <SettingsIcon /> },
    ],
    parent: [
        { href: '/parent', label: 'My Child', icon: <ChildIcon /> },
        { href: '/settings', label: 'Settings', icon: <SettingsIcon /> },
    ],
};

export function AppShell({
    role,
    children,
}: {
    role: 'student' | 'parent';
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const links = LINKS[role] ?? LINKS.student;
    const home = role === 'parent' ? '/parent' : '/dashboard';

    return (
        <div className="flex min-h-screen flex-col bg-surface">
            <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-md">
                <div className="shell flex h-16 items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <Logo href={home} />
                        <nav className="hidden items-center gap-1 text-sm sm:flex">
                            {links.map((l) => {
                                const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
                                return (
                                    <Link
                                        key={l.href}
                                        href={l.href}
                                        aria-current={active ? 'page' : undefined}
                                        className={clsx(
                                            'rounded-lg px-3 py-2 font-medium transition duration-200 ease-smooth',
                                            active
                                                ? 'bg-brand-soft text-brand-ink'
                                                : 'text-ink-soft hover:bg-surface-muted hover:text-ink'
                                        )}
                                    >
                                        {l.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <span
                            className="hidden items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1.5 text-xs font-medium text-brand-ink md:inline-flex"
                            title="Only you and your linked parent can see your answers"
                        >
                            <LockIcon />
                            Private
                        </span>
                        <ThemeSwitcher compact />
                        <LogoutButton />
                    </div>
                </div>
                </header>

            {/*
             * Bottom navigation replaces the cramped second row of text links
             * that used to sit under the header on small screens. Thumb-reachable
             * and out of the way of the reading column; hidden from sm up, where
             * the header nav already does the job.
             */}
            <nav
                aria-label="Main"
                className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md sm:hidden"
            >
                <div className="flex items-stretch">
                    {links.map((l) => {
                        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
                        return (
                            <Link
                                key={l.href}
                                href={l.href}
                                aria-current={active ? 'page' : undefined}
                                className={clsx(
                                    'flex flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[11px] font-medium transition duration-200 ease-smooth',
                                    active ? 'text-brand-ink' : 'text-ink-mute hover:text-ink-soft'
                                )}
                            >
                                {l.icon}
                                {l.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <main className="shell flex-1 py-8">{children}</main>

            <footer className="border-t border-line py-6 pb-24 sm:pb-6">
                <div className="shell flex flex-col gap-2 text-xs text-ink-mute sm:flex-row sm:items-center sm:justify-between">
                    <p>Your answers stay private to your account and your linked parent.</p>
                    <p>Change your look any time with the appearance button.</p>
                </div>
            </footer>
        </div>
    );
}

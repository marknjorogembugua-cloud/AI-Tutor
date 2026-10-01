'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useTheme } from '@/components/ThemeProvider';
import { getTheme, type ThemeId, type ThemeMode } from '@/lib/theme';

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
    const { themes, theme, mode, setTheme } = useTheme();
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);
    const panelId = 'theme-picker';

    useEffect(() => {
        if (!open) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(false);
        }
        function onPointerDown(e: MouseEvent) {
            if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onPointerDown);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onPointerDown);
        };
    }, [open]);

    const active = getTheme(theme);
    const light = themes.filter((t) => t.mode === 'light');
    const dark = themes.filter((t) => t.mode === 'dark');

    return (
        <div ref={wrapRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                aria-label={`Appearance: ${active.name}. Change theme`}
                title={`Appearance: ${active.name}`}
                className={clsx(
                    'inline-flex items-center gap-2 rounded-xl border bg-surface-card text-ink-soft transition duration-200 ease-smooth hover:bg-surface-muted hover:text-ink',
                    compact ? 'h-9 w-9 justify-center border-line' : 'border-line px-3 py-2'
                )}
            >
                <Icon mode={mode} />
                {!compact && <span className="text-sm font-medium">Appearance</span>}
            </button>

            {open && (
                <div
                    id={panelId}
                    role="listbox"
                    aria-label="Choose a theme"
                    className="absolute right-0 z-50 mt-2 w-72 origin-top-right animate-pop-in rounded-2xl border border-line bg-surface-card p-2 shadow-lift"
                >
                    <Group label="Light" items={light} active={theme} onPick={pick} />
                    <Group label="Dark" items={dark} active={theme} onPick={pick} />
                    <p className="mt-1 border-t border-line px-3 py-2 text-xs text-ink-mute">
                        Saved on this device. Your account and data are unaffected.
                    </p>
                </div>
            )}
        </div>
    );

    function pick(id: ThemeId) {
        setTheme(id);
        setOpen(false);
    }
}

function Group({
    label,
    items,
    active,
    onPick,
}: {
    label: string;
    items: ReturnType<typeof useTheme>['themes'];
    active: ThemeId;
    onPick: (id: ThemeId) => void;
}) {
    if (!items.length) return null;
    return (
        <div className="p-1">
            <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                {label}
            </p>
            <div className="grid gap-1">
                {items.map((t) => {
                    const isActive = t.id === active;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            onClick={() => onPick(t.id)}
                            className={clsx(
                                'flex items-center gap-3 rounded-xl px-2.5 py-2 text-left transition duration-150 ease-smooth',
                                isActive ? 'bg-brand-soft' : 'hover:bg-surface-muted'
                            )}
                        >
                            <span
                                aria-hidden
                                className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-inset ring-line-strong"
                            >
                                {t.swatch.map((c) => (
                                    <span key={c} className="h-full flex-1" style={{ background: c }} />
                                ))}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-medium text-ink">{t.name}</span>
                                <span className="block truncate text-xs text-ink-mute">{t.blurb}</span>
                            </span>
                            {isActive && <CheckIcon />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function Icon({ mode }: { mode: ThemeMode }) {
    return mode === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
            <path
                d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
            />
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
            <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" />
            <path
                d="M12 2.8v2.4M12 18.8v2.4M4.4 4.4l1.7 1.7M17.9 17.9l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.4 19.6l1.7-1.7M17.9 6.1l1.7-1.7"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-brand">
            <path
                d="m5 12.5 4.5 4.5L19 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

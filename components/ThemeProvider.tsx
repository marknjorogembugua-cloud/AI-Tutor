'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import {
    DEFAULT_THEME,
    THEMES,
    THEME_STORAGE_KEY,
    getTheme,
    isThemeId,
    type ThemeDef,
    type ThemeId,
    type ThemeMode,
} from '@/lib/theme';

interface ThemeContextValue {
    theme: ThemeId;
    mode: ThemeMode;
    definition: ThemeDef;
    themes: ThemeDef[];
    setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const attr = document.documentElement.getAttribute('data-theme');
        setThemeState(isThemeId(attr) ? attr : DEFAULT_THEME);
        setReady(true);
    }, []);

    useEffect(() => {
        if (!ready) return;
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        root.style.colorScheme = getTheme(theme).mode;
    }, [theme, ready]);

    const setTheme = useCallback((id: ThemeId) => {
        setThemeState(id);
        try {
            localStorage.setItem(THEME_STORAGE_KEY, id);
        } catch {
            /* storage blocked (private mode): theme still applies for this session */
        }
    }, []);

    const value = useMemo<ThemeContextValue>(
        () => ({
            theme,
            mode: getTheme(theme).mode,
            definition: getTheme(theme),
            themes: THEMES,
            setTheme,
        }),
        [theme, setTheme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
}

export type ThemeId = 'aurora' | 'mint' | 'sunset' | 'ocean' | 'midnight' | 'forest';

export type ThemeMode = 'light' | 'dark';

export interface ThemeDef {
    id: ThemeId;
    name: string;
    mode: ThemeMode;
    blurb: string;
    swatch: [string, string, string];
}

export const THEME_STORAGE_KEY = 'ai-tutor-theme';
export const DEFAULT_THEME: ThemeId = 'aurora';

export const THEMES: ThemeDef[] = [
    {
        id: 'aurora',
        name: 'Aurora',
        mode: 'light',
        blurb: 'Calm indigo. Our default.',
        swatch: ['#4f46e5', '#a5b4fc', '#eef2ff'],
    },
    {
        id: 'mint',
        name: 'Mint',
        mode: 'light',
        blurb: 'Soft green. Easy on the eyes.',
        swatch: ['#0f766e', '#5eead4', '#e0f7f0'],
    },
    {
        id: 'sunset',
        name: 'Sunset',
        mode: 'light',
        blurb: 'Warm amber. Friendly tone.',
        swatch: ['#be3c18', '#fdba74', '#ffede6'],
    },
    {
        id: 'ocean',
        name: 'Ocean',
        mode: 'light',
        blurb: 'Clear blue. High clarity.',
        swatch: ['#0369a1', '#7dd3fc', '#e1f3ff'],
    },
    {
        id: 'midnight',
        name: 'Midnight',
        mode: 'dark',
        blurb: 'Deep navy. Low light.',
        swatch: ['#818cf8', '#312e81', '#0f172a'],
    },
    {
        id: 'forest',
        name: 'Forest',
        mode: 'dark',
        blurb: 'Dark green. Focused study.',
        swatch: ['#34d399', '#115e49', '#071411'],
    },
];

const THEME_IDS = new Set<string>(THEMES.map((t) => t.id));

export function isThemeId(value: unknown): value is ThemeId {
    return typeof value === 'string' && THEME_IDS.has(value);
}

export function getTheme(id: ThemeId): ThemeDef {
    return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/**
 * Runs before first paint so the stored theme never flashes the default one.
 * Kept in sync with THEME_STORAGE_KEY / THEMES above.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');var d=${JSON.stringify(
    DEFAULT_THEME
)};document.documentElement.setAttribute('data-theme',t||d);}catch(e){document.documentElement.setAttribute('data-theme','${DEFAULT_THEME}');}})();`;

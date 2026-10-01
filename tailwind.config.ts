import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                ink: {
                    DEFAULT: 'rgb(var(--text) / <alpha-value>)',
                    soft: 'rgb(var(--text-soft) / <alpha-value>)',
                    mute: 'rgb(var(--text-mute) / <alpha-value>)',
                    inverse: 'rgb(var(--on-brand) / <alpha-value>)',
                },
                surface: {
                    DEFAULT: 'rgb(var(--bg) / <alpha-value>)',
                    card: 'rgb(var(--surface) / <alpha-value>)',
                    muted: 'rgb(var(--surface-muted) / <alpha-value>)',
                    subtle: 'rgb(var(--surface-subtle) / <alpha-value>)',
                },
                line: {
                    DEFAULT: 'rgb(var(--border) / <alpha-value>)',
                    strong: 'rgb(var(--border-strong) / <alpha-value>)',
                },
                brand: {
                    DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
                    hover: 'rgb(var(--brand-hover) / <alpha-value>)',
                    soft: 'rgb(var(--brand-soft) / <alpha-value>)',
                    line: 'rgb(var(--brand-line) / <alpha-value>)',
                    ink: 'rgb(var(--brand-ink) / <alpha-value>)',
                },
                warn: {
                    DEFAULT: 'rgb(var(--warn) / <alpha-value>)',
                    soft: 'rgb(var(--warn-soft) / <alpha-value>)',
                    line: 'rgb(var(--warn-line) / <alpha-value>)',
                    ink: 'rgb(var(--warn-ink) / <alpha-value>)',
                },
                danger: {
                    DEFAULT: 'rgb(var(--danger) / <alpha-value>)',
                    soft: 'rgb(var(--danger-soft) / <alpha-value>)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
            },
            borderRadius: { xl: '14px', '2xl': '20px', '3xl': '28px' },
            boxShadow: {
                soft: '0 1px 2px rgb(var(--shadow) / var(--shadow-a-sm)), 0 1px 3px rgb(var(--shadow) / var(--shadow-a))',
                card: '0 1px 2px rgb(var(--shadow) / var(--shadow-a-sm)), 0 10px 24px -12px rgb(var(--shadow) / var(--shadow-a-md))',
                lift: '0 2px 6px rgb(var(--shadow) / var(--shadow-a-sm)), 0 22px 44px -20px rgb(var(--shadow) / var(--shadow-a-md))',
                ring: '0 0 0 4px rgb(var(--brand) / 0.16)',
            },
            keyframes: {
                'fade-up': {
                    from: { opacity: '0', transform: 'translateY(6px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'pop-in': {
                    from: { opacity: '0', transform: 'scale(0.97)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: {
                    '100%': { transform: 'translateX(100%)' },
                },
            },
            animation: {
                'fade-up': 'fade-up 0.35s ease-out both',
                'pop-in': 'pop-in 0.16s ease-out both',
            },
            transitionTimingFunction: {
                smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
            },
        },
    },
    plugins: [],
};
export default config;

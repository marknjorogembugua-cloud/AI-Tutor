'use client';

/**
 * Last-resort error boundary.
 *
 * Replaces the root layout, so it must render its own <html> and <body> — which
 * also means it cannot use ThemeProvider or the Tailwind base styles from
 * globals.css the way the rest of the app does. Everything here is inline so
 * the page is readable even when the stylesheet is what failed.
 */

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('global error', error);
    }, [error]);

    return (
        <html lang="en">
            <body
                style={{
                    margin: 0,
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f7f7fc',
                    color: '#111430',
                    fontFamily:
                        'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                    padding: '24px',
                }}
            >
                <div style={{ maxWidth: 460, textAlign: 'center' }}>
                    <p
                        style={{
                            margin: 0,
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: '#3730a3',
                        }}
                    >
                        Something went wrong
                    </p>
                    <h1 style={{ margin: '12px 0 0', fontSize: 26, fontWeight: 700, lineHeight: 1.25 }}>
                        The app hit an unexpected error
                    </h1>
                    <p style={{ margin: '14px 0 0', fontSize: 15, lineHeight: 1.6, color: '#4a5070' }}>
                        Your account and your progress are safe. Reloading usually fixes it.
                    </p>

                    {error.digest && (
                        <p style={{ margin: '16px 0 0', fontSize: 12, color: '#6b7090' }}>
                            Reference <code>{error.digest}</code>
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={reset}
                        style={{
                            marginTop: 28,
                            padding: '12px 24px',
                            border: 0,
                            borderRadius: 12,
                            background: '#4f46e5',
                            color: '#fff',
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Reload the app
                    </button>
                </div>
            </body>
        </html>
    );
}
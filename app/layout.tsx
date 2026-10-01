import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { themeInitScript } from '@/lib/theme';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? '';

export const metadata: Metadata = {
    title: 'AI Personal Tutor',
    description:
        'A tutor that learns how your child learns. Private by design — answers are visible only to the student and their linked parent.',
    metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
    applicationName: 'AI Personal Tutor',
    manifest: '/manifest.webmanifest',
    // Install-to-home-screen prompts on iOS only fire when the page declares
    // itself a web app; without this the "Add to Home Screen" item in the
    // share sheet opens a Safari tab instead of a standalone launcher.
    appleWebApp: {
        capable: true,
        title: 'AI Tutor',
        // Lets the status bar sit above our own background in standalone mode.
        statusBarStyle: 'default',
    },
    formatDetection: { telephone: false },
    // og:image and twitter:image are supplied by the file conventions in
    // app/opengraph-image.tsx and app/twitter-image.tsx, so they resolve to the
    // right URL automatically via metadataBase. Declaring them here as well
    // would duplicate the tags.
    openGraph: {
        type: 'website',
        siteName: 'AI Personal Tutor',
        title: 'AI Personal Tutor',
        description:
            'Adaptive tutoring that adapts in real time to your child’s strengths, gaps, pace, and learning style — in a space built around privacy.',
        url: SITE_URL || undefined,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AI Personal Tutor',
        description:
            'A tutor that learns how your child learns. Hints before answers, concepts before shortcuts.',
    },
    // No `alternates.canonical` here on purpose: metadata merges from the root
    // layout into every page, so a fixed value would stamp canonical="/" onto
    // /pricing and /subjects and tell search engines those are duplicates of
    // the homepage. Next.js resolves each route's own URL from metadataBase.
    robots: { index: true, follow: true },
};

export const viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#f7f7fc' },
        { media: '(prefers-color-scheme: dark)', color: '#0b0f1c' },
    ],
    width: 'device-width',
    initialScale: 1,
    // Not capping zoom: pinch-to-zoom is an accessibility requirement, and the
    // app shell is already responsive down to 320px.
    maximumScale: 5,
    viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" data-theme="aurora" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
            </head>
            <body className="min-h-screen">
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}

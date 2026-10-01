import type { MetadataRoute } from 'next';

/**
 * Web app manifest, so the tutor can be installed to a home screen and launched
 * full-screen instead of in a browser tab.
 *
 * The icon list is deliberately duplicated across `purpose`: Android picks the
 * best match for the launcher it is drawing into, and a single "any" entry
 * gets letterboxed on some launchers.
 */

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'AI Personal Tutor',
        short_name: 'AI Tutor',
        description:
            'A tutor that finds the misconception, not just the wrong answer. Practice across 62 subjects with questions that adapt to you.',
        start_url: '/dashboard',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#4f46e5',
        categories: ['education', 'productivity'],
        icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
    };
}
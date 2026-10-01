import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? '';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    // Only the public marketing routes are listed. Everything under /tutor,
    // /dashboard, /parent, /settings and /onboarding requires a session, and
    // the app routes redirect anonymous visitors to login.
    const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
        { path: '/', priority: 1, freq: 'weekly' },
        { path: '/subjects', priority: 0.9, freq: 'monthly' },
        { path: '/pricing', priority: 0.9, freq: 'monthly' },
        // Answers the "how do you use my child's data" and "can I delete my
        // account" questions that most often arrive as an email instead.
        { path: '/faq', priority: 0.5, freq: 'monthly' },
        { path: '/privacy', priority: 0.3, freq: 'yearly' },
        { path: '/terms', priority: 0.3, freq: 'yearly' },
        { path: '/login', priority: 0.3, freq: 'yearly' },
        { path: '/signup', priority: 0.8, freq: 'monthly' },
    ];

    const entries: MetadataRoute.Sitemap = routes.map((r) => ({
        url: SITE_URL ? `${SITE_URL}${r.path}` : r.path,
        lastModified: now,
        changeFrequency: r.freq,
        priority: r.priority,
    }));

    return entries;
}
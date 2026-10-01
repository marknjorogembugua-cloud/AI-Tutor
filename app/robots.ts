import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? '';

export default function robots(): MetadataRoute.Robots {
    // The authenticated app surface should never be crawled, and the API routes
    // are useless to a crawler (they all require a session or POST).
    const disallow = ['/api/', '/tutor', '/dashboard', '/parent', '/settings', '/onboarding'];

    return {
        rules: [{ userAgent: '*', allow: '/', disallow }],
        sitemap: SITE_URL ? `${SITE_URL}/sitemap.xml` : '/sitemap.xml',
        host: SITE_URL || undefined,
    };
}
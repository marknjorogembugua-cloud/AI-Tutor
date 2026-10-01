'use client';
import { useEffect, useState } from 'react';

/**
 * Resumes an upgrade the learner started before signing up. The pricing page
 * stashes the intent when it sends an anonymous visitor to /signup, and we
 * honour it once they are onboarded and able to pay.
 */
export default function UpgradeBanner() {
    const [pending, setPending] = useState(false);

    useEffect(() => {
        try {
            setPending(sessionStorage.getItem('upgrade_intent') === 'family');
        } catch { }
    }, []);

    if (!pending) return null;

    async function start() {
        const res = await fetch('/api/billing/checkout', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ plan: 'family', returnPath: '/dashboard' }),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.url) {
            window.location.href = json.url;
            return;
        }
        // Not configured, or checkout refused — send them somewhere useful.
        window.location.href = '/settings';
    }

    return (
        <div className="card mb-5 flex flex-wrap items-center justify-between gap-4 border-brand bg-brand-soft/40 p-5">
            <div>
                <p className="font-semibold text-ink">Finish setting up Family</p>
                <p className="mt-0.5 text-sm text-ink-soft">
                    You picked the Family plan earlier. Upgrade now for unlimited questions.
                </p>
            </div>
            <div className="flex gap-2">
                <button type="button" onClick={start} className="btn-primary">
                    Upgrade — $19/mo
                </button>
                <button
                    type="button"
                    onClick={() => {
                        try { sessionStorage.removeItem('upgrade_intent'); } catch { }
                        setPending(false);
                    }}
                    className="btn-ghost"
                >
                    Not now
                </button>
            </div>
        </div>
    );
}

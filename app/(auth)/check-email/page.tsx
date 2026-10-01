import Link from 'next/link';
import type { Metadata } from 'next';
import { Logo } from '@/components/Logo';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { InlineTrust, PrivacyNote } from '@/components/Trust';

export const metadata: Metadata = {
    title: 'Confirm your email — AI Personal Tutor',
    description: 'Check your inbox to confirm your email address and finish creating your account.',
    robots: { index: false, follow: false },
};

/**
 * Shown when signup succeeded but the project requires email confirmation, so
 * there is no session yet.
 *
 * Deliberately says nothing about which address was used: it is rendered
 * outside the app layout, which has no session to read the email from, and
 * echoing an address into a page that could be cached or shared would leak it.
 * The visitor knows what they typed.
 */
export default function CheckEmailPage() {
    return (
        <div className="relative min-h-screen bg-aurora">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
            <div className="absolute right-4 top-4">
                <ThemeSwitcher compact />
            </div>

            <div className="relative grid min-h-screen place-items-center px-4 py-12">
                <div className="w-full max-w-md animate-fade-up">
                    <Logo className="mb-8 justify-center text-lg" />

                    <div className="card p-8 shadow-lift">
                        <span
                            aria-hidden
                            className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-brand-ink"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M3 7.5 12 13l9-5.5"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <rect
                                    x="3"
                                    y="5"
                                    width="18"
                                    height="14"
                                    rx="2.5"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                />
                            </svg>
                        </span>

                        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">
                            Check your email
                        </h1>
                        <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-soft">
                            We&apos;ve sent a confirmation link to the address you signed up with.
                            Open it to finish setting up your account — the link signs you in
                            directly.
                        </p>

                        <div className="mt-6 rounded-xl border border-line bg-surface-muted px-4 py-3.5">
                            <p className="text-sm text-ink-soft">
                                <strong className="font-semibold text-ink">Nothing arrived?</strong>{' '}
                                Check your spam folder first, then try signing up again with the
                                same address — that resends the link.
                            </p>
                        </div>

                        <div className="mt-7 flex flex-col gap-3">
                            <Link href="/login" className="btn-primary w-full">
                                Go to log in
                            </Link>
                            <Link href="/signup" className="btn-outline w-full">
                                Resend the link
                            </Link>
                        </div>
                    </div>

                    <PrivacyNote
                        className="mt-4"
                        title="Why we ask"
                    >
                        Confirming an email stops anyone else signing up as your child and keeps
                        password resets going to the right inbox.
                    </PrivacyNote>
                    <InlineTrust
                        className="mt-5 justify-center"
                        items={['No tracking', 'Delete anytime']}
                    />
                </div>
            </div>
        </div>
    );
}
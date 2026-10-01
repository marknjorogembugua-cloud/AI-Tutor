import Link from 'next/link';
import type { Metadata } from 'next';
import { Logo } from '@/components/Logo';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { InlineTrust, PrivacyNote } from '@/components/Trust';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata: Metadata = {
    title: 'Reset your password — AI Personal Tutor',
    description: 'Request a link to set a new password for your AI Personal Tutor account.',
    robots: { index: false, follow: false },
};

/**
 * Split out from the form so this stays a server component — the form itself is
 * a client component, and a page that only renders one does not need to ship
 * the static parts to the browser.
 */
export default function ForgotPasswordPage() {
    return (
        <div className="relative min-h-screen bg-aurora">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
            <div className="absolute right-4 top-4">
                <ThemeSwitcher compact />
            </div>

            <div className="relative grid min-h-screen place-items-center px-4 py-12">
                <div className="w-full max-w-md animate-fade-up">
                    <Logo className="mb-8 justify-center text-lg" />
                    <ForgotPasswordForm />

                    <p className="mt-6 text-center text-sm text-ink-mute">
                        Remembered it?{' '}
                        <Link href="/login" className="font-medium text-brand-ink hover:underline">
                            Back to log in
                        </Link>
                    </p>

                    <PrivacyNote className="mt-4" title="For your protection">
                        We send the same confirmation whether or not an account exists for that
                        address, so this page can&apos;t be used to discover who has an account.
                    </PrivacyNote>
                    <InlineTrust className="mt-5 justify-center" items={['Encrypted in transit', 'No tracking']} />
                </div>
            </div>
        </div>
    );
}
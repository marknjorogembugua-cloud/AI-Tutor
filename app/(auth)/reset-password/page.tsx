import Link from 'next/link';
import type { Metadata } from 'next';
import { Logo } from '@/components/Logo';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { InlineTrust } from '@/components/Trust';
import ResetPasswordForm from './ResetPasswordForm';

export const metadata: Metadata = {
    title: 'Set a new password — AI Personal Tutor',
    description: 'Choose a new password for your AI Personal Tutor account.',
    robots: { index: false, follow: false },
};

/**
 * Server shell around the recovery form.
 *
 * Must stay a server component: the reset link carries its token in the URL
 * fragment, and fragment contents never reach the server, so anything that
 * needed to validate the token here would always fail.
 */
export default function ResetPasswordPage() {
    return (
        <div className="relative min-h-screen bg-aurora">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
            <div className="absolute right-4 top-4">
                <ThemeSwitcher compact />
            </div>

            <div className="relative grid min-h-screen place-items-center px-4 py-12">
                <div className="w-full max-w-md animate-fade-up">
                    <Logo className="mb-8 justify-center text-lg" />
                    <ResetPasswordForm />

                    <p className="mt-6 text-center text-sm text-ink-mute">
                        Link not working?{' '}
                        <Link href="/forgot-password" className="font-medium text-brand-ink hover:underline">
                            Request a new one
                        </Link>
                    </p>

                    <InlineTrust
                        className="mt-5 justify-center"
                        items={['Encrypted in transit', 'No tracking']}
                    />
                </div>
            </div>
        </div>
    );
}
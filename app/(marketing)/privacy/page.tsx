import type { Metadata } from 'next';
import { LegalPage, legalMetadata } from '../LegalPage';

export const metadata: Metadata = legalMetadata(
    'Privacy',
    'privacy',
    'What data AI Personal Tutor collects, why, who can see it, and how to delete it. No ad trackers, no data sales.'
);

/**
 * Privacy policy.
 *
 * Written to match what the code actually does rather than what a template
 * promises. Every claim here is checkable against the schema or a route in this
 * repo — if the two ever disagree, this page is the thing that must change.
 */
export default function PrivacyPage() {
    return (
        <LegalPage
            title="Privacy policy"
            updated="1 October 2026"
            intro="We collect the minimum a tutor needs to teach, we show it only to the people who should see it, and you can delete all of it whenever you like. This page explains exactly what that means."
        >
            <h2>The short version</h2>
            <ul>
                <li>
                    <strong>No advertising.</strong> There are no ad networks, no third-party
                    trackers, and no behavioural profiling anywhere in the product.
                </li>
                <li>
                    <strong>No selling or renting your data.</strong> We do not share learner data
                    with anyone for marketing.
                </li>
                <li>
                    <strong>One account sees one child.</strong> A learner&apos;s answers are
                    readable by that learner and their linked parent account. No other family can
                    see them.
                </li>
                <li>
                    <strong>Deletion is self-service.</strong> You can delete your account and its
                    data from Settings, without emailing anyone.
                </li>
            </ul>

            <h2>Who this covers</h2>
            <p>
                This applies to anyone using AI Personal Tutor — students, parents, and anyone
                visiting the public pages. The public marketing pages set no cookies and run no
                analytics; there is nothing there to collect.
            </p>

            <h2>What we collect</h2>

            <h3>Account data</h3>
            <p>
                Your email address, a display name, and whether the account is a student or a
                parent. Your email is used to sign you in and to send password resets. If billing
                is configured we also store a Stripe customer id and subscription status, so we can
                show you your plan.
            </p>
            <p>
                We never see or store card details. Card data goes directly to Stripe and never
                reaches our servers.
            </p>

            <h3>Learning data</h3>
            <p>
                To teach you, we store the questions you were asked, the answers you gave, whether
                each was correct, how long it took, how many hints you used, and the mastery and
                misconceptions we inferred from that. We also keep the topics and skills you have
                practised.
            </p>
            <p>
                A student may optionally give a first name, age, grade, country, and learning goals.
                Only the name is required. These shape question difficulty and language — they are
                not used for marketing.
            </p>

            <h3>Parent–child links</h3>
            <p>
                If a parent links to a student account, we store that link so the parent can read
                the child&apos;s progress. A link can be removed at any time by the parent, which
                immediately revokes access.
            </p>

            <h3>Technical data</h3>
            <p>
                Our hosting provider necessarily processes IP addresses and request metadata to
                deliver the site. We do not use that information to profile you.
            </p>

            <h2>Who can see a learner&apos;s data</h2>
            <p>
                The student account, and any parent account linked to it. This is enforced in the
                database with row-level security, not merely hidden in the interface — a bug in our
                code cannot leak another child&apos;s answers, because the database refuses the
                query.
            </p>
            <p>We use a small number of processors to run the service:</p>
            <ul>
                <li>
                    <strong>Supabase</strong> — authentication and database storage.
                </li>
                <li>
                    <strong>Anthropic or OpenAI</strong> (whichever provider a deployment is
                    configured to use) — generating questions, hints and explanations. Only the
                    context needed for the current question is sent.
                </li>
                <li>
                    <strong>Stripe</strong> — payments, if you subscribe.
                </li>
            </ul>

            <h2>What we do not do</h2>
            <ul>
                <li>No selling, renting, or trading your data.</li>
                <li>No third-party advertising or tracking scripts.</li>
                <li>No profiling for targeted advertising.</li>
                <li>No scanning your answers for advertising keywords.</li>
            </ul>

            <h2>How long we keep it</h2>
            <p>
                While your account is active we keep your data so you can learn. When you delete
                your account, your application data is deleted with it. Backups roll off on our
                provider&apos;s normal schedule, which means residual data may persist in encrypted
                backups for a limited period before expiring.
            </p>

            <h2>Deleting your account</h2>
            <p>
                Go to <strong>Settings → Delete account</strong>, confirm, and it is done. This
                removes your profile, your questions, answers, progress, and any parent links. If
                you have an active subscription it is cancelled at the same time.
            </p>
            <p>
                Deletion is immediate and cannot be undone. If you would rather keep your data and
                close the account, or you have a question, get in touch before you delete.
            </p>

            <h2>Children&apos;s data</h2>
            <p>
                This product is designed for school-age learners, and a parent or guardian accounts
                for them. We do not knowingly collect data directly from children without a parent
                or guardian&apos;s involvement. Parents can review and delete their child&apos;s
                data at any time through the parent dashboard and Settings.
            </p>

            <h2>Your rights</h2>
            <p>
                Depending on where you live, you may have rights to access, correct, export, or
                delete your personal data, and to object to certain processing. In this product
                those rights are designed to be self-service: your data is already yours to view
                and delete. If you want an export, or have a specific request, contact us and we
                will action it.
            </p>

            <h2>Security</h2>
            <p>
                Data is encrypted in transit, access is enforced per-account at the database, and
                service-role credentials stay server-side. No system is perfect, and we would rather
                say so than imply otherwise.
            </p>

            <h2>Changes to this policy</h2>
            <p>
                If we change what we collect, or who we share it with, we will update this page and
                change the date at the top. Material changes affecting your data will be announced
                in the product.
            </p>

            <h2>Contact</h2>
            <p>
                Questions about privacy can go to <code>privacy@aitutor.example</code>. Replace that
                address with your real support address before launch — this placeholder is what the
                codebase ships with.
            </p>
        </LegalPage>
    );
}
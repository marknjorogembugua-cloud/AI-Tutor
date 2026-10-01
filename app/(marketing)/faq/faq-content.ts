/**
 * FAQ content, kept out of the client component so the copy can be written and
 * reviewed as plain data, and so curriculum figures stay in one place.
 */

export type FaqItem = { q: string; a: string };
export type FaqGroup = { id: string; title: string; items: FaqItem[] };

/** Set these when the product's limits actually change. */
const DAILY_FREE = 5;

export function faqGroups(stats: { subjects: number; topics: number; skills: number }): FaqGroup[] {
    return [
        {
            id: 'basics',
            title: 'Getting started',
            items: [
                {
                    q: 'What subjects are covered?',
                    a: `${stats.subjects} subjects, ${stats.topics} topics and ${stats.skills} skills — from maths, the sciences and languages through to music, design, study skills and exam preparation. Every topic is listed on the subjects page, so you can check before signing up.`,
                },
                {
                    q: 'Do I need a card to start?',
                    a: 'No. The free account needs no payment details and includes a diagnostic assessment, full progress tracking and a daily allowance of questions. A card is only needed if you upgrade.',
                },
                {
                    q: 'How long does setup take?',
                    a: 'A couple of minutes. Create the account, answer a short diagnostic so the tutor knows where to start, then pick a topic. Your first session can begin immediately.',
                },
                {
                    q: 'Does my child need an email address?',
                    a: 'Each student needs their own account and email, because answers are stored per account and that separation is what keeps one family from seeing another\'s work. If your child does not have an email, create one for them and keep the password to yourself.',
                },
                {
                    q: 'How do I link my child to my parent account?',
                    a: 'Create your account as a parent, then open the My Child page and create an invite code. Your child enters that code on their own account — from Settings, or during onboarding. The link is one-way and you can remove it at any time.',
                },
            ],
        },
        {
            id: 'how-it-works',
            title: 'How the tutor teaches',
            items: [
                {
                    q: 'Does it just give my child the answers?',
                    a: 'No. The tutor is built to withhold the answer: it offers graduated hints first, explains the underlying concept, and only shows a full worked example when a student is genuinely stuck.',
                },
                {
                    q: 'How does it decide what to practise?',
                    a: 'A short diagnostic establishes a starting level. From there the tutor tracks mastery per skill, notes recurring misconceptions, and adjusts question difficulty in real time rather than serving a fixed worksheet.',
                },
                {
                    q: 'What is a "misconception"?',
                    a: 'A wrong answer reached by a consistent piece of faulty reasoning — not a slip. The tutor distinguishes the two, because they need opposite responses: a slip needs a nudge, a misconception needs the idea retaught. That distinction is the main thing separating this from a generic chatbot.',
                },
                {
                    q: 'Can it use my child\'s actual school textbook?',
                    a: 'Not yet. The curriculum covers the standard topics for each subject rather than a specific textbook\'s chapters, so terminology may differ from your school\'s scheme. We are working on upload support.',
                },
                {
                    q: 'Is the content age-appropriate?',
                    a: 'Subjects are mapped to school-age topics, and hints are written to explain rather than to talk down. If something reads as too easy or too advanced, the difficulty adjusts as your child answers more questions.',
                },
            ],
        },
        {
            id: 'parents',
            title: 'For parents',
            items: [
                {
                    q: 'What can parents see?',
                    a: 'Questions answered, accuracy, strong and weak areas, and recurring mistakes — described in plain language, with a recommendation for what to work on next. You see the picture, not a wall of raw statistics.',
                },
                {
                    q: 'Can my child see that I am looking?',
                    a: 'The link is transparent in both directions: your child can see that their account is linked to a parent. We do not show a parent view that hides itself from the learner.',
                },
                {
                    q: 'Can two parents share one child?',
                    a: 'One parent account can link to several children, and the Family plan covers up to five. A single child account links to one parent account at a time, which keeps access unambiguous. If another caregiver needs access, contact us and we will help.',
                },
                {
                    q: 'Does it replace a tutor or teacher?',
                    a: 'No, and it is not meant to. It is most useful as practice between lessons — unlimited questions, instant feedback, and a record of where the gaps are — so a tutor\'s time goes on teaching rather than on repeated drills.',
                },
                {
                    q: 'What happens to the data if my child stops using it?',
                    a: 'It stays in the account until you delete it. If you delete the child\'s account from Settings, their questions, answers and progress are removed along with it.',
                },
            ],
        },
        {
            id: 'billing',
            title: 'Plans and billing',
            items: [
                {
                    q: `What happens after the free ${DAILY_FREE} questions run out?`,
                    a: 'The account keeps working: progress, history and the parent dashboard all stay available. Only new AI questions pause until midnight, or until you upgrade. Nothing is lost and no card is ever charged automatically.',
                },
                {
                    q: 'Can I cancel at any time?',
                    a: 'Yes, from Settings. Cancelling stops future renewals immediately and your access continues until the end of the period you have already paid for. You can resubscribe later and your history is still there.',
                },
                {
                    q: 'Will I be charged automatically?',
                    a: 'Only if you explicitly start a paid subscription. We email you before a renewal on an auto-renewing plan, and there is no trial that converts silently.',
                },
                {
                    q: 'Can I get a refund?',
                    a: 'If something has gone wrong, contact us within 14 days of a charge. Where a plan has not been meaningfully used we will refund it.',
                },
                {
                    q: 'Do you offer discounts?',
                    a: 'Not yet. Education pricing is on our list for the future, and we would rather say so than pretend the price is final.',
                },
            ],
        },
        {
            id: 'privacy',
            title: 'Privacy and safety',
            items: [
                {
                    q: 'Is my child\'s data private?',
                    a: 'Answers are stored per student and are visible only to that student and their linked parent account. This is enforced by row-level security in the database, so it holds even if our own interface had a bug. The full detail is in the privacy policy.',
                },
                {
                    q: 'Do you use ads or trackers?',
                    a: 'No. There are no ad networks, no third-party trackers, and no behavioural profiling in the product. The marketing pages set no cookies.',
                },
                {
                    q: 'Can I delete the account and all the data?',
                    a: 'Yes — Settings → Delete account. It removes your profile, questions, answers, progress and parent links, and cancels any subscription. It is immediate and cannot be undone.',
                },
                {
                    q: 'Can the AI give my child the wrong answer?',
                    a: 'It can. The output is generated rather than written by a teacher, so it may contain errors or oversimplifications and may not match your curriculum. That is why the tutor explains rather than just asserts, and why we tell you to check work against a trusted source.',
                },
                {
                    q: 'Do you train models on my child\'s answers?',
                    a: 'No. Your answers are used to generate feedback for your child, and are not used to train third-party models.',
                },
            ],
        },
    ];
}
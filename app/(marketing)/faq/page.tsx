import type { Metadata } from 'next';
import { CURRICULUM_STATS } from '@/lib/curriculum.generated';
import { faqGroups } from './faq-content';
import FaqPage from './FaqClient';

export const metadata: Metadata = {
    title: 'Questions — AI Personal Tutor',
    description: `Answers about subjects covered, how the tutor teaches, what parents can see, billing and privacy. ${CURRICULUM_STATS.subjects} subjects and ${CURRICULUM_STATS.skills} skills, free to start.`,
    alternates: { canonical: '/faq' },
};

/**
 * The questions and answers are passed to the client component as data, so they
 * are serialised into the HTML payload and remain readable by crawlers and with
 * JavaScript disabled — no duplicate server-rendered copy is needed.
 */
export default function Page() {
    return <FaqPage groups={faqGroups(CURRICULUM_STATS)} />;
}
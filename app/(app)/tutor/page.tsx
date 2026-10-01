import { createClient } from '@/lib/supabase/server';
import TutorCatalogue, { type TutorSubject } from './TutorCatalogue';

export default async function TutorHomePage() {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;

    const { data } = await sb
        .from('topics')
        .select('id, name, subject_id, subjects(id, name, description, emoji, sort_order)')
        .eq('is_published', true)
        .order('name');

    // Group by subject id (not display name — two subjects could share a name).
    // sort_order rides along so subjects can be grouped by band; see
    // scripts/generate-curriculum.mjs for how the bands are laid out.
    const byId = new Map<string, TutorSubject>();
    for (const t of (data ?? []) as any[]) {
        const s = t.subjects;
        if (!s) continue;
        let subject = byId.get(s.id);
        if (!subject) {
            subject = {
                id: s.id,
                name: s.name,
                description: s.description ?? null,
                emoji: s.emoji ?? null,
                sortOrder: s.sort_order ?? 1000,
                topics: [],
            };
            byId.set(s.id, subject);
        }
        subject.topics.push({ id: t.id, name: t.name });
    }

    // Catalogue order lives in the DB, so adding a subject needs no code change.
    // Name is the tiebreak for subjects that share a sort_order.
    const subjects = [...byId.values()].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)
    );

    return <TutorCatalogue subjects={subjects} />;
}
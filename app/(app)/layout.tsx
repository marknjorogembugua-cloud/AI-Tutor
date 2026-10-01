import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/AppShell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await sb.from('users').select('role').eq('id', user.id).single();
    const role: 'student' | 'parent' = profile?.role === 'parent' ? 'parent' : 'student';

    return <AppShell role={role}>{children}</AppShell>;
}

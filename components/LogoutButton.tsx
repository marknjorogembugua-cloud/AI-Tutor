'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export function LogoutButton() {
    const sb = createClient();
    const router = useRouter();
    return (
        <Button
            variant="ghost"
            className="px-3 py-2 text-sm"
            onClick={async () => {
                await sb.auth.signOut();
                router.push('/');
                router.refresh();
            }}
        >
            Log out
        </Button>
    );
}

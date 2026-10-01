'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import AcceptInviteCard from './AcceptInviteCard';

type Props = {
    student: { id: string; display_name: string | null; parent_id: string | null } | null;
    /** Parent's display name, read through the "parent reads child" policy. */
    parentName: string | null;
};

/**
 * The child's side of parent linking, on the settings page.
 *
 * Unlinking is offered here as well as on the parent's own page. A child who
 * wants their parent to stop seeing their work should not have to ask the parent
 * to do it — and the parent page is not something a child necessarily knows
 * exists.
 */
export default function LinkParentPanel({ student, parentName }: Props) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [confirming, setConfirming] = useState(false);

    const linked = Boolean(student?.parent_id);

    async function unlink() {
        setBusy(true);
        setErr(null);
        try {
            const res = await fetch('/api/parent/unlink', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ studentId: student!.id }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                setErr(json.detail ?? 'Could not remove that link.');
                return;
            }
            setConfirming(false);
            router.refresh();
        } catch {
            setErr('Could not reach the server. Please try again.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="space-y-4">
            {linked ? (
                <div className="card border-brand-line bg-brand-soft/40">
                    <h2 className="font-semibold text-ink">
                        {parentName ? `Linked to ${parentName}` : 'Linked to a parent account'}
                    </h2>
                    <p className="mt-2 text-pretty text-sm leading-relaxed text-ink-soft">
                        They can see your practice history, strengths and gaps. Nothing is visible
                        to them that you cannot also see here.
                    </p>

                    {err && (
                        <p role="alert" className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                            {err}
                        </p>
                    )}

                    {confirming ? (
                        <div className="mt-5 rounded-xl border border-line bg-surface-muted px-4 py-4">
                            <p className="text-sm leading-relaxed text-ink-soft">
                                Remove this link now? {parentName ?? 'Your parent'} loses access
                                straight away. Your progress stays exactly as it is, and a new code
                                would let you link again.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    disabled={busy}
                                    onClick={unlink}
                                >
                                    {busy ? 'Removing…' : 'Yes, remove access'}
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                                    Keep the link
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-5"
                            onClick={() => setConfirming(true)}
                        >
                            Remove parent access
                        </Button>
                    )}
                </div>
            ) : (
                <AcceptInviteCard linkedTo={null} />
            )}
        </div>
    );
}
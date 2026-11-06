import { Badge, type BadgeTone } from '@/components/ui/Badge';
import type { EventStatusValue } from './types';

export const STATUS_META: Record<EventStatusValue, { label: string; tone: BadgeTone; description: string; dot: string }> = {
  DRAFT: { label: 'Draft', tone: 'neutral', description: 'Hidden from the public.', dot: 'bg-slate-400' },
  ACTIVE: {
    label: 'Active',
    tone: 'green',
    description: 'Visible on the site and selling during the sales window.',
    dot: 'bg-emerald-500',
  },
  CLOSED: { label: 'Closed', tone: 'amber', description: 'Visible, but online sales are off.', dot: 'bg-amber-500' },
  COMPLETED: { label: 'Completed', tone: 'blue', description: 'Archived after the show.', dot: 'bg-spirit' },
};

export function StatusBadge({ status }: { status: EventStatusValue }) {
  const meta = STATUS_META[status];
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  );
}

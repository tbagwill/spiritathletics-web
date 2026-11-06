import { formatPt } from '@/lib/time';
import type { OnlineSalesState } from '@/lib/ticketing';
import { cn } from '@/components/ui/cn';

export function salesStateLabel(state: OnlineSalesState): string {
  switch (state.kind) {
    case 'EARLY_BIRD':
      return 'Early Bird on sale';
    case 'DOOR':
      return 'On sale now';
    case 'UPCOMING':
      return `On sale ${formatPt(state.opensAt, "EEE, MMM d 'at' h:mm a")}`;
    default:
      return 'Online sales closed';
  }
}

/** One-line detail under the pill, e.g. when the current price window ends. */
export function salesStateDetail(state: OnlineSalesState): string | null {
  switch (state.kind) {
    case 'EARLY_BIRD':
      return `Early Bird pricing ends ${formatPt(state.endsAt, "EEE, MMM d 'at' h:mm a 'PT'")}`;
    case 'DOOR':
      return `Online sales close ${formatPt(state.closesAt, "EEE, MMM d 'at' h:mm a 'PT'")}`;
    case 'UPCOMING':
      return state.afterEarlyBird
        ? `Early Bird has ended. Door pricing opens online ${formatPt(state.opensAt, "EEE, MMM d 'at' h:mm a 'PT'")}`
        : `Online tickets go on sale ${formatPt(state.opensAt, "EEE, MMM d 'at' h:mm a 'PT'")}`;
    default:
      return null;
  }
}

export function SalesStatePill({ state, onDark = true }: { state: OnlineSalesState; onDark?: boolean }) {
  const live = state.kind === 'EARLY_BIRD' || state.kind === 'DOOR';
  const dot = live ? 'bg-emerald-400' : state.kind === 'UPCOMING' ? 'bg-amber-400' : 'bg-slate-400';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset',
        onDark ? 'bg-white/10 text-white ring-white/15 backdrop-blur' : 'bg-white text-slate-800 ring-slate-200',
      )}
    >
      <span className="relative flex size-2">
        {live ? <span className={cn('absolute inline-flex size-full rounded-full opacity-75 motion-safe:animate-ping', dot)} /> : null}
        <span className={cn('relative inline-flex size-2 rounded-full', dot)} />
      </span>
      {salesStateLabel(state)}
    </span>
  );
}

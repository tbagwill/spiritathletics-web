'use client';

import { Ban, Check, CircleX, ScanLine, TriangleExclamationPoint } from 'lucide-react';
import { cn } from '@/components/ui/cn';

export type ScanOutcome =
  | { kind: 'ok'; count: number; alreadyCount: number; customerName: string; tierName: string }
  | { kind: 'already'; customerName: string; message: string }
  | { kind: 'wrong_event' | 'voided' | 'not_found' | 'error'; message: string };

// Every result stays on screen until staff tap "Scan another", so nobody misses the wristband count.
// Scanning is paused while it's up (Scanner ignores codes until the sheet is dismissed).

const STYLE = {
  ok: { panel: 'bg-emerald-500 text-white', icon: Check, label: 'Checked in' },
  already: { panel: 'bg-amber-400 text-ink', icon: TriangleExclamationPoint, label: 'Already checked in' },
  wrong_event: { panel: 'bg-red-500 text-white', icon: CircleX, label: 'Wrong event' },
  voided: { panel: 'bg-red-500 text-white', icon: Ban, label: 'Ticket void' },
  not_found: { panel: 'bg-red-500 text-white', icon: CircleX, label: 'Not a ticket' },
  error: { panel: 'bg-slate-800 text-white', icon: TriangleExclamationPoint, label: 'Couldn’t check in' },
} as const;

export function ScanResultSheet({ outcome, onDismiss }: { outcome: ScanOutcome; onDismiss: () => void }) {
  const style = STYLE[outcome.kind];
  const Icon = style.icon;

  return (
    // No tap-outside dismissal: only "Scan another" clears it, so a stray tap can't hide the count.
    <div
      className="absolute inset-0 z-20 flex items-end justify-center bg-black/55 p-4 pb-[max(env(safe-area-inset-bottom),16px)] backdrop-blur-sm motion-safe:animate-fade sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={style.label}
    >
      <div
        className={cn(
          'relative w-full max-w-sm overflow-hidden rounded-[32px] px-6 pb-6 pt-8 text-center shadow-2xl motion-safe:animate-sheet',
          style.panel,
        )}
      >
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-black/15 motion-safe:animate-pop">
          <Icon className="size-9" strokeWidth={2.5} aria-hidden />
        </span>
        <div className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] opacity-80">{style.label}</div>

        {outcome.kind === 'ok' ? (
          <>
            <div className="mt-2 text-7xl font-semibold leading-none tabular-nums tracking-tight">{outcome.count}</div>
            <div className="mt-1 text-lg font-medium opacity-90">{outcome.count === 1 ? 'wristband' : 'wristbands'}</div>
            <div className="mt-5 truncate text-xl font-semibold">{outcome.customerName || 'Guest'}</div>
            <div className="mt-0.5 text-sm opacity-85">{outcome.tierName}</div>
            {outcome.alreadyCount > 0 ? (
              <div className="mt-3 rounded-2xl bg-black/15 px-3 py-2 text-sm">
                {outcome.alreadyCount} more on this order already checked in earlier.
              </div>
            ) : null}
          </>
        ) : outcome.kind === 'already' ? (
          <>
            <div className="mt-3 truncate text-2xl font-semibold">{outcome.customerName || 'Guest'}</div>
            <div className="mt-1 text-sm opacity-85">{outcome.message}</div>
            <div className="mt-3 text-sm font-medium">Don’t hand out another wristband.</div>
          </>
        ) : (
          <div className="mt-3 text-base leading-relaxed opacity-95">{outcome.message}</div>
        )}

        {outcome.kind === 'ok' ? (
          <div className="mt-5 text-sm opacity-85">Hand out the wristbands, then tap below.</div>
        ) : null}

        <button
          type="button"
          onClick={onDismiss}
          autoFocus
          className={cn(
            'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full py-4 text-base font-semibold transition-transform active:scale-[0.98]',
            outcome.kind === 'already' ? 'bg-ink text-white' : 'bg-white text-ink',
          )}
        >
          <ScanLine className="size-5" aria-hidden />
          Scan another
        </button>
      </div>
    </div>
  );
}

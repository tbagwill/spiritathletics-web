'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Small label above the title, e.g. "Private lesson". */
  eyebrow?: string;
  title: string;
  /** What's being booked: date, time, coach. Shown under the title. */
  meta?: React.ReactNode;
  children: React.ReactNode;
  /** Pinned to the bottom: total and the primary action. */
  footer?: React.ReactNode;
  /** `lg` for staff editors with more fields. */
  size?: 'md' | 'lg';
};

/**
 * Form container: a bottom sheet on phones, a centered card on larger screens.
 * Traps focus, closes on Escape or a tap outside, and locks page scroll.
 */
export function Sheet({ open, onOpenChange, eyebrow, title, meta, children, footer, size = 'md' }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-ink/50 backdrop-blur-sm motion-safe:animate-fade" />
        <Dialog.Content
          aria-describedby={undefined}
          className={`fixed inset-x-0 bottom-0 z-[91] flex max-h-[92dvh] flex-col rounded-t-[28px] bg-white font-sans text-slate-900 shadow-soft-lg outline-none motion-safe:animate-sheet sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[88dvh] sm:w-[calc(100%-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px] ${
            size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-md'
          }`}
        >
          <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-slate-200 sm:hidden" />
          <div className="flex shrink-0 items-start gap-3 px-5 pb-4 pt-3 sm:px-6 sm:pt-6">
            <div className="min-w-0 flex-1">
              {eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-spirit">{eyebrow}</p>
              ) : null}
              <Dialog.Title className="mt-1 text-xl font-semibold tracking-tight">{title}</Dialog.Title>
              {meta ? (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 [&_svg]:size-4 [&_svg]:text-slate-400">
                  {meta}
                </div>
              ) : null}
            </div>
            <Dialog.Close className="-mr-1.5 flex size-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
              <X className="size-5" aria-hidden />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-slate-100 px-5 py-5 sm:px-6">
            {children}
          </div>
          {footer ? (
            <div className="shrink-0 border-t border-slate-100 px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-4 sm:px-6 sm:pb-6">
              {footer}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** A titled group of fields inside a form, so long forms read as a few short chunks. */
export function FormGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** Collapsible group for rarely-used fields. */
export function MoreOptions({ label = 'More options', children }: { label?: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-2xl ring-1 ring-inset ring-slate-200">
      <summary className="summary-clean flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
        {label}
        <span aria-hidden className="text-slate-400 transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="grid gap-4 border-t border-slate-100 px-4 pb-4 pt-4">{children}</div>
    </details>
  );
}

/** One item in the Sheet's meta row: icon + text. */
export function SheetMeta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      {children}
    </span>
  );
}

'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Button } from './Button';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  loading?: boolean;
  destructive?: boolean;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  loading,
  destructive,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-ink/50 backdrop-blur-sm motion-safe:animate-fade" />
        <Dialog.Content className="fixed inset-x-4 bottom-4 z-[91] mx-auto max-w-md rounded-3xl bg-white p-6 shadow-soft-lg motion-safe:animate-sheet sm:inset-x-0 sm:bottom-auto sm:top-1/3">
          <Dialog.Title className="text-lg font-semibold tracking-tight text-slate-900">{title}</Dialog.Title>
          {description ? (
            <Dialog.Description className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</Dialog.Description>
          ) : null}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Dialog.Close asChild>
              <Button variant="outline" disabled={loading}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button variant={destructive ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

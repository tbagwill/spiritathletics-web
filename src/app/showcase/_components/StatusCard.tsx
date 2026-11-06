import { cn } from '@/components/ui/cn';

/** Centered single-card layout for checkout outcomes (success, waiting, failed, canceled). */
export function StatusCard({
  icon,
  iconClassName,
  title,
  children,
  actions,
}: {
  icon: React.ReactNode;
  iconClassName?: string;
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-canvas bg-[radial-gradient(900px_420px_at_50%_-10%,rgba(0,0,254,0.16),transparent_70%)] px-4 py-16 font-sans">
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-white p-8 text-center shadow-soft-lg ring-1 ring-slate-200/70 motion-safe:animate-rise sm:p-10">
        <div aria-hidden className="bg-spirit-gradient absolute inset-x-0 top-0 h-1.5" />
        <div
          className={cn(
            'mx-auto flex size-16 items-center justify-center rounded-full motion-safe:animate-pop',
            iconClassName ?? 'bg-spirit-gradient shadow-spirit text-white',
          )}
        >
          {icon}
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {children ? <div className="mt-3 space-y-2 text-[15px] leading-relaxed text-slate-600">{children}</div> : null}
        {actions ? <div className="mt-8 flex flex-col items-center gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}

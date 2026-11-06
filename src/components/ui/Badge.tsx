import { cn } from './cn';

export type BadgeTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'glass';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  blue: 'bg-spirit-50 text-spirit ring-spirit-400/30',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  glass: 'bg-white/10 text-white ring-white/20 backdrop-blur',
};

const dots: Record<BadgeTone, string> = {
  neutral: 'bg-slate-400',
  blue: 'bg-spirit',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  violet: 'bg-violet-500',
  glass: 'bg-white',
};

export function Badge({
  tone = 'neutral',
  dot,
  pulse,
  className,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {dot ? (
        <span className="relative flex size-1.5">
          {pulse ? (
            <span className={cn('absolute inline-flex size-full rounded-full opacity-75 motion-safe:animate-ping', dots[tone])} />
          ) : null}
          <span className={cn('relative inline-flex size-1.5 rounded-full', dots[tone])} />
        </span>
      ) : null}
      {children}
    </span>
  );
}

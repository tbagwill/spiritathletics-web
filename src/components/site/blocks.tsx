import type { LucideIcon } from 'lucide-react';
import { HeroBackdrop } from '@/app/showcase/_components/HeroBackdrop';
import { cn } from '@/components/ui/cn';

/** Eyebrow + heading + optional lead at the top of a section. */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  center,
  onDark,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  center?: boolean;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center', className)}>
      {eyebrow ? (
        <p className={cn('text-sm font-semibold', onDark ? 'text-white/70' : 'text-spirit')}>{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {lead ? (
        <p className={cn('mt-3 leading-relaxed', onDark ? 'text-white/70' : 'text-slate-600')}>{lead}</p>
      ) : null}
    </div>
  );
}

const tileSizes = {
  sm: 'size-9 rounded-xl [&>svg]:size-4',
  md: 'size-11 rounded-2xl [&>svg]:size-5',
  lg: 'size-12 rounded-2xl [&>svg]:size-6',
};

/** Blue gradient square holding an icon. */
export function IconTile({
  icon: Icon,
  size = 'md',
  tone = 'blue',
  className,
}: {
  icon: LucideIcon;
  size?: keyof typeof tileSizes;
  tone?: 'blue' | 'ink' | 'glass';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center text-white',
        tone === 'blue' && 'bg-spirit-gradient shadow-spirit',
        tone === 'ink' && 'bg-ink',
        tone === 'glass' && 'bg-white/10 ring-1 ring-inset ring-white/15',
        tileSizes[size],
        className,
      )}
    >
      <Icon aria-hidden />
    </span>
  );
}

/** White card with a hairline ring and soft shadow; lifts on hover when `interactive`. */
export function cardClass(interactive = false, className?: string) {
  return cn(
    'rounded-3xl bg-white shadow-soft ring-1 ring-slate-200/70',
    interactive && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg hover:ring-spirit/40',
    className,
  );
}

/** Rounded dark closing panel with a title, body and actions. */
export function CtaPanel({
  title,
  body,
  children,
}: {
  title: React.ReactNode;
  body?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="px-4 pb-14 pt-2 sm:px-6 sm:pb-20">
      <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-ink px-6 py-12 text-center text-white sm:px-12 sm:py-16">
        <HeroBackdrop compact />
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
        {body ? <p className="mx-auto mt-3 max-w-xl leading-relaxed text-white/70">{body}</p> : null}
        {children ? (
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}

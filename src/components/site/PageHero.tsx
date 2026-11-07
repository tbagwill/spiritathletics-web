import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { HeroBackdrop } from '@/app/showcase/_components/HeroBackdrop';

type Crumb = { href: string; label: string };

/** Dark brand hero used at the top of marketing pages. */
export function PageHero({
  eyebrow,
  title,
  accent,
  lead,
  crumbs,
  image,
  children,
  bottomSpace = false,
}: {
  eyebrow?: string;
  title: string;
  /** Second half of the title, drawn with the blue gradient. */
  accent?: string;
  lead?: React.ReactNode;
  /** Breadcrumb trail; the last item is the current page. Replaces the eyebrow. */
  crumbs?: Crumb[];
  /** Background photo from /public, blended into the backdrop. */
  image?: string;
  children?: React.ReactNode;
  /** Extra bottom padding when cards overlap the hero's lower edge. */
  bottomSpace?: boolean;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <HeroBackdrop compact />
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover opacity-20 mix-blend-luminosity"
        />
      ) : null}
      <div
        className={`mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-20 ${bottomSpace ? 'pb-24 sm:pb-32' : 'pb-14 sm:pb-20'}`}
      >
        {crumbs ? (
          <nav aria-label="Breadcrumb" className="motion-safe:animate-rise">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-white/60">
              {crumbs.map((c, i) => (
                <li key={c.href} className="flex items-center gap-1">
                  {i > 0 ? <ChevronRight className="size-3.5 text-white/35" aria-hidden /> : null}
                  {i === crumbs.length - 1 ? (
                    <span aria-current="page" className="text-white/85">
                      {c.label}
                    </span>
                  ) : (
                    <Link href={c.href} className="rounded-md px-1 py-0.5 hover:bg-white/10 hover:text-white">
                      {c.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : eyebrow ? (
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 ring-1 ring-inset ring-white/15 motion-safe:animate-rise">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-tight sm:mt-6 sm:text-6xl motion-safe:animate-rise"
          style={{ animationDelay: '60ms' }}
        >
          {title}
          {accent ? (
            <>
              {' '}
              <span className="bg-gradient-to-r from-white via-[#c9cdff] to-[#7c88ff] bg-clip-text text-transparent">
                {accent}
              </span>
            </>
          ) : null}
        </h1>
        {lead ? (
          <p
            className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg motion-safe:animate-rise"
            style={{ animationDelay: '120ms' }}
          >
            {lead}
          </p>
        ) : null}
        {children ? (
          <div className="mt-8 motion-safe:animate-rise" style={{ animationDelay: '180ms' }}>
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}

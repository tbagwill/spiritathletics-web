import { HeroBackdrop } from '@/app/showcase/_components/HeroBackdrop';

/** Shown while any /book page loads; mirrors the dark hero + cards so nothing jumps. */
export default function Loading() {
  return (
    <div className="min-h-screen bg-canvas" aria-busy="true" aria-label="Loading">
      <section className="relative isolate overflow-hidden bg-ink">
        <HeroBackdrop compact />
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pb-32 sm:pt-20">
          <div className="h-5 w-32 animate-pulse rounded-full bg-white/10" />
          <div className="mt-6 h-12 w-72 max-w-full animate-pulse rounded-2xl bg-white/10 sm:h-14 sm:w-96" />
          <div className="mt-5 h-5 w-80 max-w-full animate-pulse rounded-full bg-white/[0.07]" />
        </div>
      </section>
      <div className="relative z-10 mx-auto -mt-16 grid max-w-6xl gap-4 px-4 sm:-mt-20 sm:px-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-72 rounded-3xl ring-1 ring-slate-200/70" />
        ))}
      </div>
    </div>
  );
}

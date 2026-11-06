/** Blue page banner for the events admin. */
export function AdminHero({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-spirit-deep shadow-spirit relative isolate mb-8 overflow-hidden rounded-[28px] px-6 py-7 text-white motion-safe:animate-rise sm:px-8 sm:py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 -z-10 size-80 rounded-full bg-[#4169E1] opacity-50 blur-3xl"
      />
      <div
        aria-hidden
        className="bg-dot-grid pointer-events-none absolute inset-0 -z-10 opacity-20 [mask-image:radial-gradient(ellipse_at_top_right,black_10%,transparent_60%)]"
      />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? <div className="flex flex-wrap items-center gap-2 text-sm text-white/75">{eyebrow}</div> : null}
          <h1 className="mt-2 text-2xl font-semibold tracking-tight break-words sm:truncate sm:text-3xl">{title}</h1>
          {description ? <p className="mt-1 max-w-2xl text-white/70">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

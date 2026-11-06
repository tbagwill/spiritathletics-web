export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-5 border-t border-slate-200/80 py-10 first:border-t-0 first:pt-2 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
      <div>
        <h2 className="flex items-center gap-2.5 font-semibold tracking-tight text-slate-900">
          <span className="bg-spirit-gradient h-4 w-1 rounded-full" aria-hidden />
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70 sm:p-6 ${className}`}>{children}</div>
  );
}

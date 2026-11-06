/** Blue-to-black brand backdrop for dark bands. Parent needs `relative isolate overflow-hidden`. */
export function HeroBackdrop({ imageUrl, compact }: { imageUrl?: string | null; compact?: boolean }) {
  const safeImage = imageUrl && imageUrl.startsWith('https://') ? imageUrl : null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#0000fe_0%,#03068f_18%,#020318_48%,#000000_100%)]" />
      {safeImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-luminosity"
          style={{ backgroundImage: `url(${JSON.stringify(safeImage)})` }}
        />
      ) : null}
      <div
        className={
          compact
            ? 'absolute -left-24 -top-32 h-[340px] w-[560px] rounded-full bg-spirit opacity-55 blur-[110px]'
            : 'absolute -left-40 -top-48 h-[520px] w-[720px] rounded-full bg-spirit opacity-55 blur-[130px] motion-safe:animate-glow'
        }
      />
      <div
        className={
          compact
            ? 'absolute -bottom-40 -right-16 h-[320px] w-[420px] rounded-full bg-[#4169E1] opacity-35 blur-[110px]'
            : 'absolute -bottom-48 -right-24 h-[480px] w-[580px] rounded-full bg-[#4169E1] opacity-45 blur-[120px]'
        }
      />
      <div className="bg-dot-grid absolute inset-0 opacity-25 [mask-image:radial-gradient(ellipse_at_top_left,black_20%,transparent_65%)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-spirit-400/70 to-transparent" />
    </div>
  );
}

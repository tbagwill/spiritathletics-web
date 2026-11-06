'use client';

import { useEffect, useState } from 'react';

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [
    { label: 'Days', value: Math.floor(s / 86400) },
    { label: 'Hrs', value: Math.floor((s % 86400) / 3600) },
    { label: 'Min', value: Math.floor((s % 3600) / 60) },
    { label: 'Sec', value: s % 60 },
  ];
}

/** Renders empty boxes on the server and fills in after mount, so there's no hydration mismatch. */
export function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = now == null ? null : new Date(target).getTime() - now;
  if (remaining != null && remaining <= 0) {
    return (
      <div className="rounded-2xl bg-white/[0.06] px-4 py-3 text-center text-sm font-semibold text-white ring-1 ring-white/10">
        The show is on. See you on the floor!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2" aria-label="Time until the show">
      {parts(remaining ?? 0).map(({ label, value }) => (
        <div key={label} className="rounded-2xl bg-white/[0.06] py-3 text-center ring-1 ring-white/10">
          <div className="text-2xl font-semibold tabular-nums tracking-tight text-white">
            {remaining == null ? '··' : String(value).padStart(2, '0')}
          </div>
          <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/50">{label}</div>
        </div>
      ))}
    </div>
  );
}

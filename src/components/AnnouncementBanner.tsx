'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';

type Props = {
  /** Unique key stored in localStorage so dismissal persists across page loads */
  id: string;
  message: string;
  linkHref?: string;
  linkLabel?: string;
  icon?: React.ReactNode;
};

export default function AnnouncementBanner({ id, message, linkHref, linkLabel, icon }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if the user hasn't dismissed this specific banner before
    try {
      if (!localStorage.getItem(`banner-dismissed-${id}`)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [id]);

  const dismiss = () => {
    try {
      localStorage.setItem(`banner-dismissed-${id}`, '1');
    } catch {
      /* private mode: dismiss for this visit only */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-spirit-deep relative isolate overflow-hidden font-sans text-white motion-safe:animate-fade">
      <div aria-hidden className="bg-dot-grid absolute inset-0 -z-10 opacity-20 [mask-image:linear-gradient(90deg,transparent,black,transparent)]" />
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-x-3 gap-y-1 py-2.5 pl-4 pr-12 text-sm max-sm:flex-wrap sm:px-12">
        <p className="flex items-center gap-2 font-medium leading-snug">
          {icon ? <span className="shrink-0 text-white/80 [&>svg]:size-4">{icon}</span> : null}
          {message}
        </p>
        {linkHref && linkLabel ? (
          <Link
            href={linkHref}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-spirit shadow-sm transition-colors hover:bg-spirit-50"
          >
            {linkLabel}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        ) : null}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

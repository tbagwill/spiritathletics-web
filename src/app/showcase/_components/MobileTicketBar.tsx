'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonStyles } from '@/components/ui/Button';
import { cn } from '@/components/ui/cn';

/**
 * Phone-only ticket bar. Hidden while any of the page's own ticket buttons (`[data-cta]`) is on screen,
 * and after the last one is scrolled past so it never covers the footer.
 */
export function MobileTicketBar({
  href,
  label,
  title,
  subtitle,
}: {
  href: string;
  label: string;
  title: string;
  subtitle: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const targets = [...document.querySelectorAll<HTMLElement>('[data-cta]')];
    if (targets.length === 0) {
      setVisible(true);
      return;
    }
    const last = targets[targets.length - 1];
    // A few rect reads per scroll is cheap, and unlike an observer it also catches big jumps (footer → top).
    const recompute = () => {
      const anyOnScreen = targets.some((t) => {
        const r = t.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight;
      });
      setVisible(!anyOnScreen && last.getBoundingClientRect().bottom > 0);
    };
    recompute();
    window.addEventListener('scroll', recompute, { passive: true });
    window.addEventListener('resize', recompute);
    return () => {
      window.removeEventListener('scroll', recompute);
      window.removeEventListener('resize', recompute);
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[max(env(safe-area-inset-bottom),12px)] transition-all duration-300 ease-out lg:hidden',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0',
      )}
    >
      <div className="bg-spirit-deep shadow-spirit mx-auto flex max-w-xl items-center justify-between gap-3 rounded-full py-2 pl-5 pr-2 text-white ring-1 ring-inset ring-white/15">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{title}</div>
          <div className="truncate text-xs text-white/70">{subtitle}</div>
        </div>
        <Link href={href} tabIndex={visible ? 0 : -1} className={buttonStyles({ variant: 'white' })}>
          {label}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

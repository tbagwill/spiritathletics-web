'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  FileText,
  Handshake,
  Info,
  LayoutDashboard,
  Mail,
  Menu,
  Phone,
  ShoppingBag,
  Sparkles,
  Trophy,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { buttonStyles } from '@/components/ui/Button';
import { cn } from '@/components/ui/cn';
import { SITE } from '@/lib/site';

type NavLink = { href: string; label: string; icon: LucideIcon; description?: string };

const PRIMARY: NavLink[] = [
  { href: '/programs', label: 'Programs', icon: Trophy },
  { href: '/showcase', label: 'Showcase', icon: Sparkles },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/shop', label: 'Shop', icon: ShoppingBag },
  { href: '/parent-portal', label: 'Parent Portal', icon: UserRound },
];

const ABOUT: NavLink[] = [
  { href: '/about', label: 'About us', icon: Info, description: 'Our story, mission and results' },
  { href: '/staff', label: 'Staff', icon: Users, description: 'Meet our coaches' },
  { href: '/forms', label: 'Forms', icon: FileText, description: 'Paperwork for athletes and families' },
  { href: '/sponsors', label: 'Sponsors', icon: Handshake, description: 'Partners who support our teams' },
  { href: '/contact', label: 'Contact', icon: Phone, description: 'Call, email or visit the gym' },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavBar() {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const aboutActive = ABOUT.some((l) => isActive(pathname, l.href));

  // Close menus after navigating.
  useEffect(() => {
    setOpen(false);
    const active = document.activeElement as HTMLElement | null;
    if (active && headerRef.current?.contains(active)) active.blur();
  }, [pathname]);

  // Mobile menu: lock page scroll, focus the close button, close on Escape.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 font-sans backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Link href="/" className="shrink-0 rounded-lg transition-opacity hover:opacity-90" aria-label="Spirit Athletics home">
          <Image
            src="/images/SpiritAthletics_Logo_WordMark-transparent.png"
            alt="Spirit Athletics"
            width={180}
            height={56}
            className="h-9 w-auto lg:h-10"
            priority
          />
        </Link>

        {/* Desktop */}
        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {PRIMARY.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? 'page' : undefined}
              className={cn(
                'rounded-full px-3 py-2 text-sm font-medium transition-colors xl:px-3.5',
                isActive(pathname, link.href)
                  ? 'bg-spirit-50 text-spirit'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="group relative">
            <Link
              href="/about"
              aria-haspopup="true"
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors xl:px-3.5',
                aboutActive ? 'bg-spirit-50 text-spirit' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              About
              <ChevronDown
                className="size-3.5 transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180"
                aria-hidden
              />
            </Link>
            <div className="invisible absolute right-0 top-full translate-y-1 pt-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="w-72 rounded-2xl bg-white p-1.5 shadow-soft-lg ring-1 ring-slate-200/70">
                {ABOUT.map(({ href, label, description, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50',
                      isActive(pathname, href) && 'bg-spirit-50/60',
                    )}
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-spirit-50 text-spirit">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">{label}</span>
                      <span className="block text-xs text-slate-500">{description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/dashboard"
            title="Coaches dashboard"
            aria-label="Coaches dashboard"
            className="flex size-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <LayoutDashboard className="size-[18px]" aria-hidden />
          </Link>
          <Link href="/book" className={buttonStyles({ size: 'sm', className: 'h-10 px-4' })}>
            Book online
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <Link href="/book" className={buttonStyles({ size: 'sm' })}>
            Book
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex size-10 items-center justify-center rounded-full text-slate-800 transition-colors hover:bg-slate-100"
          >
            <Menu className="size-6" aria-hidden />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
      </div>

      {/* Portaled: the header's backdrop blur would otherwise trap this fixed overlay inside the header. */}
      {open ? createPortal(
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[60] flex flex-col bg-white motion-safe:animate-fade lg:hidden"
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/70 px-4 sm:px-6">
            <Link href="/" onClick={() => setOpen(false)} aria-label="Spirit Athletics home">
              <Image
                src="/images/SpiritAthletics_Logo_WordMark-transparent.png"
                alt="Spirit Athletics"
                width={180}
                height={56}
                className="h-9 w-auto"
              />
            </Link>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="flex size-10 items-center justify-center rounded-full text-slate-800 transition-colors hover:bg-slate-100"
            >
              <X className="size-6" aria-hidden />
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-4 sm:px-6">
            <nav aria-label="Main" className="motion-safe:animate-rise">
              <ul className="grid gap-1">
                {PRIMARY.map((link) => (
                  <MobileRow key={link.href} link={link} active={isActive(pathname, link.href)} onNavigate={() => setOpen(false)} />
                ))}
              </ul>
              <p className="mt-6 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">About</p>
              <ul className="mt-1 grid gap-1">
                {ABOUT.map((link) => (
                  <MobileRow key={link.href} link={link} active={isActive(pathname, link.href)} onNavigate={() => setOpen(false)} />
                ))}
              </ul>
            </nav>

            <div className="mt-8 grid gap-3 motion-safe:animate-rise" style={{ animationDelay: '80ms' }}>
              <Link
                href="/book"
                onClick={() => setOpen(false)}
                className={buttonStyles({ size: 'lg', className: 'w-full' })}
              >
                Book online
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <a href={SITE.phoneHref} className={buttonStyles({ variant: 'outline', className: 'w-full' })}>
                  <Phone className="size-4" aria-hidden />
                  Call
                </a>
                <a href={`mailto:${SITE.email}`} className={buttonStyles({ variant: 'outline', className: 'w-full' })}>
                  <Mail className="size-4" aria-hidden />
                  Email
                </a>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="mx-auto mt-2 inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <LayoutDashboard className="size-4" aria-hidden />
                Coaches dashboard
              </Link>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </header>
  );
}

function MobileRow({ link, active, onNavigate }: { link: NavLink; active: boolean; onNavigate: () => void }) {
  const Icon = link.icon;
  return (
    <li>
      <Link
        href={link.href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex min-h-12 items-center gap-3 rounded-2xl px-3 text-base font-medium transition-colors',
          active ? 'bg-spirit-50 text-spirit' : 'text-slate-800 hover:bg-slate-50',
        )}
      >
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-xl',
            active ? 'bg-spirit text-white' : 'bg-slate-100 text-slate-600',
          )}
        >
          <Icon className="size-[18px]" aria-hidden />
        </span>
        <span className="flex-1">{link.label}</span>
        <ArrowRight className="size-4 text-slate-300" aria-hidden />
      </Link>
    </li>
  );
}

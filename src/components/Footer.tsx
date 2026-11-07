import Image from 'next/image';
import Link from 'next/link';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { PROGRAMS } from '@/lib/programs';
import { SITE } from '@/lib/site';

const FAMILIES = [
  { href: '/book', label: 'Book online' },
  { href: '/showcase', label: 'Spirit Spectacular' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/parent-portal', label: 'Parent Portal' },
  { href: '/shop', label: 'Shop' },
  { href: '/forms', label: 'Forms' },
];

const COMPANY = [
  { href: '/about', label: 'About' },
  { href: '/staff', label: 'Staff' },
  { href: '/sponsors', label: 'Sponsors' },
  { href: '/contact', label: 'Contact' },
  { href: '/dashboard', label: 'Coaches dashboard' },
];

const linkClass = 'text-sm text-white/65 transition-colors hover:text-white';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-ink font-sans text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-48 -top-48 h-[380px] w-[620px] rounded-full bg-spirit opacity-30 blur-[130px]" />
        <div className="bg-dot-grid absolute inset-0 opacity-15 [mask-image:radial-gradient(ellipse_at_top_left,black_10%,transparent_55%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-spirit-400/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 sm:pt-16 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:gap-10">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" aria-label="Spirit Athletics home" className="inline-block">
              <Image
                src="/images/SpiritAthletics_Logo_WordMark-transparent.png"
                alt="Spirit Athletics"
                width={200}
                height={62}
                className="h-12 w-auto"
              />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">
              Competitive cheerleading programs for athletes of all levels, from non-competitive to Elite All-Star
              teams.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-1 text-xs font-medium text-white/70 ring-1 ring-inset ring-white/10">
              <span className="size-1.5 rounded-full bg-spirit-400" aria-hidden />
              Building champions since {SITE.founded}
            </p>
          </div>

          <FooterColumn title="Programs">
            {PROGRAMS.map((p) => (
              <li key={p.slug}>
                <Link href={`/programs/${p.slug}`} className={linkClass}>
                  {p.shortName}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/tryouts" className={linkClass}>
                Tryouts
              </Link>
            </li>
          </FooterColumn>

          <FooterColumn title="Families">
            {FAMILIES.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Visit</h3>
            <ul className="mt-4 grid gap-3 text-sm">
              <li>
                <a href={SITE.mapsHref} target="_blank" rel="noopener noreferrer" className="group flex gap-3 text-white/75 hover:text-white">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-spirit-400" aria-hidden />
                  <span>
                    {SITE.addressLine1}
                    <br />
                    {SITE.addressLine2}
                  </span>
                </a>
              </li>
              <li>
                <a href={SITE.phoneHref} className="flex items-center gap-3 text-white/75 hover:text-white">
                  <Phone className="size-4 shrink-0 text-spirit-400" aria-hidden />
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 break-all text-white/75 hover:text-white">
                  <Mail className="size-4 shrink-0 text-spirit-400" aria-hidden />
                  {SITE.email}
                </a>
              </li>
              <li className="flex gap-3 text-white/75">
                <Clock className="mt-0.5 size-4 shrink-0 text-spirit-400" aria-hidden />
                <span>
                  {SITE.hours.map((h) => (
                    <span key={h.days} className="block">
                      {h.days}: <span className="text-white/55">{h.time}</span>
                    </span>
                  ))}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/45">
            © {year} {SITE.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {COMPANY.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-xs text-white/55 transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">{title}</h3>
      <ul className="mt-4 grid gap-2.5">{children}</ul>
    </div>
  );
}

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Clock, Mail, MapPin, Navigation, Phone, type LucideIcon } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { CtaPanel, IconTile, SectionHeader, cardClass } from '@/components/site/blocks';
import { buttonStyles } from '@/components/ui/Button';
import { SITE, mailto } from '@/lib/site';

export const metadata = {
  title: 'Contact · Spirit Athletics',
  description: `Call ${SITE.phoneDisplay}, email us, or visit Spirit Athletics at ${SITE.addressLine1}, ${SITE.addressLine2}.`,
};

const TOPICS = [
  { subject: 'Program inquiry', hint: 'Which level fits my athlete?' },
  { subject: 'Tryout information', hint: 'Dates, clinics and what to bring' },
  { subject: 'Tumbling classes', hint: 'Class times and availability' },
  { subject: 'General question', hint: 'Anything else' },
];

export default function ContactPage() {
  return (
    <div className="bg-canvas font-sans text-slate-900">
      <PageHero
        eyebrow="Contact"
        title="Contact"
        accent="us"
        lead="We’re here to answer your questions and help your athlete begin their cheerleading journey."
        bottomSpace
      />

      {/* Ways to reach us */}
      <section aria-label="Ways to reach us" className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 sm:-mt-20 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <ContactCard icon={Phone} label="Call" href={SITE.phoneHref} action="Call now">
            {SITE.phoneDisplay}
          </ContactCard>
          <ContactCard icon={Mail} label="Email" href={mailto()} action="Send an email">
            <span className="break-all">{SITE.email}</span>
          </ContactCard>
          <ContactCard icon={MapPin} label="Visit" href={SITE.mapsHref} action="Get directions" external>
            {SITE.addressLine1}
            <br />
            {SITE.addressLine2}
          </ContactCard>
          <div className={cardClass(false, 'p-5 shadow-soft-lg sm:p-6')}>
            <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-spirit">
              <IconTile icon={Clock} size="sm" />
              Hours
            </div>
            <dl className="mt-4 grid gap-2 text-sm">
              {SITE.hours.map((h) => (
                <div key={h.days}>
                  <dt className="text-slate-500">{h.days}</dt>
                  <dd className="font-semibold text-slate-900">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Topics + map */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12">
        <div>
          <SectionHeader
            eyebrow="Send us a message"
            title="What can we help with?"
            lead="Pick a topic to start an email with the subject filled in. Including your athlete’s age and experience helps us answer faster."
          />
          <ul className="mt-8 grid gap-2">
            {TOPICS.map((t) => (
              <li key={t.subject}>
                <a
                  href={mailto(t.subject)}
                  className="group flex items-center gap-4 rounded-2xl bg-white px-4 py-3.5 shadow-soft ring-1 ring-slate-200/70 transition-all hover:-translate-y-0.5 hover:ring-spirit/40"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-spirit-50 text-spirit">
                    <Mail className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{t.subject}</span>
                    <span className="block text-sm text-slate-500">{t.hint}</span>
                  </span>
                  <ArrowUpRight
                    className="size-4 text-slate-300 transition-colors group-hover:text-spirit"
                    aria-hidden
                  />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-slate-500">
            Prefer to talk? Call{' '}
            <a href={SITE.phoneHref} className="font-semibold text-spirit hover:underline">
              {SITE.phoneDisplay}
            </a>{' '}
            during gym hours.
          </p>
        </div>

        <div>
          <div className="overflow-hidden rounded-3xl bg-slate-200 shadow-soft-lg ring-1 ring-slate-200/70">
            <iframe
              title="Map of Spirit Athletics"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3289.2890726019773!2d-117.28561611050291!3d34.47019032594623!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c366d835c487e9%3A0x37ac02ff68770de3!2s17537%20Bear%20Valley%20Rd%2C%20Hesperia%2C%20CA%2092345!5e0!3m2!1sen!2sus!4v1748380652807!5m2!1sen!2sus"
              className="block h-80 w-full border-0 sm:h-[440px]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={SITE.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles({ variant: 'outline', className: 'mt-4 w-full sm:w-auto' })}
          >
            <Navigation className="size-4" aria-hidden />
            Open in Google Maps
          </a>
        </div>
      </section>

      <CtaPanel
        title="Ready to get started?"
        body="Explore our programs or book a class to see how your athlete can join the Spirit Athletics family."
      >
        <Link href="/programs" className={buttonStyles({ variant: 'white', size: 'lg' })}>
          Explore programs
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link href="/book" className={buttonStyles({ variant: 'glass', size: 'lg' })}>
          Book a class
        </Link>
      </CtaPanel>
    </div>
  );
}

function ContactCard({
  icon,
  label,
  href,
  action,
  external,
  children,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  action: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cardClass(true, 'group flex flex-col p-5 shadow-soft-lg sm:p-6')}
    >
      <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-spirit">
        <IconTile icon={icon} size="sm" />
        {label}
      </div>
      <div className="mt-4 font-semibold leading-snug text-slate-900">{children}</div>
      <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-spirit">
        {action}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </a>
  );
}

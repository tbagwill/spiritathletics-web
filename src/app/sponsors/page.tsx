import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Heart, MapPin } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { CtaPanel, cardClass } from '@/components/site/blocks';
import { buttonStyles } from '@/components/ui/Button';
import { readSponsorsFromCsv } from '@/lib/sponsors';
import { mailto } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Sponsors · Spirit Athletics',
  description:
    'Thank you to our generous sponsors supporting Spirit Athletics athletes. Explore the list of businesses who have donated to our program.',
};

export default async function SponsorsPage() {
  const sponsors = await readSponsorsFromCsv();

  return (
    <div className="bg-canvas font-sans text-slate-900">
      <PageHero
        eyebrow="Thank you"
        title="Our"
        accent="sponsors"
        lead="We are grateful for the generous support of these businesses, who donated on behalf of our athletes."
      >
        <p className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3.5 py-2 text-sm text-white/85 ring-1 ring-inset ring-white/10">
          <Heart className="size-4 text-white/60" aria-hidden />
          {sponsors.length} local businesses supporting our athletes
        </p>
      </PageHero>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {sponsors.map((sponsor) => (
            <li key={`${sponsor.name}-${sponsor.city ?? 'nocity'}`} className={cardClass(false, 'p-5')}>
              <h2 className="font-semibold tracking-tight">{sponsor.name}</h2>
              {sponsor.city ? (
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="size-3.5 text-spirit" aria-hidden />
                  {sponsor.city}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <CtaPanel
        title="Interested in becoming a sponsor?"
        body="Contact us to learn about sponsorship opportunities and how your business can support our athletes."
      >
        <a href={mailto('Sponsorship opportunities')} className={buttonStyles({ variant: 'white', size: 'lg' })}>
          Ask about sponsoring
          <ArrowRight className="size-4" aria-hidden />
        </a>
        <Link href="/contact" className={buttonStyles({ variant: 'glass', size: 'lg' })}>
          Contact us
        </Link>
      </CtaPanel>
    </div>
  );
}

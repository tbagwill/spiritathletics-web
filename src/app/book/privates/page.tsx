import { Suspense } from 'react';
import { PageHero } from '@/components/site/PageHero';
import PrivateLessonsSection from '../components/PrivateLessonsSection';
import { BookingSwitch } from '../components/BookingSwitch';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Book a private lesson · Spirit Athletics',
  description: 'Book one-on-one or semi-private training with a Spirit Athletics coach.',
};

export default async function BookPrivatesPage() {
  return (
    <div className="min-h-screen bg-canvas font-sans text-slate-900">
      <PageHero
        crumbs={[
          { href: '/book', label: 'Book online' },
          { href: '/book/privates', label: 'Private lessons' },
        ]}
        title="Book a"
        accent="private lesson"
        lead="Personalized one-on-one or semi-private training, tailored to your athlete’s goals and skill level."
        bottomSpace
      >
        <BookingSwitch active="privates" />
      </PageHero>

      <div className="relative mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <div className="-mt-12 sm:-mt-16">
          <Suspense
            fallback={
              <div className="grid gap-4" aria-label="Loading private lesson options">
                <div className="skeleton h-64 rounded-3xl" />
                <div className="skeleton h-40 rounded-3xl" />
              </div>
            }
          >
            <PrivateLessonsSection />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

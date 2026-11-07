import { Suspense } from 'react';
import { generateOccurrencesNextWeeks } from '@/lib/classes';
import { PageHero } from '@/components/site/PageHero';
import ClassList from '../components/ClassList';
import ClinicsSection from '../components/ClinicsSection';
import { BookingSwitch } from '../components/BookingSwitch';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Book a class · Spirit Athletics',
  description: 'Reserve a spot in upcoming Spirit Athletics classes and clinics with secure online payment.',
};

async function ensureOccurrences() {
  try {
    await generateOccurrencesNextWeeks(8);
  } catch {
    // noop
  }
}

export default async function BookClassesPage() {
  await ensureOccurrences();
  return (
    <div className="min-h-screen bg-canvas font-sans text-slate-900">
      <PageHero
        crumbs={[
          { href: '/book', label: 'Book online' },
          { href: '/book/classes', label: 'Classes & clinics' },
        ]}
        title="Book a"
        accent="class"
        lead="Reserve your spot in upcoming classes and special events. Payment is processed securely online."
      >
        <BookingSwitch active="classes" />
      </PageHero>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Clinics section — loads via async server component */}
        <Suspense fallback={null}>
          <ClinicsSection />
        </Suspense>

        {/* Regular classes */}
        <section>
          <div className="mb-6">
            <p className="text-sm font-semibold text-spirit">Group classes</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Upcoming classes</h2>
            <p className="mt-1 text-sm text-slate-500">Every scheduled class in the next 2 weeks.</p>
          </div>

          <Suspense
            fallback={
              <div className="grid gap-4 md:grid-cols-2" aria-label="Loading classes">
                {[0, 1].map((i) => (
                  <div key={i} className="skeleton h-48 rounded-3xl" />
                ))}
              </div>
            }
          >
            <ClassList />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

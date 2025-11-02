import type { Metadata } from 'next';
import Link from 'next/link';
import { readSponsorsFromCsv } from '@/lib/sponsors';

export const metadata: Metadata = {
  title: 'Sponsors - Spirit Athletics',
  description:
    'Thank you to our generous sponsors supporting Spirit Athletics athletes. Explore the list of businesses who have donated to our program.',
};

export default async function SponsorsPage() {
  const sponsors = await readSponsorsFromCsv();

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-blue-100/30 p-6 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-900">Our Sponsors</h1>
            <p className="mt-3 text-base sm:text-lg text-gray-700">
              We are grateful for the generous support of these businesses who donated on behalf of our athletes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsors.map((sponsor) => (
            <div
              key={`${sponsor.name}-${sponsor.city ?? 'nocity'}`}
              className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-5 hover:border-blue-200"
            >
              <h3 className="text-lg font-semibold text-gray-800">{sponsor.name}</h3>
              <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full mt-3" />
              {sponsor.city && (
                <span className="inline-block mt-3 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                  {sponsor.city}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center text-sm text-gray-700">
          Interested in becoming a sponsor?{' '}
          <Link href="/contact" className="text-blue-700 hover:text-blue-800 underline underline-offset-4">
            Contact us
          </Link>{' '}
          to learn about sponsorship opportunities.
        </div>
      </div>
    </div>
  );
}



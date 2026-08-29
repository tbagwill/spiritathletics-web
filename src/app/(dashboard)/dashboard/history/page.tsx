import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import HistoryBoard from './HistoryBoard';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id || (session as any)?.user?.sub;
  const userRole = (session as any)?.user?.role as string | undefined;
  const coach = userId ? await prisma.coachProfile.findUnique({ where: { userId } }) : null;
  const isAdmin = userRole === 'ADMIN';

  if (!coach && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h1 className="text-xl font-semibold text-gray-900">Coach profile not found</h1>
          <p className="text-gray-600 mt-2">Unable to load history. Please contact support.</p>
          <Link href="/dashboard" className="inline-block mt-6 text-sm font-semibold text-blue-700">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">History</h1>
            <p className="text-sm text-gray-600 mt-1">
              {isAdmin
                ? 'Past privates, classes, and clinics for every coach. Filter by month or search by athlete.'
                : 'Your past private lessons and classes, plus gym-wide clinic registrations.'}
            </p>
          </div>
          <Link href="/dashboard" className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
            Back
          </Link>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <HistoryBoard isAdmin={isAdmin} />
      </div>
    </div>
  );
}

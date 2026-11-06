import { redirect } from 'next/navigation';
import { Ticket } from 'lucide-react';
import { getAdminUser } from '@/lib/adminAuth';
import { AdminTabs } from './_components/AdminTabs';

// Checked on the server so non-admins never receive the pages' data.
export default async function AdminEventsLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect('/dashboard-login');

  return (
    <div className="min-h-screen bg-canvas font-sans text-slate-900">
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="bg-spirit-gradient shadow-spirit flex size-9 items-center justify-center rounded-xl text-white">
              <Ticket className="size-4" aria-hidden />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Events admin</div>
              <div className="text-xs text-slate-500">Ticketing</div>
            </div>
          </div>
          <AdminTabs />
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}

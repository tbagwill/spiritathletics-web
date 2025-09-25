import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MonitoringDashboard from './MonitoringDashboard';

export default async function MonitoringPage() {
  const session = await getServerSession(authOptions);
  
  // Restrict to ADMIN only
  if (!session || !(session as any)?.user?.role || (session as any).user.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          <p className="mt-2 text-gray-600">
            Monitor application performance, errors, and system health in real-time.
          </p>
        </div>
        <MonitoringDashboard />
      </div>
    </div>
  );
}

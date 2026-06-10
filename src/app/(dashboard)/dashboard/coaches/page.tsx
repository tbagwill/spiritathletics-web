import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/adminAuth';
import CoachesManager from './CoachesManager';

export const dynamic = 'force-dynamic';

export default async function CoachesPage() {
  const admin = await getAdminUser();
  if (!admin) redirect('/dashboard');
  return <CoachesManager currentUserId={admin.id} />;
}

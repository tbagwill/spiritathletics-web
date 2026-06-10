import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Resolve the current session user and confirm they are an active ADMIN.
 * Returns the user record on success, or null otherwise.
 */
export async function getAdminUser() {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id || (session as any)?.user?.sub;
  const email = (session as any)?.user?.email as string | undefined;
  if (!userId && !email) return null;

  const user = await prisma.user.findUnique({
    where: userId ? { id: userId } : { email: email! },
  });

  if (!user || user.role !== 'ADMIN' || user.isActive === false) return null;
  return user;
}

/**
 * Throws if the current user is not an active admin. Use inside API routes.
 */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error('Admin access required');
  return user;
}

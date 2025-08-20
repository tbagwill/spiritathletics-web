import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function checkShopAdminAccess(): Promise<{
  hasAccess: boolean;
  userId?: string;
  coachId?: string;
  reason?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as any)?.user?.id) {
      return { hasAccess: false, reason: 'Not authenticated' };
    }

    const user = await prisma.user.findUnique({
      where: { id: (session as any).user.id },
      include: { 
        coachProfile: { 
          include: { settings: true } 
        } 
      }
    });

    if (!user) {
      return { hasAccess: false, reason: 'User not found' };
    }

    // Admin users always have shop access
    if (user.role === 'ADMIN') {
      return { 
        hasAccess: true, 
        userId: user.id,
        coachId: user.coachProfile?.id 
      };
    }

    // Coach users need explicit shop management permission
    if (user.role === 'COACH' && user.coachProfile?.settings?.canManageShop) {
      return { 
        hasAccess: true, 
        userId: user.id,
        coachId: user.coachProfile.id 
      };
    }

    return { 
      hasAccess: false, 
      reason: 'Insufficient permissions - shop admin access required' 
    };

  } catch (error) {
    console.error('Shop admin access check failed:', error);
    return { hasAccess: false, reason: 'Access check failed' };
  }
}

export async function requireShopAdminAccess() {
  const access = await checkShopAdminAccess();
  if (!access.hasAccess) {
    throw new Error(access.reason || 'Shop admin access required');
  }
  return access;
}

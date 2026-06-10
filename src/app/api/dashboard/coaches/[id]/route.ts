import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/adminAuth';
import { createAuditLog } from '@/lib/auditLog';
import { z } from 'zod';
import { hash } from 'bcryptjs';

export const dynamic = 'force-dynamic';

const UpdateSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  email: z.string().email().max(255).toLowerCase().trim().optional(),
  role: z.enum(['COACH', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  bio: z.string().max(2000).optional().nullable(),
  specialties: z.array(z.string().min(1).max(100)).max(20).optional(),
  canManageShop: z.boolean().optional(),
  newPassword: z.string().min(8).max(100).optional(),
});

async function countActiveAdmins(excludeUserId?: string) {
  return prisma.user.count({
    where: {
      role: 'ADMIN',
      isActive: true,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 });

  const { id } = await params;
  const json = await req.json();
  const parsed = UpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid input', issues: parsed.error.format() }, { status: 400 });
  }
  const data = parsed.data;

  const target = await prisma.user.findUnique({
    where: { id },
    include: { coachProfile: { include: { settings: true } } },
  });
  if (!target || (target.role !== 'COACH' && target.role !== 'ADMIN')) {
    return NextResponse.json({ ok: false, error: 'Coach not found' }, { status: 404 });
  }

  // Guard rails: protect against locking out the last admin and self-sabotage
  const isSelf = target.id === admin.id;
  const demoting = data.role === 'COACH' && target.role === 'ADMIN';
  const deactivating = data.isActive === false && target.isActive === true;

  if (isSelf && demoting) {
    return NextResponse.json({ ok: false, error: 'You cannot remove your own admin role' }, { status: 400 });
  }
  if (isSelf && deactivating) {
    return NextResponse.json({ ok: false, error: 'You cannot deactivate your own account' }, { status: 400 });
  }
  if ((demoting || deactivating) && target.role === 'ADMIN') {
    const remaining = await countActiveAdmins(target.id);
    if (remaining === 0) {
      return NextResponse.json({ ok: false, error: 'At least one active admin must remain' }, { status: 400 });
    }
  }

  // Check email uniqueness if changing
  if (data.email && data.email !== target.email) {
    const dupe = await prisma.user.findUnique({ where: { email: data.email } });
    if (dupe) return NextResponse.json({ ok: false, error: 'A user with that email already exists' }, { status: 409 });
  }

  // Build user-level updates
  const userData: Record<string, any> = {};
  if (data.name !== undefined) userData.name = data.name;
  if (data.email !== undefined) userData.email = data.email;
  if (data.role !== undefined) userData.role = data.role;
  if (data.isActive !== undefined) userData.isActive = data.isActive;
  if (data.newPassword) userData.passwordHash = await hash(data.newPassword, 10);

  await prisma.$transaction(async (tx) => {
    if (Object.keys(userData).length > 0) {
      await tx.user.update({ where: { id }, data: userData });
    }

    // Coach-profile-level updates (only if a profile exists)
    if (target.coachProfile) {
      const profileData: Record<string, any> = {};
      if (data.bio !== undefined) profileData.bio = data.bio;
      if (data.specialties !== undefined) profileData.specialties = data.specialties;
      if (data.isActive !== undefined) profileData.isActive = data.isActive;
      if (Object.keys(profileData).length > 0) {
        await tx.coachProfile.update({ where: { id: target.coachProfile.id }, data: profileData });
      }

      if (data.canManageShop !== undefined) {
        await tx.coachSettings.upsert({
          where: { coachId: target.coachProfile.id },
          update: { canManageShop: data.canManageShop },
          create: { coachId: target.coachProfile.id, canManageShop: data.canManageShop },
        });
      }
    }
  });

  await createAuditLog({
    actorUserId: admin.id,
    action: 'UPDATE_COACH',
    entity: 'User',
    entityId: id,
    meta: {
      changedFields: Object.keys({ ...data }),
      passwordChanged: !!data.newPassword,
    },
  });

  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}

/**
 * Soft-deactivate a coach (block login + hide from public), preserving history.
 */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 });

  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id }, include: { coachProfile: true } });
  if (!target || (target.role !== 'COACH' && target.role !== 'ADMIN')) {
    return NextResponse.json({ ok: false, error: 'Coach not found' }, { status: 404 });
  }

  if (target.id === admin.id) {
    return NextResponse.json({ ok: false, error: 'You cannot deactivate your own account' }, { status: 400 });
  }
  if (target.role === 'ADMIN') {
    const remaining = await countActiveAdmins(target.id);
    if (remaining === 0) {
      return NextResponse.json({ ok: false, error: 'At least one active admin must remain' }, { status: 400 });
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: { isActive: false } });
    if (target.coachProfile) {
      await tx.coachProfile.update({ where: { id: target.coachProfile.id }, data: { isActive: false } });
    }
  });

  await createAuditLog({
    actorUserId: admin.id,
    action: 'DEACTIVATE_COACH',
    entity: 'User',
    entityId: id,
    meta: { email: target.email },
  });

  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}

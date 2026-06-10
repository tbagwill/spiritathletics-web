import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminUser } from '@/lib/adminAuth';
import { createAuditLog } from '@/lib/auditLog';
import { z } from 'zod';
import { hash } from 'bcryptjs';

export const dynamic = 'force-dynamic';

const DEFAULT_PASSWORD = 'SpiritCoach123!';

const CreateSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().max(255).toLowerCase().trim(),
  role: z.enum(['COACH', 'ADMIN']).default('COACH'),
  bio: z.string().max(2000).optional().nullable(),
  specialties: z.array(z.string().min(1).max(100)).max(20).optional().default([]),
  canManageShop: z.boolean().optional().default(false),
});

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 });

  const users = await prisma.user.findMany({
    where: { role: { in: ['COACH', 'ADMIN'] } },
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      coachProfile: {
        select: {
          id: true,
          bio: true,
          specialties: true,
          isActive: true,
          settings: { select: { canManageShop: true } },
        },
      },
    },
  });

  const coaches = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    hasProfile: !!u.coachProfile,
    bio: u.coachProfile?.bio ?? null,
    specialties: u.coachProfile?.specialties ?? [],
    canManageShop: u.coachProfile?.settings?.canManageShop ?? false,
  }));

  return NextResponse.json({ ok: true, coaches }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 });

  const json = await req.json();
  const parsed = CreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid input', issues: parsed.error.format() }, { status: 400 });
  }
  const { name, email, role, bio, specialties, canManageShop } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ ok: false, error: 'A user with that email already exists' }, { status: 409 });
  }

  const passwordHash = await hash(DEFAULT_PASSWORD, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role,
      passwordHash,
      isActive: true,
      coachProfile: {
        create: {
          bio: bio ?? null,
          specialties: specialties ?? [],
          isActive: true,
          settings: {
            create: { canManageShop: canManageShop ?? false },
          },
        },
      },
    },
    include: { coachProfile: true },
  });

  await createAuditLog({
    actorUserId: admin.id,
    action: 'CREATE_COACH',
    entity: 'User',
    entityId: user.id,
    meta: { email, role },
  });

  return NextResponse.json({ ok: true, coachId: user.id }, { headers: { 'Cache-Control': 'no-store' } });
}

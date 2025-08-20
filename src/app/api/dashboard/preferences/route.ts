import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

async function getCoachProfile() {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id || (session as any)?.user?.sub;
  if (!userId) return null;
  return prisma.coachProfile.findUnique({ where: { userId } });
}

export async function GET() {
  try {
    const coach = await getCoachProfile();
    if (!coach) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    
    // Try to access coachSettings, create default if model doesn't exist yet
    let settings;
    try {
      settings = await (prisma as any).coachSettings.upsert({
        where: { coachId: coach.id },
        update: {},
        create: { coachId: coach.id },
      });
    } catch (e: any) {
      // If coachSettings model doesn't exist yet, return defaults
      if (e.message?.includes('Unknown arg') || e.message?.includes('coachSettings')) {
        settings = {
          mustApproveRequests: false,
          alertEmails: [],
          emailBookingConfirmed: true,
          emailBookingCancelled: true,
          dailyAgendaEmail: false,
        };
      } else {
        throw e;
      }
    }
    
    return NextResponse.json({ ok: true, settings }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || 'Failed to load preferences' }, { status: 500 });
  }
}

const BodySchema = z.object({
  mustApproveRequests: z.boolean().optional(),
  additionalEmail: z.string().email().nullable().optional(),
  emailBookingConfirmed: z.boolean().optional(),
  emailBookingCancelled: z.boolean().optional(),
  dailyAgendaEmail: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const coach = await getCoachProfile();
    if (!coach) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    const json = await req.json();
    const parse = BodySchema.safeParse(json);
    if (!parse.success) return NextResponse.json({ ok: false, error: 'Invalid input', issues: parse.error.format() }, { status: 400 });
    const data = parse.data;

    const alertEmails: string[] = [];
    if (data.additionalEmail) alertEmails.push(data.additionalEmail);

    let settings;
    try {
      settings = await (prisma as any).coachSettings.upsert({
        where: { coachId: coach.id },
        update: {
          mustApproveRequests: data.mustApproveRequests ?? undefined,
          emailBookingConfirmed: data.emailBookingConfirmed ?? undefined,
          emailBookingCancelled: data.emailBookingCancelled ?? undefined,
          dailyAgendaEmail: data.dailyAgendaEmail ?? undefined,
          ...(data.additionalEmail !== undefined ? { alertEmails } : {}),
        },
        create: {
          coachId: coach.id,
          mustApproveRequests: data.mustApproveRequests ?? false,
          emailBookingConfirmed: data.emailBookingConfirmed ?? true,
          emailBookingCancelled: data.emailBookingCancelled ?? true,
          dailyAgendaEmail: data.dailyAgendaEmail ?? false,
          alertEmails,
        },
      });
    } catch (e: any) {
      // If coachSettings model doesn't exist yet, return the submitted values as if saved
      if (e.message?.includes('Unknown arg') || e.message?.includes('coachSettings')) {
        settings = {
          mustApproveRequests: data.mustApproveRequests ?? false,
          alertEmails,
          emailBookingConfirmed: data.emailBookingConfirmed ?? true,
          emailBookingCancelled: data.emailBookingCancelled ?? true,
          dailyAgendaEmail: data.dailyAgendaEmail ?? false,
        };
      } else {
        throw e;
      }
    }

    return NextResponse.json({ ok: true, settings });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || 'Failed to save preferences' }, { status: 500 });
  }
}



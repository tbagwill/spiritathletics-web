import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimitHit } from '@/lib/rateLimit';

const WaiverSchema = z.object({
  athleteFirstName: z.string().min(1, 'Athlete first name is required').max(100).trim(),
  athleteLastName: z.string().min(1, 'Athlete last name is required').max(100).trim(),
  parentFirstName: z.string().min(1, 'Parent/guardian first name is required').max(100).trim(),
  parentLastName: z.string().min(1, 'Parent/guardian last name is required').max(100).trim(),
  parentEmail: z.string().email('Invalid email address').max(255).toLowerCase(),
  signatureDataUrl: z
    .string()
    .min(1, 'Signature is required')
    .refine((val) => val.startsWith('data:image/png;base64,'), {
      message: 'Invalid signature format',
    }),
  waiverVersion: z.string().default('1.0'),
});

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parse = WaiverSchema.safeParse(json);
  if (!parse.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parse.error.format() },
      { status: 400 }
    );
  }

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || null;
  const key = `waiver:${ip}:${parse.data.parentEmail}`;
  if (!rateLimitHit(key, 5, 60_000)) {
    return NextResponse.json(
      { error: 'Too many requests, please try again shortly.' },
      { status: 429 }
    );
  }

  const userAgent = req.headers.get('user-agent') || null;

  try {
    const { athleteFirstName, athleteLastName, parentFirstName, parentLastName, parentEmail, signatureDataUrl, waiverVersion } = parse.data;

    const waiver = await prisma.waiver.create({
      data: {
        athleteFirstName,
        athleteLastName,
        parentFirstName,
        parentLastName,
        parentEmail,
        signatureDataUrl,
        waiverVersion,
        ipAddress: ip,
        userAgent,
      },
    });

    return NextResponse.json({ ok: true, waiverId: waiver.id });
  } catch (e: unknown) {
    console.error('Waiver submission error:', e);
    return NextResponse.json(
      { error: 'Failed to save waiver. Please try again.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

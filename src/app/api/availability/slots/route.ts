import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAvailablePrivateSlots } from '@/lib/availability';

// Ensure fresh data on every request
export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  coachId: z.string(),
  date: z.string(), // yyyy-mm-dd
  duration: z.coerce.number(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parse = QuerySchema.safeParse({
    coachId: searchParams.get('coachId'),
    date: searchParams.get('date'),
    duration: searchParams.get('duration'),
  });
  if (!parse.success) {
    return NextResponse.json({ ok: false, error: 'Invalid query', issues: parse.error.format() }, { status: 400 });
  }
  
  try {
    const { coachId, date, duration } = parse.data;
    const localDate = new Date(date + 'T00:00:00');
    const slots = await getAvailablePrivateSlots({ coachId, localDate, durationMinutes: duration });
    
    // Add cache-control headers to prevent stale data
    const response = NextResponse.json({ ok: true, slots });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error: any) {
    console.error('Error fetching availability slots:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
} 
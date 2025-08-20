import { prisma } from '@/lib/prisma';
import { addMinutes, isBefore, startOfDay } from 'date-fns';
import { combineLocalDateAndMinutesPT, formatPt } from './time';

export const SLOT_MINUTES = 30;

export async function getAvailablePrivateSlots(params: {
  coachId: string;
  localDate: Date; // PT date
  durationMinutes: number;
}): Promise<{ startUTC: Date; endUTC: Date; display: string }[]> {
  const { coachId, localDate, durationMinutes } = params;
  // Fetch rules, exceptions, and confirmed bookings for that date
  const [rules, exceptions, bookings] = await Promise.all([
    prisma.availabilityRule.findMany({ where: { coachId } }),
    prisma.availabilityException.findMany({ where: { coachId, date: startOfDay(localDate) } }),
    prisma.booking.findMany({
      where: {
        coachId,
        status: 'CONFIRMED',
        // Get bookings that could potentially overlap with this day
        // Use a wider range to account for timezone differences
        startDateTimeUTC: { lte: addMinutes(combineLocalDateAndMinutesPT(localDate, 24 * 60 + 480), 0) }, // +8 hours buffer
        endDateTimeUTC: { gte: combineLocalDateAndMinutesPT(localDate, -480) }, // -8 hours buffer
      },
      select: { 
        startDateTimeUTC: true, 
        endDateTimeUTC: true,
        customerName: true, // for debugging
        athleteName: true, // for debugging
      },
    }),
  ]);

  // Build allowed windows from weekly rules
  const dayOfWeek = localDate.getDay();
  const allowedWindows: { startMin: number; endMin: number }[] = [];
  for (const r of rules) {
    if (r.ruleType !== 'WEEKLY') continue;
    // r.byDay like ["MO","WE"] per spec; map dayOfWeek to code
    const code = ['SU','MO','TU','WE','TH','FR','SA'][dayOfWeek];
    const inRange = (!r.effectiveFrom || isBefore(r.effectiveFrom, addMinutes(localDate, 24 * 60))) && (!r.effectiveTo || r.effectiveTo >= localDate);
    if (r.byDay.includes(code) && inRange) {
      allowedWindows.push({ startMin: r.startTimeMinutes, endMin: r.endTimeMinutes });
    }
  }

  // Apply exceptions for that date
  for (const ex of exceptions) {
    if (ex.isAvailable === false) {
      // Block whole day
      allowedWindows.length = 0;
      break;
    }
    // If isAvailable true, we could extend availability; for simplicity, ignore unless later needed
  }

  // Generate slots with proper overlap checking
  const results: { startUTC: Date; endUTC: Date; display: string }[] = [];
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 Availability Debug for ${formatPt(combineLocalDateAndMinutesPT(localDate, 0), "EEE, MMM d")}`);
    console.log(`📅 Local Date: ${localDate.toISOString()}`);
    console.log(`⏱️  Duration: ${durationMinutes} minutes`);
    console.log(`📋 Found ${bookings.length} existing bookings:`);
    bookings.forEach((b, i) => {
      console.log(`  ${i + 1}. ${formatPt(b.startDateTimeUTC, "h:mm a")} - ${formatPt(b.endDateTimeUTC, "h:mm a")} (${b.customerName})`);
    });
    console.log(`🏠 Allowed windows: ${allowedWindows.map(w => `${Math.floor(w.startMin/60)}:${(w.startMin%60).toString().padStart(2,'0')}-${Math.floor(w.endMin/60)}:${(w.endMin%60).toString().padStart(2,'0')}`).join(', ')}`);
  }

  for (const w of allowedWindows) {
    // Make sure the lesson can fully fit within the availability window
    for (let m = w.startMin; m + durationMinutes <= w.endMin; m += SLOT_MINUTES) {
      const startUTC = combineLocalDateAndMinutesPT(localDate, m);
      const endUTC = addMinutes(startUTC, durationMinutes);
      
      // Check if this proposed slot overlaps with any existing bookings
      const overlaps = bookings.some((b: { startDateTimeUTC: Date; endDateTimeUTC: Date; customerName?: string }) => {
        const doesOverlap = rangesOverlap(b.startDateTimeUTC, b.endDateTimeUTC, startUTC, endUTC);
        
        // Debug logging for overlaps
        if (process.env.NODE_ENV === 'development' && doesOverlap) {
          console.log(`❌ Slot ${formatPt(startUTC, "h:mm a")} - ${formatPt(endUTC, "h:mm a")} overlaps with booking ${formatPt(b.startDateTimeUTC, "h:mm a")} - ${formatPt(b.endDateTimeUTC, "h:mm a")} (${b.customerName})`);
        }
        
        return doesOverlap;
      });
      
      if (!overlaps) {
        results.push({ startUTC, endUTC, display: formatPt(startUTC, "EEE, MMM d • h:mm a") });
        
        // Debug logging for available slots
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Available slot: ${formatPt(startUTC, "h:mm a")} - ${formatPt(endUTC, "h:mm a")}`);
        }
      }
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Total available slots: ${results.length}`);
    console.log('---');
  }
  
  return results;
}

function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
} 
import { prisma } from '@/lib/prisma';
import { sendClassCoachAssignedEmail } from '@/lib/email';
import { classCoachNames } from '@/lib/classCoaches';

/**
 * Normalizes requested extra coaches: dedupes, drops the lead coach, and
 * keeps only active coaches with active accounts. Returns an error message
 * if any id isn't a usable coach.
 */
export async function resolveExtraCoachIds(requested: string[], leadCoachId: string | null) {
  const ids = Array.from(new Set(requested)).filter((id) => id !== leadCoachId);
  if (ids.length === 0) return { ids, error: null as string | null };
  const found = await prisma.coachProfile.findMany({
    where: { id: { in: ids }, isActive: true, user: { isActive: true } },
    select: { id: true },
  });
  if (found.length !== ids.length) {
    return { ids, error: 'One of the selected coaches is no longer active. Refresh and try again.' };
  }
  return { ids, error: null as string | null };
}

/** Booking-email recipients for every coach on a class, honouring each coach's settings. */
export async function classCoachEmailRecipients(classTemplateId: string, leadCoachId: string | null) {
  const extra = await prisma.classTemplateCoach.findMany({
    where: { classTemplateId },
    select: { coachId: true },
  });
  const coachIds = Array.from(new Set([leadCoachId, ...extra.map((e) => e.coachId)].filter((x): x is string => !!x)));
  if (coachIds.length === 0) return [];
  const coaches = await prisma.coachProfile.findMany({
    where: { id: { in: coachIds } },
    include: { user: { select: { email: true } }, settings: true },
  });
  const emails: string[] = [];
  for (const c of coaches) {
    if (c.settings?.emailBookingConfirmed === false) continue;
    emails.push(...[c.user.email, ...(c.settings?.alertEmails ?? [])].filter((e): e is string => !!e));
  }
  return Array.from(new Set(emails));
}

/** Emails each newly assigned coach and stamps notifiedAt. Never throws. */
export async function notifyAssignedCoaches(classTemplateId: string, coachIds: string[]) {
  if (coachIds.length === 0) return;
  try {
    const tpl = await prisma.classTemplate.findUnique({
      where: { id: classTemplateId },
      include: {
        service: { include: { coach: { include: { user: true } } } },
        coaches: { include: { coach: { include: { user: true, settings: true } } } },
      },
    });
    if (!tpl) return;
    const allNames = classCoachNames(tpl);
    for (const a of tpl.coaches.filter((c) => coachIds.includes(c.coachId))) {
      try {
        const to = [a.coach.user.email, ...(a.coach.settings?.alertEmails ?? [])].filter((e): e is string => !!e);
        if (to.length === 0) continue;
        await sendClassCoachAssignedEmail({
          to: Array.from(new Set(to)),
          coachName: a.coach.user.name ?? 'Coach',
          leadCoachName: tpl.service.coach?.user?.name ?? 'Spirit Athletics',
          allCoachNames: allNames,
          title: tpl.service.title,
          weekday: tpl.weekday,
          startTimeMinutes: tpl.startTimeMinutes,
          durationMinutes: tpl.service.durationMinutes ?? 60,
          capacity: tpl.capacity,
          location: tpl.location,
          startDate: tpl.startDate,
          endDate: tpl.endDate,
        });
        await prisma.classTemplateCoach.update({ where: { id: a.id }, data: { notifiedAt: new Date() } });
      } catch (err) {
        console.error(`Class coach assignment email failed (template ${classTemplateId}, coach ${a.coachId})`, err);
      }
    }
  } catch (err) {
    console.error(`Class coach assignment notify failed (template ${classTemplateId})`, err);
  }
}

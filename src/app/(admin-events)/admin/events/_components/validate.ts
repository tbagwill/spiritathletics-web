import { scheduleIssues, type ScheduleField } from '@/lib/eventSchedule';
import type { EventFormValues } from './types';

export type FormErrors = {
  fields: Partial<Record<'title' | 'slug' | 'heroImageUrl' | ScheduleField, string>>;
  tiers: Record<number, Partial<Record<'name' | 'earlyBirdPriceCents' | 'capacity', string>>>;
  /** Non-blocking heads-ups (likely mistakes that are still valid to save). */
  warnings: string[];
  count: number;
};

export function validateEventForm(v: EventFormValues, nowLocal: string): FormErrors {
  const fields: FormErrors['fields'] = {};
  const tiers: FormErrors['tiers'] = {};
  const warnings: string[] = [];

  if (!v.title.trim()) fields.title = 'Give the event a title.';
  if (!/^[a-z0-9-]+$/.test(v.slug)) fields.slug = 'Use lowercase letters, numbers, and hyphens only.';
  if (v.heroImageUrl.trim() && !/^https:\/\/\S+$/.test(v.heroImageUrl.trim())) {
    fields.heroImageUrl = 'Use a full https:// image link.';
  }

  for (const issue of scheduleIssues(v)) {
    if (!fields[issue.field]) fields[issue.field] = issue.message;
  }

  v.tiers.forEach((t, i) => {
    const e: FormErrors['tiers'][number] = {};
    if (!t.name.trim()) e.name = 'Name this tier.';
    if (t.earlyBirdPriceCents > t.doorPriceCents) e.earlyBirdPriceCents = 'Early Bird can’t cost more than the door price.';
    if (t.capacity != null && t.capacity < t.sold) e.capacity = `${t.sold} already sold; capacity can’t go lower.`;
    if (Object.keys(e).length) tiers[i] = e;
  });

  if (v.startDateTime && v.salesOpenAt && v.startDateTime < v.salesOpenAt) {
    warnings.push('The show starts before online sales open. Double-check the show date.');
  }
  if (v.status === 'ACTIVE' && v.startDateTime && v.startDateTime < nowLocal) {
    warnings.push('This event is Active but its start time is in the past.');
  }
  if (!v.tiers.some((t) => t.showOnline)) {
    warnings.push('No tiers are shown online, so nothing can be bought on the website.');
  } else if (!v.tiers.some((t) => t.showOnline && t.earlyBirdEnabled)) {
    warnings.push('No online tier has Early Bird on. Online sales will open at the door-sales time.');
  }

  const count = Object.keys(fields).length + Object.values(tiers).reduce((n, e) => n + Object.keys(e).length, 0);
  return { fields, tiers, warnings, count };
}

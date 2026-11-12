// Shared class staffing rules. Imported by the class editor (client) and the
// class template API (server) so both always agree. No server-only imports here.

/** Hard rule: a class can't have more athletes than this per coach. */
export const MAX_ATHLETES_PER_COACH = 10;
/** Soft guidance shown to staff; never blocks saving. */
export const RECOMMENDED_ATHLETES_PER_COACH = 8;
export const MIN_CLASS_CAPACITY = 3;
/** Extra coaches a class can have on top of the lead coach. */
export const MAX_EXTRA_COACHES = 9;

export function maxCapacityFor(coachCount: number) {
  return Math.max(1, coachCount) * MAX_ATHLETES_PER_COACH;
}

export function minCoachesFor(capacity: number) {
  return Math.max(1, Math.ceil(capacity / MAX_ATHLETES_PER_COACH));
}

export function isOverRecommended(capacity: number, coachCount: number) {
  return capacity > Math.max(1, coachCount) * RECOMMENDED_ATHLETES_PER_COACH;
}

/** Staff-facing message when the class breaks the multi-coach rule, else null. */
export function coachRuleError(capacity: number, coachCount: number): string | null {
  const needed = minCoachesFor(capacity);
  if (coachCount >= needed) return null;
  return `A class with ${capacity} spots needs at least ${needed} coaches. Add a coach or lower the spots to ${maxCapacityFor(coachCount)}.`;
}

/** "Ana", "Ana & Ben", "Ana, Ben & Cal". */
export function joinNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

type NamedCoach = { id?: string; user?: { name: string | null } | null } | null | undefined;

/** Lead coach first, then assigned coaches, without duplicates or blanks. */
export function classCoachNames(template: {
  service: { coach?: NamedCoach };
  coaches?: { coach: NamedCoach }[];
}): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  const add = (c: NamedCoach) => {
    const name = c?.user?.name?.trim();
    const key = c?.id ?? name;
    if (!name || !key || seen.has(key)) return;
    seen.add(key);
    names.push(name);
  };
  add(template.service.coach);
  for (const a of template.coaches ?? []) add(a.coach);
  return names;
}

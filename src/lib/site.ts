/** Gym contact details shown in the footer, Contact page and calls to action. Change them here only. */
export const SITE = {
  name: 'Spirit Athletics',
  phoneDisplay: '(760) 947-7130',
  phoneHref: 'tel:+17609477130',
  email: 'hdcspirit@aol.com',
  addressLine1: '17537 Bear Valley Rd',
  addressLine2: 'Hesperia, CA 92345',
  mapsHref:
    'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('17537 Bear Valley Rd, Hesperia, CA 92345'),
  hours: [
    { days: 'Monday – Thursday', time: '4:00 – 8:30 PM' },
    { days: 'Friday – Sunday', time: 'Closed' },
  ],
  portalHref: 'https://portal.iclasspro.com/spiritathletics7750/dashboard',
  founded: 1998,
} as const;

export function mailto(subject?: string) {
  return subject ? `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}` : `mailto:${SITE.email}`;
}

/** Headline results, shared by the home and About pages. */
export const ACHIEVEMENT_STATS = [
  { value: '100+', label: 'Regional championships' },
  { value: '40+', label: 'State championships' },
  { value: '5', label: 'National titles' },
  { value: '1,000+', label: 'Athletes trained' },
] as const;

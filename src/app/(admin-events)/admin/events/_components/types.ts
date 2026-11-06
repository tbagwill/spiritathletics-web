export type TierCode = 'STANDARD' | 'SENIOR_CHILD' | 'VIP';
export type EventStatusValue = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'COMPLETED';

export type TierFormValue = {
  id?: string;
  tierCode: TierCode;
  name: string;
  description: string;
  earlyBirdPriceCents: number;
  doorPriceCents: number;
  capacity: number | null;
  showOnline: boolean;
  earlyBirdEnabled: boolean;
  sortOrder: number;
  sold: number;
};

/** Dates are Pacific wall-clock `yyyy-MM-ddTHH:mm`; '' means unset for optional ones. */
export type EventFormValues = {
  slug: string;
  title: string;
  description: string;
  venue: string;
  venueAddress: string;
  heroImageUrl: string;
  startDateTime: string;
  doorsOpen: string;
  endDateTime: string;
  salesOpenAt: string;
  earlyBirdEndsAt: string;
  doorSalesOpenAt: string;
  salesCloseAt: string;
  convenienceFeeCents: number;
  status: EventStatusValue;
  tiers: TierFormValue[];
};

export function newEventDefaults(): EventFormValues {
  return {
    slug: 'fall-2026',
    title: 'Spirit Spectacular Fall 2026',
    description: 'Our bi-annual showcase, bringing the entire spring floor for an even better experience.',
    venue: 'Granite Hills High School',
    venueAddress: '22900 Esaws Rd, Apple Valley, CA',
    heroImageUrl: '',
    startDateTime: '2026-11-08T13:00',
    doorsOpen: '2026-11-08T12:30',
    endDateTime: '2026-11-08T17:00',
    salesOpenAt: '2026-11-04T12:00',
    earlyBirdEndsAt: '2026-11-07T23:59',
    doorSalesOpenAt: '2026-11-08T08:00',
    salesCloseAt: '2026-11-08T16:00',
    convenienceFeeCents: 300,
    status: 'DRAFT',
    tiers: [
      {
        tierCode: 'STANDARD',
        name: 'Standard',
        description: 'General admission wristband.',
        earlyBirdPriceCents: 2000,
        doorPriceCents: 2500,
        capacity: null,
        showOnline: true,
        earlyBirdEnabled: true,
        sortOrder: 10,
        sold: 0,
      },
      {
        tierCode: 'SENIOR_CHILD',
        name: 'Senior / Child',
        description: 'Reduced price for seniors and children.',
        earlyBirdPriceCents: 1500,
        doorPriceCents: 2000,
        capacity: null,
        showOnline: true,
        earlyBirdEnabled: true,
        sortOrder: 20,
        sold: 0,
      },
      {
        tierCode: 'VIP',
        name: 'VIP',
        description: 'Early access to the event and vendors. Front row seating. Limited availability.',
        earlyBirdPriceCents: 4000,
        doorPriceCents: 4500,
        capacity: 40,
        showOnline: true,
        earlyBirdEnabled: true,
        sortOrder: 30,
        sold: 0,
      },
    ],
  };
}

export function toApiPayload(v: EventFormValues) {
  return {
    event: {
      slug: v.slug,
      title: v.title.trim(),
      description: v.description,
      venue: v.venue,
      venueAddress: v.venueAddress,
      heroImageUrl: v.heroImageUrl.trim() || null,
      startDateTime: v.startDateTime,
      doorsOpen: v.doorsOpen || null,
      endDateTime: v.endDateTime || null,
      salesOpenAt: v.salesOpenAt,
      earlyBirdEndsAt: v.earlyBirdEndsAt,
      doorSalesOpenAt: v.doorSalesOpenAt,
      salesCloseAt: v.salesCloseAt,
      convenienceFeeCents: v.convenienceFeeCents,
      status: v.status,
    },
    tiers: v.tiers.map((t) => ({
      id: t.id,
      tierCode: t.tierCode,
      name: t.name.trim(),
      description: t.description,
      earlyBirdPriceCents: t.earlyBirdPriceCents,
      doorPriceCents: t.doorPriceCents,
      capacity: t.capacity,
      showOnline: t.showOnline,
      earlyBirdEnabled: t.earlyBirdEnabled,
      sortOrder: t.sortOrder,
    })),
  };
}

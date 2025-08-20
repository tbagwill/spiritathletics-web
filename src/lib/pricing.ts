export type PrivateSelection =
  | { kind: 'SOLO'; duration: 30 }
  | { kind: 'SOLO'; duration: 45 }
  | { kind: 'SOLO'; duration: 60 }
  | { kind: 'SEMI_PRIVATE'; duration: 60 };

export function computePrivatePrice(selection: PrivateSelection): {
  priceCents: number;
  perAthletePriceCents?: number;
  numAthletes: number;
  privateKind: 'SOLO' | 'SEMI_PRIVATE';
  durationMinutes: number;
} {
  switch (selection.kind) {
    case 'SOLO': {
      if (selection.duration === 30) return { priceCents: 4000, numAthletes: 1, privateKind: 'SOLO', durationMinutes: 30 };
      if (selection.duration === 45) return { priceCents: 5000, numAthletes: 1, privateKind: 'SOLO', durationMinutes: 45 };
      if (selection.duration === 60) return { priceCents: 6000, numAthletes: 1, privateKind: 'SOLO', durationMinutes: 60 };
      throw new Error('Invalid SOLO duration');
    }
    case 'SEMI_PRIVATE': {
      if (selection.duration !== 60) throw new Error('Semi-private must be 60 minutes');
      return { priceCents: 7000, perAthletePriceCents: 3500, numAthletes: 2, privateKind: 'SEMI_PRIVATE', durationMinutes: 60 };
    }
  }
} 
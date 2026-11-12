/**
 * Fires simultaneous cash bookings at one class session or clinic to check that
 * capacity holds under a race. STAGING ONLY: it creates real bookings.
 *
 *   npx tsx scripts/test-overbooking.ts class  <occurrenceId> <serviceId> [requests=5] [baseUrl]
 *   npx tsx scripts/test-overbooking.ts clinic <clinicId>                [requests=5] [baseUrl]
 *
 * Expect exactly as many successes as there were spots left; the rest should fail
 * with "Only N spots remaining" / "This is now full." Cancel the test bookings in
 * the dashboard afterwards.
 */

const [, , kind, id, arg3, arg4, arg5] = process.argv;
const isClass = kind === 'class';
if ((kind !== 'class' && kind !== 'clinic') || !id || (isClass && !arg3)) {
  console.error('Usage: class <occurrenceId> <serviceId> [n] [baseUrl]  |  clinic <clinicId> [n] [baseUrl]');
  process.exit(1);
}
const serviceId = isClass ? arg3 : undefined;
const n = Number((isClass ? arg4 : arg3) ?? 5);
const baseUrl = ((isClass ? arg5 : arg4) ?? 'https://staging.spiritathletics.net').replace(/\/$/, '');

if (/^https:\/\/(www\.)?spiritathletics\.net/.test(baseUrl)) {
  console.error('Refusing to run against production.');
  process.exit(1);
}

async function one(i: number) {
  // Distinct per request (rate limit is per email). resend.dev test inbox: no real mail, no bounces.
  const email = `delivered+race-${Date.now()}-${i}@resend.dev`;
  const url = isClass ? `${baseUrl}/api/book/class` : `${baseUrl}/api/clinics/register`;
  const body = isClass
    ? { classOccurrenceId: id, serviceId, customerName: `Race Test ${i}`, customerEmail: email, athleteNames: [`Athlete ${i}`], paymentMethod: 'CASH' }
    : { clinicId: id, customerName: `Race Test ${i}`, customerEmail: email, athleteFirstNames: [`Athlete ${i}`] };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return { i, status: res.status, ok: !!data.ok, error: data.error as string | undefined };
}

(async () => {
  console.log(`Firing ${n} simultaneous ${kind} bookings at ${baseUrl} …`);
  const results = await Promise.all(Array.from({ length: n }, (_, i) => one(i + 1)));
  for (const r of results) console.log(`  #${r.i}: ${r.ok ? 'BOOKED' : `rejected (${r.status}) ${r.error ?? ''}`}`);
  console.log(`\n${results.filter((r) => r.ok).length} booked, ${results.filter((r) => !r.ok).length} rejected.`);
})();

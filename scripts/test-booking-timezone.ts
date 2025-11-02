import { fromZonedTime, toZonedTime, formatInTimeZone } from 'date-fns-tz';

const APP_TZ = 'America/Los_Angeles';

// Test with the actual booking date
const dateString = '2025-11-02'; // The date you selected
console.log('Testing with actual booking date:', dateString);
console.log('');

// Current (server local) way
const serverLocal = new Date(dateString + 'T00:00:00');
console.log('❌ Server Local (UTC assumed):');
console.log('  ISO:', serverLocal.toISOString());
console.log('  UTC Day:', ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][serverLocal.getUTCDay()], `(${serverLocal.getUTCDay()})`);
console.log('');

// PT way
const ptDate = fromZonedTime(dateString + ' 00:00:00', APP_TZ);
const ptLocal = toZonedTime(ptDate, APP_TZ);
console.log('✅ PT Timezone Aware:');
console.log('  ISO:', ptDate.toISOString());
console.log('  PT Day:', ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][ptLocal.getDay()], `(${ptLocal.getDay()})`);
console.log('  Formatted PT:', formatInTimeZone(ptDate, APP_TZ, "EEEE, MMMM d, yyyy 'at' h:mm a zzz"));
console.log('');

// Check what the bookings show
console.log('Your pending bookings show:');
console.log('  Start: 2025-11-01T23:30:00.000Z');
const bookingDate = new Date('2025-11-01T23:30:00.000Z');
console.log('  In PT:', formatInTimeZone(bookingDate, APP_TZ, "EEEE, MMMM d, yyyy 'at' h:mm a zzz"));
console.log('  PT Day:', ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][toZonedTime(bookingDate, APP_TZ).getDay()]);
console.log('');

// The issue: when user selects Nov 2 (Sunday), the API uses getDay()
const testDate = new Date('2025-11-02T00:00:00');
console.log('When date picker shows "2025-11-02" and creates Date object:');
console.log('  new Date("2025-11-02T00:00:00"):');
console.log('    ISO:', testDate.toISOString());
console.log('    getDay():', testDate.getDay(), ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][testDate.getDay()]);
console.log('  This is being used to match against availability rules!');


import { fromZonedTime, toZonedTime } from 'date-fns-tz';

const APP_TZ = 'America/Los_Angeles';

// Test the current implementation
const dateString = '2025-11-03'; // Sunday
console.log('Testing date string:', dateString);
console.log('');

// Current (wrong) way - creates date in server timezone
const wrongWay = new Date(dateString + 'T00:00:00');
console.log('❌ Current implementation (new Date(date + T00:00:00)):');
console.log('  Result:', wrongWay.toISOString());
console.log('  Day of week:', ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][wrongWay.getDay()]);
console.log('  getDay():', wrongWay.getDay());
console.log('');

// Correct way - interpret as PT midnight
const ptMidnight = fromZonedTime(dateString + ' 00:00:00', APP_TZ);
console.log('✅ Correct implementation (fromZonedTime):');
console.log('  Result:', ptMidnight.toISOString());
console.log('  PT representation:', toZonedTime(ptMidnight, APP_TZ).toString());

// Get day of week from PT perspective
const ptDate = toZonedTime(ptMidnight, APP_TZ);
console.log('  Day of week in PT:', ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][ptDate.getDay()]);
console.log('  getDay() in PT:', ptDate.getDay());


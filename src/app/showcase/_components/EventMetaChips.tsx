import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { formatPt } from '@/lib/time';

type Props = {
  startDateTimeUTC: Date;
  doorsOpenUTC: Date | null;
  venue: string | null;
};

const chipClass =
  'inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-1.5 text-[13px] text-white/85 ring-1 ring-inset ring-white/10 sm:px-3.5 sm:py-2 sm:text-sm';

export function EventMetaChips({ startDateTimeUTC, doorsOpenUTC, venue }: Props) {
  return (
    <ul className="flex flex-wrap gap-2">
      <li className={chipClass}>
        <CalendarDays className="size-4 text-white/60" aria-hidden />
        {/* Short date on phones so date and time fit on one row. */}
        <span className="sm:hidden">{formatPt(startDateTimeUTC, 'EEE, MMM d')}</span>
        <span className="hidden sm:inline">{formatPt(startDateTimeUTC, 'EEEE, MMMM d')}</span>
      </li>
      <li className={chipClass}>
        <Clock className="size-4 text-white/60" aria-hidden />
        {formatPt(startDateTimeUTC, "h:mm a 'PT'")}
        {doorsOpenUTC ? ` · Doors ${formatPt(doorsOpenUTC, 'h:mm a')}` : ''}
      </li>
      {venue ? (
        <li className={chipClass}>
          <MapPin className="size-4 text-white/60" aria-hidden />
          {venue}
        </li>
      ) : null}
    </ul>
  );
}

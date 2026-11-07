import Link from 'next/link';
import { UserRound, Users } from 'lucide-react';
import { cn } from '@/components/ui/cn';

const OPTIONS = [
  { key: 'classes', href: '/book/classes', label: 'Classes & clinics', icon: Users },
  { key: 'privates', href: '/book/privates', label: 'Private lessons', icon: UserRound },
] as const;

/** Segmented switch between the two booking flows, shown on the dark hero. */
export function BookingSwitch({ active }: { active: (typeof OPTIONS)[number]['key'] }) {
  return (
    <nav aria-label="Booking type" className="inline-flex rounded-full bg-white/10 p-1 ring-1 ring-inset ring-white/15 backdrop-blur">
      {OPTIONS.map(({ key, href, label, icon: Icon }) => (
        <Link
          key={key}
          href={href}
          aria-current={key === active ? 'page' : undefined}
          className={cn(
            'inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors sm:px-5',
            key === active ? 'bg-white text-spirit shadow-sm' : 'text-white/75 hover:bg-white/10 hover:text-white',
          )}
        >
          <Icon className="size-4" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}

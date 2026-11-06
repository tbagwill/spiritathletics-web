'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/ui/cn';

const TABS = [
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/events/new', label: 'New event' },
];

export function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex rounded-full bg-slate-100 p-1">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
            pathname === tab.href ? 'bg-spirit text-white shadow-spirit' : 'text-slate-500 hover:text-spirit',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { CtaPanel, SectionHeader, cardClass } from '@/components/site/blocks';
import { buttonStyles } from '@/components/ui/Button';
import { cn } from '@/components/ui/cn';

export const metadata = {
  title: 'Staff · Spirit Athletics',
  description: 'Meet the owners, coaches and front desk team at Spirit Athletics.',
};

type Member = { name: string; title: string };

const LEADERSHIP: Member[] = [
  { name: 'Patricia "Patti" Perniciaro', title: 'Head Coach, Owner' },
  { name: 'Julie Bagwill', title: 'Co-Owner' },
  { name: 'John Migaiolo', title: 'Program Director' },
];

const COACHES: Member[] = [
  { name: 'Candice Vargas', title: 'Senior Coach, Social Media' },
  { name: 'Tyler Bagwill', title: 'Senior Coach, Digital Media' },
  { name: 'Rhyan Chollier', title: 'Senior Coach' },
  { name: 'Bethany Snow', title: 'Senior Coach' },
  { name: 'Jessica Thomas', title: 'Senior Coach' },
  { name: 'Natalie Falzone', title: 'Senior Coach' },
  { name: 'Aniya Willis', title: 'Senior Coach' },
  { name: 'Aliszia Orland', title: 'Senior Coach' },
  { name: 'Olivia Hahn', title: 'Coach' },
  { name: 'Kimberly Gonzalez', title: 'Junior Coach' },
  { name: 'Isabelle Vargas', title: 'Junior Coach' },
];

const SUPPORT: Member[] = [{ name: 'Alejandra "Alli" Arreola', title: 'Front Desk' }];

/** "Patricia "Patti" Perniciaro" → "PP" */
function initials(name: string) {
  const words = name.replace(/"[^"]*"/g, ' ').split(/\s+/).filter(Boolean);
  return `${words[0]?.[0] ?? ''}${words.length > 1 ? words[words.length - 1][0] : ''}`.toUpperCase();
}

function Avatar({ name, size }: { name: string; size: 'lg' | 'md' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'bg-spirit-gradient shadow-spirit flex shrink-0 items-center justify-center rounded-full font-semibold tracking-wide text-white',
        size === 'lg' ? 'size-20 text-2xl' : 'size-12 text-base',
      )}
    >
      {initials(name)}
    </span>
  );
}

export default function StaffPage() {
  return (
    <div className="bg-canvas font-sans text-slate-900">
      <PageHero
        eyebrow="Our team"
        title="Our"
        accent="staff"
        lead="Meet the dedicated team of professionals who make Spirit Athletics a place where champions are made."
      />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHeader eyebrow="Leadership" title="The people behind the program." />
        <ul className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-3">
          {LEADERSHIP.map((m) => (
            <li key={m.name} className={cardClass(false, 'flex items-center gap-5 p-6 md:flex-col md:p-8 md:text-center')}>
              <Avatar name={m.name} size="lg" />
              <div>
                <h3 className="text-xl font-semibold tracking-tight">{m.name}</h3>
                <p className="mt-0.5 font-medium text-spirit">{m.title}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <SectionHeader eyebrow="Coaching staff" title="Coaches on the floor every day." />
        <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {COACHES.map((m) => (
            <li key={m.name} className={cardClass(false, 'flex items-center gap-4 p-4 sm:p-5')}>
              <Avatar name={m.name} size="md" />
              <div className="min-w-0">
                <h3 className="font-semibold tracking-tight">{m.name}</h3>
                <p className="text-sm text-slate-500">{m.title}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <SectionHeader eyebrow="Support staff" title="Your first hello at the gym." />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SUPPORT.map((m) => (
            <li key={m.name} className={cardClass(false, 'flex items-center gap-4 p-4 sm:p-5')}>
              <Avatar name={m.name} size="md" />
              <div className="min-w-0">
                <h3 className="font-semibold tracking-tight">{m.name}</h3>
                <p className="text-sm text-slate-500">{m.title}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <CtaPanel title="Train with our coaches." body="Book a private lesson or a group class with the Spirit Athletics staff.">
        <Link href="/book/privates" className={buttonStyles({ variant: 'white', size: 'lg' })}>
          Book a private lesson
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link href="/book/classes" className={buttonStyles({ variant: 'glass', size: 'lg' })}>
          Browse classes
        </Link>
      </CtaPanel>
    </div>
  );
}

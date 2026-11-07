import Link from 'next/link';
import { ArrowRight, Download, FileText, Info, Mail, PenLine, Phone, type LucideIcon } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { CtaPanel, IconTile, SectionHeader, cardClass } from '@/components/site/blocks';
import { Badge } from '@/components/ui/Badge';
import { buttonStyles } from '@/components/ui/Button';
import { SITE, mailto } from '@/lib/site';

export const metadata = {
  title: 'Forms · Spirit Athletics',
  description: 'Sign the Spirit Athletics liability waiver online and download season documents.',
};

type FormAction =
  | { kind: 'sign'; href: string }
  | { kind: 'download'; href: string }
  /** No file on the site yet: start an email to the front desk instead of a dead link. */
  | { kind: 'request'; subject: string };

type FormDoc = { name: string; description: string; required?: boolean; action: FormAction };

const CATEGORIES: { title: string; description: string; forms: FormDoc[] }[] = [
  {
    title: 'Required forms',
    description: 'These must be completed for every athlete.',
    forms: [
      {
        name: 'Liability waiver',
        description: 'Required for all participants before participation. Sign online in a couple of minutes.',
        required: true,
        action: { kind: 'sign', href: '/waiver' },
      },
      {
        name: 'Full registration form',
        description: 'Complete athlete registration, including all necessary information and program selection.',
        required: true,
        action: { kind: 'request', subject: 'Full registration form' },
      },
    ],
  },
  {
    title: 'Program information',
    description: 'Essential information for the 2026–27 season.',
    forms: [
      {
        name: 'Program information document',
        description:
          'Rules, conduct, programs, teams, and all high-level information for the 2026–27 season.',
        action: { kind: 'download', href: `/documents/${encodeURIComponent('Cheer Program Information_26-27.pdf')}` },
      },
    ],
  },
];

const WAIVER_STEPS = [
  { title: 'Read the waiver', body: 'Choose “Sign online” on the liability waiver and read through the agreement.' },
  { title: 'Fill in and sign', body: 'Enter the athlete’s name and parent or guardian details, then draw your signature.' },
  { title: 'Done', body: 'Your signed waiver is stored on file instantly. No printing, scanning, or emailing.' },
];

const ACTION_ICON: Record<FormAction['kind'], LucideIcon> = { sign: PenLine, download: Download, request: Mail };

export default function FormsPage() {
  return (
    <div className="bg-canvas font-sans text-slate-900">
      <PageHero
        eyebrow="Forms"
        title="Forms &"
        accent="documents"
        lead="Sign your waiver online and download important documents for enrollment and the season."
        bottomSpace
      >
        <Link href="/waiver" className={buttonStyles({ variant: 'white', size: 'lg' })}>
          <PenLine className="size-4" aria-hidden />
          Sign the waiver online
        </Link>
      </PageHero>

      {/* Notices */}
      <section aria-label="Before you start" className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 sm:-mt-20 sm:px-6">
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          <div className={cardClass(false, 'flex gap-4 p-5 shadow-soft-lg sm:p-6')}>
            <IconTile icon={Info} size="sm" tone="ink" />
            <div>
              <h2 className="font-semibold">Before practices and competitions</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                All required forms must be completed before your athlete can participate. Please make sure every detail
                is accurate and up to date.
              </p>
            </div>
          </div>
          <div className={cardClass(false, 'flex gap-4 p-5 shadow-soft-lg sm:p-6')}>
            <IconTile icon={PenLine} size="sm" />
            <div>
              <h2 className="font-semibold">Waivers are signed online</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                All liability waivers are{' '}
                <Link href="/waiver" className="font-semibold text-spirit hover:underline">
                  signed through our website
                </Link>
                . It’s quick, secure, and legally binding, and your signed waiver is stored on file.
              </p>
            </div>
          </div>
        </div>
      </section>

      {CATEGORIES.map((category) => (
        <section key={category.title} className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-20">
          <SectionHeader title={category.title} lead={category.description} />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {category.forms.map((form) => {
              const Icon = ACTION_ICON[form.action.kind];
              return (
                <div key={form.name} className={cardClass(false, 'flex flex-col p-6')}>
                  <div className="flex items-start justify-between gap-3">
                    <IconTile icon={FileText} />
                    {form.required ? <Badge tone="red">Required</Badge> : null}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">{form.name}</h3>
                  <p className="mb-6 mt-1.5 text-sm leading-relaxed text-slate-600">{form.description}</p>
                  {form.action.kind === 'sign' ? (
                    <Link href={form.action.href} className={buttonStyles({ className: 'mt-auto w-full' })}>
                      <Icon className="size-4" aria-hidden />
                      Sign online
                    </Link>
                  ) : form.action.kind === 'download' ? (
                    <a
                      href={form.action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonStyles({ className: 'mt-auto w-full' })}
                    >
                      <Icon className="size-4" aria-hidden />
                      Download PDF
                    </a>
                  ) : (
                    <a href={mailto(form.action.subject)} className={buttonStyles({ variant: 'outline', className: 'mt-auto w-full' })}>
                      <Icon className="size-4" aria-hidden />
                      Request from the front desk
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* Waiver steps */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHeader eyebrow="Liability waiver" title="How to sign your waiver." />
        <ol className="mt-8 grid gap-3 sm:gap-4 md:grid-cols-3">
          {WAIVER_STEPS.map((s, i) => (
            <li key={s.title} className={cardClass(false, 'p-5 sm:p-6')}>
              <span className="bg-spirit-gradient flex size-9 items-center justify-center rounded-full text-sm font-semibold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.body}</p>
            </li>
          ))}
        </ol>
        <Link href="/waiver" className={buttonStyles({ className: 'mt-6' })}>
          Sign the waiver now
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>

      <CtaPanel
        title="Need help with forms?"
        body="If you have questions about any form or need help completing one, we’re happy to help."
      >
        <a href={mailto('Forms help request')} className={buttonStyles({ variant: 'white', size: 'lg' })}>
          <Mail className="size-4" aria-hidden />
          Email for help
        </a>
        <a href={SITE.phoneHref} className={buttonStyles({ variant: 'glass', size: 'lg' })}>
          <Phone className="size-4" aria-hidden />
          {SITE.phoneDisplay}
        </a>
      </CtaPanel>
    </div>
  );
}

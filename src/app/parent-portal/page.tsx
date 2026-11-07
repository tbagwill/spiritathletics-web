import { ArrowUpRight, CreditCard, FileText, Mail, Phone, UserRound } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { CtaPanel, IconTile, SectionHeader, cardClass } from '@/components/site/blocks';
import { buttonStyles } from '@/components/ui/Button';
import { SITE, mailto } from '@/lib/site';

export const metadata = {
  title: 'Parent Portal · Spirit Athletics',
  description: 'Log in to the Spirit Athletics parent portal (iClassPro) for schedules, payments, documents and account updates.',
};

const FEATURES = [
  {
    icon: UserRound,
    title: 'Account management',
    body: 'Update contact information, emergency contacts, and athlete details all in one secure place.',
  },
  {
    icon: CreditCard,
    title: 'Payments & billing',
    body: 'Make secure online payments, view billing history, and set up automatic payment plans.',
  },
  {
    icon: FileText,
    title: 'Documents & forms',
    body: 'Access important documents, complete required forms, and download certificates and awards.',
  },
];

export default function ParentPortalPage() {
  return (
    <div className="bg-canvas font-sans text-slate-900">
      <PageHero
        eyebrow="Powered by iClassPro"
        title="Parent"
        accent="Portal"
        lead="Access your athlete’s information, schedules, payments, and more through our secure parent portal."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={SITE.portalHref}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles({ variant: 'white', size: 'lg' })}
          >
            Open Parent Portal
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
          <a href={mailto('Parent Portal Access Help')} className={buttonStyles({ variant: 'glass', size: 'lg' })}>
            Need help logging in?
          </a>
        </div>
      </PageHero>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHeader
          eyebrow="In the portal"
          title="Everything about your athlete’s account."
          lead="Log in to manage your athlete’s account, view schedules, make payments, and stay connected with Spirit Athletics."
        />
        <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon, title, body }) => (
            <div key={title} className={cardClass(false, 'flex gap-4 p-5 md:block md:p-6')}>
              <IconTile icon={icon} />
              <div>
                <h3 className="text-lg font-semibold tracking-tight md:mt-5">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 md:mt-1.5">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <SectionHeader eyebrow="Need help?" title="We’re here if you get stuck." />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className={cardClass(false, 'flex flex-col p-6 sm:p-7')}>
            <h3 className="text-xl font-semibold tracking-tight">First-time users</h3>
            <p className="mb-6 mt-2 leading-relaxed text-slate-600">
              New to the parent portal? You should have received login credentials by email when you enrolled. If you
              need help accessing your account, email us.
            </p>
            <a href={mailto('Parent Portal Access Help')} className={buttonStyles({ className: 'mt-auto self-start' })}>
              <Mail className="size-4" aria-hidden />
              Email for help
            </a>
          </div>
          <div className={cardClass(false, 'flex flex-col p-6 sm:p-7')}>
            <h3 className="text-xl font-semibold tracking-tight">Technical support</h3>
            <p className="mb-6 mt-2 leading-relaxed text-slate-600">
              Having trouble with the portal? Our team can help you navigate the system and resolve any issues.
            </p>
            <a href={SITE.phoneHref} className={buttonStyles({ variant: 'outline', className: 'mt-auto self-start' })}>
              <Phone className="size-4" aria-hidden />
              Call {SITE.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <CtaPanel
        title="Ready to access your portal?"
        body="Access schedules, make payments, and communicate with coaches all in one place."
      >
        <a
          href={SITE.portalHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonStyles({ variant: 'white', size: 'lg' })}
        >
          Log in to Parent Portal
          <ArrowUpRight className="size-4" aria-hidden />
        </a>
      </CtaPanel>
    </div>
  );
}

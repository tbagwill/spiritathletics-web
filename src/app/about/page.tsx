import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BookOpen,
  CircleCheck,
  Crown,
  Eye,
  Globe,
  Heart,
  HeartHandshake,
  Medal,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { CtaPanel, IconTile, SectionHeader, cardClass } from '@/components/site/blocks';
import { buttonStyles } from '@/components/ui/Button';
import { ACHIEVEMENT_STATS, SITE } from '@/lib/site';

export const metadata = {
  title: 'About · Spirit Athletics',
  description:
    'Spirit Athletics, formerly High Desert Cheer, has developed confident, skilled cheerleaders in Hesperia, CA since 1998.',
};

const VALUES = [
  { icon: Heart, title: 'Respect', body: 'For teammates, coaches, competitors, and ourselves.' },
  { icon: Users, title: 'Teamwork', body: 'Supporting each other to achieve common goals.' },
  { icon: Zap, title: 'Excellence', body: 'Striving for our personal best in everything we do.' },
  { icon: ShieldCheck, title: 'Integrity', body: 'Doing the right thing, even when no one is watching.' },
];

const APART = [
  {
    icon: BookOpen,
    title: 'Comprehensive programs',
    body: 'From recreational to elite competitive levels, we offer pathways for every athlete to grow and succeed.',
  },
  {
    icon: Users,
    title: 'Well-rounded staff',
    body: 'Our staff brings deep knowledge of the sport from decades of experience in the cheerleading industry.',
  },
  {
    icon: HeartHandshake,
    title: 'Family atmosphere',
    body: 'A supportive community where athletes, families, and coaches work together toward shared goals.',
  },
];

const ACHIEVEMENTS = [
  {
    icon: Star,
    title: 'Performance awards',
    subtitle: 'Outstanding performance recognition',
    body: 'Consistently recognized across competitions for exceptional athletic performances, difficulty, and execution that set Spirit teams apart from the field.',
  },
  {
    icon: Trophy,
    title: 'D2 Summit national titles',
    subtitle: 'The renowned D2 Summit',
    body: 'Spirit Athletics has claimed national titles at the prestigious D2 Summit, one of the most competitive and celebrated events in all-star cheerleading.',
  },
  {
    icon: Globe,
    title: 'Cheerleading Worlds finalist',
    subtitle: 'The Cheerleading Worlds, Orlando',
    body: 'Earned finalist placement at the Cheerleading Worlds, the pinnacle of the sport, competing against the best programs from around the globe.',
  },
  {
    icon: Medal,
    title: 'NCA & Cheersport champions',
    subtitle: 'National championship events',
    body: 'Championship titles at both NCA and Cheersport, two of the most distinguished national competitions in all-star cheer, reflect our consistency on the biggest stages.',
  },
  {
    icon: Crown,
    title: 'Dozens of Grand Champion titles',
    subtitle: 'Overall Grand Champion',
    body: 'Spirit Athletics teams have claimed the coveted Grand Champion title dozens of times across local and regional events, a testament to our depth and consistency.',
  },
  {
    icon: Award,
    title: 'Coach of the Year',
    subtitle: 'Regional recognition',
    body: 'Our head coach was honored with the Coach of the Year award for outstanding leadership and athlete development.',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-canvas font-sans text-slate-900">
      <PageHero
        eyebrow="About us"
        title="About"
        accent="Spirit Athletics"
        lead="Building champions through dedication, teamwork, and the pursuit of excellence in competitive cheerleading."
      />

      {/* Story */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeader eyebrow="Our story" title="From High Desert Cheer to Spirit Athletics." />
          <div className="mt-6 space-y-5 leading-relaxed text-slate-700">
            <p className="text-lg text-slate-800">
              Spirit Athletics represents the evolution of a dream that began as High Desert Cheer. Our journey has been
              one of growth, transformation, and an unwavering commitment to developing young athletes into confident,
              skilled cheerleaders.
            </p>
            <p>
              We’ve kept our commitment to excellence while expanding our programs, and built a reputation for
              developing not just skilled athletes, but confident, disciplined young people who carry these values into
              all areas of their lives.
            </p>
            <p>
              The move to Spirit Athletics marks not just a name change, but a renewed commitment to excellence,
              innovation, and the values that make our program special. We honor our past while embracing the future of
              competitive cheerleading.
            </p>
          </div>
        </div>

        <div className="relative isolate overflow-hidden rounded-[32px] bg-ink p-8 text-white shadow-2xl sm:p-10">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -left-20 -top-24 size-[320px] rounded-full bg-spirit opacity-60 blur-[90px]" />
            <div className="absolute -bottom-24 -right-16 size-[260px] rounded-full bg-[#4169E1] opacity-40 blur-[90px]" />
            <div className="bg-dot-grid absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_top_left,black_20%,transparent_65%)]" />
          </div>
          <Image
            src="/images/SpiritAthletics_Logo_WordMark-transparent.png"
            alt="Spirit Athletics"
            width={420}
            height={130}
            className="h-auto w-full max-w-xs"
          />
          <div className="mt-10 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-inset ring-white/10">
              <div className="text-3xl font-semibold tabular-nums tracking-tight">{SITE.founded}</div>
              <div className="mt-1 text-sm text-white/60">Building champions since</div>
            </div>
            <div className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-inset ring-white/10">
              <div className="text-3xl font-semibold tracking-tight">4</div>
              <div className="mt-1 text-sm text-white/60">Program levels</div>
            </div>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-white/60">
            <CircleCheck className="size-4 text-spirit-400" aria-hidden />
            Formerly High Desert Cheer
          </p>
        </div>
      </section>

      {/* Mission & vision */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <div className="grid gap-4 md:grid-cols-2">
          <div className={cardClass(false, 'p-6 sm:p-8')}>
            <IconTile icon={Target} size="lg" />
            <h2 className="mt-6 text-2xl font-semibold tracking-tight">Our mission</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              To provide a safe, supportive, and challenging environment where athletes can develop their cheerleading
              skills, build lasting friendships, and grow into confident, responsible young people who embody the
              spirit of teamwork and excellence.
            </p>
          </div>
          <div className={cardClass(false, 'p-6 sm:p-8')}>
            <IconTile icon={Eye} size="lg" tone="ink" />
            <h2 className="mt-6 text-2xl font-semibold tracking-tight">Our vision</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              To be the premier cheerleading organization in our region, known for developing exceptional athletes who
              compete with integrity, support each other unconditionally, and represent our program with pride both on
              and off the mat.
            </p>
          </div>
        </div>

        <div className={cardClass(false, 'mt-4 p-6 sm:p-8')}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Our core values</h2>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon, title, body }) => (
              <div key={title} className="flex gap-4 lg:block">
                <IconTile icon={icon} size="sm" />
                <div>
                  <dt className="font-semibold lg:mt-4">{title}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate-600">{body}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Achievements */}
      <section className="bg-spirit-deep relative isolate overflow-hidden text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-24 -top-24 size-[420px] rounded-full bg-[#4169E1] opacity-40 blur-[110px]" />
          <div className="bg-dot-grid absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_top_right,black_15%,transparent_60%)]" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionHeader
            onDark
            eyebrow="Our achievements"
            title="A legacy of excellence."
            lead="Built through dedication, hard work, and the pursuit of greatness."
          />
          <dl className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4">
            {ACHIEVEMENT_STATS.map((s) => (
              <div key={s.label} className="rounded-3xl bg-white/[0.08] p-5 ring-1 ring-inset ring-white/15 sm:p-6">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <div className="text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">{s.value}</div>
                  <div className="mt-1 text-sm text-white/65">{s.label}</div>
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ACHIEVEMENTS.map(({ icon, title, subtitle, body }) => (
              <div key={title} className="rounded-3xl bg-white p-5 text-slate-900 shadow-2xl sm:p-6">
                <div className="flex items-center gap-3">
                  <IconTile icon={icon} size="sm" />
                  <div>
                    <h3 className="font-semibold leading-tight">{title}</h3>
                    <p className="text-xs text-slate-500">{subtitle}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What sets us apart */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHeader eyebrow="What sets us apart" title="Why families choose Spirit." />
        <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3">
          {APART.map(({ icon, title, body }) => (
            <div key={title} className={cardClass(true, 'group flex gap-4 p-5 md:block md:p-6')}>
              <IconTile
                icon={icon}
                className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
              />
              <div>
                <h3 className="text-lg font-semibold tracking-tight md:mt-5">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 md:mt-1.5">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CtaPanel
        title="Ready to join the Spirit Athletics family?"
        body="Discover how we can help your athlete reach their full potential in a supportive, challenging environment."
      >
        <Link href="/programs" className={buttonStyles({ variant: 'white', size: 'lg' })}>
          View our programs
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link href="/contact" className={buttonStyles({ variant: 'glass', size: 'lg' })}>
          Schedule a tour
        </Link>
      </CtaPanel>
    </div>
  );
}

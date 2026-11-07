import { CircleCheck, Heart, HeartHandshake, Sparkles, Users, Zap } from 'lucide-react';
import { ProgramDetail } from '@/components/site/ProgramDetail';
import { IconTile, SectionHeader, cardClass } from '@/components/site/blocks';
import { getProgram } from '@/lib/programs';

const program = getProgram('non-competitive');

export const metadata = {
  title: 'Non-Competitive · Programs · Spirit Athletics',
  description: program.summary,
};

const CURRICULUM = [
  { icon: Zap, title: 'Basic tumbling', items: ['Forward rolls', 'Cartwheels', 'Handstands', 'Bridge kicks'] },
  { icon: Users, title: 'Fundamental stunts', items: ['Partner stunts', 'Basic lifts', 'Balance positions', 'Safe dismounts'] },
  { icon: Sparkles, title: 'Dance & movement', items: ['Basic dance steps', 'Rhythm & timing', 'Simple choreography', 'Performance skills'] },
  { icon: HeartHandshake, title: 'Team building', items: ['Cooperation skills', 'Following directions', 'Making friends', 'Confidence building'] },
];

const BENEFITS = [
  {
    title: 'Physical development',
    body: 'Improves coordination, balance, flexibility, and overall fitness in a fun, age-appropriate way.',
  },
  {
    title: 'Social skills',
    body: 'Develops teamwork, communication, and friendship-building skills in a supportive group setting.',
  },
  {
    title: 'Confidence building',
    body: 'Builds self-esteem through positive reinforcement and achievement of personal goals.',
  },
  {
    title: 'Foundation for the future',
    body: 'Provides a solid foundation for athletes who may want to continue in competitive cheerleading.',
  },
];

export default function NonCompetitiveProgram() {
  return (
    <ProgramDetail slug="non-competitive">
      {/* Curriculum */}
      <section className="bg-spirit-deep relative isolate overflow-hidden text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-24 -top-24 size-[420px] rounded-full bg-[#4169E1] opacity-40 blur-[110px]" />
          <div className="bg-dot-grid absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_top_right,black_15%,transparent_60%)]" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionHeader onDark eyebrow="Curriculum" title="What your athlete will learn." />
          <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {CURRICULUM.map(({ icon, title, items }) => (
              <div key={title} className="rounded-3xl bg-white p-5 text-slate-900 shadow-2xl sm:p-6">
                <IconTile icon={icon} />
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
                <ul className="mt-3 grid gap-1.5 text-sm text-slate-600">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="size-1.5 shrink-0 rounded-full bg-spirit" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-14">
        <div>
          <SectionHeader eyebrow="Benefits" title="More than cheer skills." />
          <dl className="mt-8 grid gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-spirit-50 text-spirit">
                  <CircleCheck className="size-4" aria-hidden />
                </span>
                <div>
                  <dt className="font-semibold">{b.title}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate-600">{b.body}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
        <div className={cardClass(false, 'relative overflow-hidden p-8 text-center sm:p-10 lg:mt-14')}>
          <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full bg-spirit/10 blur-3xl" />
          <IconTile icon={Heart} size="lg" className="mx-auto" />
          <h3 className="mt-6 text-2xl font-semibold tracking-tight">A fun-first approach</h3>
          <p className="mx-auto mt-3 max-w-sm leading-relaxed text-slate-600">
            Our program prioritizes enjoyment and positive experiences, ensuring that every athlete develops a love for
            the sport while learning valuable life skills.
          </p>
        </div>
      </section>
    </ProgramDetail>
  );
}

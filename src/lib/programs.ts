import type { LucideIcon } from 'lucide-react';
import { BadgeCheck, Heart, Trophy, Zap } from 'lucide-react';

export type ProgramSlug = 'non-competitive' | 'novice' | 'prep' | 'elite-all-star';

export type Program = {
  slug: ProgramSlug;
  level: number;
  name: string;
  shortName: string;
  tagline: string;
  /** One or two sentences for cards. */
  summary: string;
  /** Lead paragraph on the program's own page. */
  intro: string;
  overview: string[];
  ages: string;
  schedule: string;
  travel: string;
  competition: string;
  focus: string;
  highlights: string[];
  extraDetails?: { label: string; value: string }[];
  ctaTitle: string;
  icon: LucideIcon;
};

export const PROGRAMS: Program[] = [
  {
    slug: 'non-competitive',
    level: 1,
    name: 'Non-Competitive / Performance Teams',
    shortName: 'Non-Competitive',
    tagline: 'Building foundations',
    summary:
      'Perfect for beginners and young athletes looking to learn the fundamentals of cheerleading in a supportive, non-competitive environment.',
    intro:
      'The perfect starting point for athletes to discover the joy of cheerleading in a supportive, fun environment focused on learning fundamentals and building confidence.',
    overview: [
      'Our Non-Competitive/Performance Teams program is designed for athletes ages 4–16 who are new to cheerleading or prefer a non-competitive environment. This program focuses on creating a positive experience with the sport while building essential motor skills, coordination, and social development.',
      'In a nurturing, pressure-free environment, athletes learn the basic building blocks of cheerleading including simple tumbling movements, fundamental stunts, basic dance steps, and age-appropriate choreography. Our experienced coaches emphasize fun, safety, and personal growth over competition.',
      'The program culminates in fun showcase performances for families, giving athletes the opportunity to demonstrate their new skills and build confidence in front of a supportive audience. All events are held within 10 miles of our practice facility, requiring no travel for families. This positive experience often serves as a stepping stone for athletes who wish to continue their cheerleading journey in our competitive programs.',
    ],
    ages: 'Ages 4–16',
    schedule: 'Once per week',
    travel: 'None',
    competition: 'Showcase performances',
    focus: 'Fun & fundamentals',
    highlights: ['Basic tumbling skills', 'Fundamental stunts', 'Dance and choreography', 'Team building'],
    extraDetails: [
      { label: 'Session length', value: '45–60 minutes' },
      { label: 'Class size', value: '8–12 athletes' },
    ],
    ctaTitle: 'Ready to start your athlete’s cheerleading journey?',
    icon: Heart,
  },
  {
    slug: 'novice',
    level: 2,
    name: 'Novice',
    shortName: 'Novice',
    tagline: 'First steps to competition',
    summary:
      'An introduction to competitive cheerleading with basic skills development and local competition opportunities.',
    intro:
      'An introduction to competitive cheerleading with basic skills development and local competition opportunities. Travel is limited to local events only, keeping families close to home.',
    overview: [
      'Our Novice program is designed for athletes ages 4–14 who are ready to take their first steps into competitive cheerleading. This program bridges the gap between recreational and competitive cheer, providing a supportive introduction to the world of competition.',
      'Athletes in this program will learn fundamental competitive skills while building confidence and teamwork abilities. The focus is on skill development, proper technique, and creating a positive competitive experience that sets the foundation for future growth in the sport.',
    ],
    ages: 'Ages 4–14',
    schedule: 'Once per week',
    travel: 'Local only',
    competition: 'Local',
    focus: 'Skill building',
    highlights: ['Competition preparation', 'Skill progression', 'Team routines', 'Local competitions'],
    ctaTitle: 'Ready to start your competitive journey?',
    icon: Zap,
  },
  {
    slug: 'prep',
    level: 3,
    name: 'Prep',
    shortName: 'Prep',
    tagline: 'Competitive excellence',
    summary:
      'Beginner/intermediate level competitive program focusing on skill advancement and regional competition participation.',
    intro:
      'Beginner/intermediate level competitive program focusing on skill advancement and regional competition participation. Limited travel required for competitions within the region.',
    overview: [
      'Our Prep program is designed for athletes ages 5–18 who are ready to take their competitive cheerleading to the next level. This intermediate program focuses on advanced skill development and regional competition participation.',
      'Athletes in this program will develop more complex tumbling and stunting skills while learning advanced choreography and performance techniques. The emphasis is on competitive excellence, teamwork, and preparing for higher levels of competition.',
    ],
    ages: 'Ages 5–18',
    schedule: '1–2× per week',
    travel: 'Limited (regional)',
    competition: 'Regional',
    focus: 'Beginner/intermediate skills',
    highlights: ['Beginner/intermediate tumbling', 'Complex stunting', 'Regional competitions', 'Performance excellence'],
    ctaTitle: 'Ready to excel in competition?',
    icon: BadgeCheck,
  },
  {
    slug: 'elite-all-star',
    level: 4,
    name: 'Elite All-Star',
    shortName: 'Elite All-Star',
    tagline: 'Championship level',
    summary:
      'Our premier competitive program for advanced athletes seeking to compete at the highest levels including nationals.',
    intro:
      'Our premier competitive program featuring advanced-level training and competition for elite athletes seeking to compete at the highest levels including nationals. Full travel required, including events on the East Coast.',
    overview: [
      'Our Elite All-Star program represents the pinnacle of competitive cheerleading at Spirit Athletics. Designed for athletes ages 5–18 who are committed to excellence, this program prepares athletes for the highest levels of competition including regional, state, and national championships.',
      'Athletes in this program master elite-level tumbling, advanced stunting sequences, and complex choreography while developing the mental toughness and teamwork required for championship-level competition. This program demands dedication, skill, and a commitment to excellence.',
    ],
    ages: 'Ages 5–18',
    schedule: '2–3× per week',
    travel: 'Full travel, incl. East Coast',
    competition: 'National',
    focus: 'Advanced performance',
    highlights: ['Advanced-level skills', 'National competitions', 'Elite choreography', 'Championship training'],
    ctaTitle: 'Ready to compete at the elite level?',
    icon: Trophy,
  },
];

export function getProgram(slug: ProgramSlug): Program {
  const program = PROGRAMS.find((p) => p.slug === slug);
  if (!program) throw new Error(`Unknown program ${slug}`);
  return program;
}

export const PROGRAM_PRICING_NOTE =
  'We’re finalizing pricing for the upcoming season and will post it as soon as it’s ready. Contact us for the most current details.';

export const NEXT_SEASON_NOTE =
  'Want to prepare for your next season? Contact us for information on tryouts and classes to get ready.';

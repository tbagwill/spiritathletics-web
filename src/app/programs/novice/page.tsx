import { ProgramDetail } from '@/components/site/ProgramDetail';
import { getProgram } from '@/lib/programs';

const program = getProgram('novice');

export const metadata = {
  title: 'Novice · Programs · Spirit Athletics',
  description: program.summary,
};

export default function NoviceProgram() {
  return <ProgramDetail slug="novice" />;
}

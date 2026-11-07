import { ProgramDetail } from '@/components/site/ProgramDetail';
import { getProgram } from '@/lib/programs';

const program = getProgram('prep');

export const metadata = {
  title: 'Prep · Programs · Spirit Athletics',
  description: program.summary,
};

export default function PrepProgram() {
  return <ProgramDetail slug="prep" />;
}

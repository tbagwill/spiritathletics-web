import { ProgramDetail } from '@/components/site/ProgramDetail';
import { getProgram } from '@/lib/programs';

const program = getProgram('elite-all-star');

export const metadata = {
  title: 'Elite All-Star · Programs · Spirit Athletics',
  description: program.summary,
};

export default function EliteAllStarProgram() {
  return <ProgramDetail slug="elite-all-star" />;
}

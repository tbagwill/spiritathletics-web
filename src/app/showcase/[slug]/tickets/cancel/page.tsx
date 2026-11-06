import Link from 'next/link';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { buttonStyles } from '@/components/ui/Button';
import { StatusCard } from '../../../_components/StatusCard';

export const metadata = { title: 'Checkout canceled · Spirit Athletics' };

export default async function TicketsCancelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <StatusCard
      icon={<CreditCard className="size-7" />}
      title="Checkout canceled"
      actions={
        <Link href={`/showcase/${slug}/tickets`} className={buttonStyles({ variant: 'primary' })}>
          <ArrowLeft className="size-4" aria-hidden />
          Back to tickets
        </Link>
      }
    >
      <p>No charge was made. Your selections weren’t saved, so pick your tickets again when you’re ready.</p>
    </StatusCard>
  );
}

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CircleX, MailCheck } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { ticketPagePath } from '@/lib/ticketing';
import { buttonStyles } from '@/components/ui/Button';
import { StatusCard } from '../../../_components/StatusCard';

export const metadata = { title: 'Your order · Spirit Athletics', robots: { index: false, follow: false } };

// The webhook usually lands within a second or two of Stripe's redirect; poll briefly.
const MAX_ATTEMPTS = 15;
const POLL_SECONDS = 2;

const support = (
  <a className="font-medium text-spirit underline-offset-2 hover:underline" href="mailto:frontdesk@spiritathletics.net">
    frontdesk@spiritathletics.net
  </a>
);

export default async function TicketsSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string; n?: string }>;
}) {
  const { slug } = await params;
  const { session_id, n } = await searchParams;
  if (!session_id || !session_id.startsWith('cs_') || session_id.length > 255) {
    redirect(`/showcase/${slug}/tickets`);
  }

  const order = await prisma.ticketOrder.findUnique({
    where: { stripeSessionId: session_id },
    select: { accessToken: true },
  });
  if (order) redirect(ticketPagePath(order.accessToken));

  const failed = await prisma.auditLog.findFirst({
    where: {
      action: 'TICKET_ORDER_FULFILLMENT_FAILED',
      meta: { path: ['stripeSessionId'], equals: session_id },
    },
    select: { id: true },
  });

  const attempt = Math.max(1, parseInt(n || '1', 10) || 1);
  const keepWaiting = !failed && attempt < MAX_ATTEMPTS;
  const nextUrl = `/showcase/${slug}/tickets/success?session_id=${encodeURIComponent(session_id)}&n=${attempt + 1}`;

  if (failed) {
    return (
      <StatusCard
        icon={<CircleX className="size-8" />}
        iconClassName="bg-red-50 text-red-600"
        title="We couldn’t complete your order"
        actions={
          <Link href={`/showcase/${slug}/tickets`} className={buttonStyles({ variant: 'dark' })}>
            Back to tickets
          </Link>
        }
      >
        <p>
          The tickets you picked sold out while you were checking out. Your payment has been refunded in full; it can take
          5–10 business days to appear on your statement.
        </p>
        <p>Questions? Email {support}.</p>
      </StatusCard>
    );
  }

  if (keepWaiting) {
    return (
      <>
        <meta httpEquiv="refresh" content={`${POLL_SECONDS};url=${nextUrl}`} />
        <StatusCard
          icon={
            <span className="relative flex size-16 items-center justify-center">
              <span className="absolute inset-0 rounded-full border-4 border-spirit-50" />
              <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-spirit" />
              <span className="size-3 rounded-full bg-spirit motion-safe:animate-pulse" />
            </span>
          }
          iconClassName="bg-transparent"
          title="Payment received"
        >
          <p>Getting your tickets ready. This only takes a moment…</p>
        </StatusCard>
      </>
    );
  }

  return (
    <StatusCard
      icon={<MailCheck className="size-8" />}
      title="Payment received"
      actions={
        <Link
          href={`/showcase/${slug}/tickets/success?session_id=${encodeURIComponent(session_id)}`}
          className={buttonStyles({ variant: 'primary' })}
        >
          Check again
        </Link>
      }
    >
      <p>Your tickets are still being finalized. They’ll arrive by email shortly with a link to your ticket page.</p>
      <p>
        Nothing after 10 minutes? Email {support} with reference{' '}
        <span className="font-mono text-sm text-slate-800">{session_id.slice(-10)}</span>.
      </p>
    </StatusCard>
  );
}

export const dynamic = 'force-dynamic';

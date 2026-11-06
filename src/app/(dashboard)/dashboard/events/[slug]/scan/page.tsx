import { notFound } from 'next/navigation';
import type { Metadata, Viewport } from 'next';
import { prisma } from '@/lib/prisma';
import { formatPt } from '@/lib/time';
import Scanner from './Scanner';

export const metadata: Metadata = { title: 'Scanner · Spirit Athletics' };

// Locks pinch-zoom and paints the browser chrome black so the scanner feels like an app.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
  viewportFit: 'cover',
};

export default async function ScannerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) notFound();

  return (
    <div className="h-[100dvh] bg-black">
      <Scanner
        slug={slug}
        title={event.title}
        subtitle={formatPt(event.startDateTimeUTC, "EEE, MMM d · h:mm a 'PT'")}
      />
    </div>
  );
}

export const dynamic = 'force-dynamic';

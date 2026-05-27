import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import jsPDF from 'jspdf';

async function requireCoachOrAdmin() {
  const session = await getServerSession(authOptions as any);
  const email = (session as any)?.user?.email as string | undefined;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || (user.role !== 'ADMIN' && user.role !== 'COACH')) return null;
  return user;
}

const WAIVER_TEXT = `I completely understand the above program for which I have let our child participate and in consideration for being permitted by the HIGH DESERT CHEER owners to participate with, I hereby waive, release, and discharge any and all claims for damages for personal injury, death, or property damage which I may have or which my child may have, or which may hereafter accrue to me or my child, as a result of participation in said activity. To the fullest extent possible, this waiver, release and discharge is meant to waive, release and discharge my child's liability with High Desert Cheer, LLC. This release is intended to discharge in advance the High Desert Cheer Teams (owner, staff, and agents) from any and all liability arising out of or connected in any way with my child's/my participation in said activity, even though that liability may arise out of negligence or carelessness on the part of the persons or entities mentioned above. It is understood that this activity involves an element of risk and danger of accidents knowing those risks I hereby assume those risks. It is further agreed that this waiver and release and assumption of risk is to be binding on my heirs and my child's and assigns. I agree to indemnify and to hold High Desert Cheer, LLC and its owners, staff and agents and my other related persons or entities free and harmless from any loss, liability, damage, cost, or expense which they may incur as the result of my death or my child's or any injury or property damage that my child/I may sustain while participating in said activity.`;

const PARENTAL_CONSENT_TEXT = `I HEREBY CONSENT THAT MY DAUGHTER/SON CAN PARTICIPATE IN PRACTICING IN THE HIGH DESERT CHEER, SPIRIT ATHLETICS FACILITY, AND HEREBY EXECUTE THE ABOVE AGREEMENT, WAIVER AND RELEASE ON HER/HIS BEHALF. I STATE THAT SAID MINOR IS PHYSICALLY ABLE TO PARTICIPATE IN SAID ACTIVITY. I HEREBY AGREE TO INDEMNIFY AND HOLD THE PERSONS AND ENTITIES MENTIONED ABOVE FREE AND HARMLESS FROM ANY LOSS, LIABILITY, DAMAGE, COST, OR EXPENSE WHICH THEY MAY INCUR AS A RESULT OF THE DEATH OR ANY INJURY OR PROPERTY DAMAGE THAT SAID MINOR MAY SUSTAIN WHILE PARTICIPATING AND/OR COMPETING IN SAID ACTIVITY.`;

const ACKNOWLEDGMENT_TEXT = `I HAVE CAREFULLY READ THIS AGREEMENT, WAIVER, AND RELEASE, AND FULLY UNDERSTAND ITS CONTENTS. I AM AWARE THAT THIS IS A RELEASE OF LIABILITY AND A CONTRACT BETWEEN MYSELF AND THE HIGH DESERT CHEER, LLC. STAFF AND OWNERS AND I SIGN THIS AGREEMENT OF MY OWN FREE WILL.`;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireCoachOrAdmin();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const waiver = await prisma.waiver.findUnique({ where: { id } });
  if (!waiver) {
    return NextResponse.json({ error: 'Waiver not found' }, { status: 404 });
  }

  const url = new URL(req.url);
  const format = url.searchParams.get('format');

  if (format === 'pdf') {
    return generatePdf(waiver);
  }

  return NextResponse.json({
    id: waiver.id,
    athleteFirstName: waiver.athleteFirstName,
    athleteLastName: waiver.athleteLastName,
    parentFirstName: waiver.parentFirstName,
    parentLastName: waiver.parentLastName,
    parentEmail: waiver.parentEmail,
    waiverVersion: waiver.waiverVersion,
    signedAt: waiver.signedAt,
    ipAddress: waiver.ipAddress,
    signatureDataUrl: waiver.signatureDataUrl,
  });
}

function generatePdf(waiver: {
  id: string;
  athleteFirstName: string;
  athleteLastName: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  signatureDataUrl: string;
  waiverVersion: string;
  signedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}) {
  const athleteFullName = `${waiver.athleteFirstName} ${waiver.athleteLastName}`;
  const parentFullName = `${waiver.parentFirstName} ${waiver.parentLastName}`;
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SPIRIT ATHLETICS | HIGH DESERT CHEER', pageWidth / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(11);
  doc.text('WAIVER AGREEMENT AND RELEASE FORM', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Waiver body
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const bodyLines = doc.splitTextToSize(WAIVER_TEXT, contentWidth);
  doc.text(bodyLines, margin, y);
  y += bodyLines.length * 3.5 + 6;

  // Parental consent
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Parental Consent:', margin, y);
  y += 4;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('(To be completed and signed by a parent/guardian if applicant is under 18 years of age)', margin, y);
  y += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const consentLines = doc.splitTextToSize(PARENTAL_CONSENT_TEXT, contentWidth);
  doc.text(consentLines, margin, y);
  y += consentLines.length * 3.2 + 6;

  // Acknowledgment
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const ackLines = doc.splitTextToSize(ACKNOWLEDGMENT_TEXT, contentWidth);
  doc.text(ackLines, margin, y);
  y += ackLines.length * 3.2 + 10;

  // Signature block
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);

  // Signature image
  try {
    doc.addImage(waiver.signatureDataUrl, 'PNG', margin, y, 60, 20);
  } catch {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('[Signature on file]', margin, y + 10);
  }
  doc.line(margin, y + 22, margin + 70, y + 22);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('SIGNATURE (PARENT/GUARDIAN)', margin, y + 26);

  // Parent name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(parentFullName, margin + 80, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.line(margin + 80, y + 22, pageWidth - margin, y + 22);
  doc.setFontSize(8);
  doc.text('PARENT/GUARDIAN NAME (PRINTED)', margin + 80, y + 26);
  y += 34;

  // Athlete name and date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(athleteFullName, margin, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.line(margin, y + 6, margin + 80, y + 6);
  doc.setFontSize(8);
  doc.text("ATHLETE'S NAME (PRINTED)", margin, y + 10);

  const signedDate = new Date(waiver.signedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(signedDate, margin + 100, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.line(margin + 100, y + 6, pageWidth - margin, y + 6);
  doc.setFontSize(8);
  doc.text('DATE', margin + 100, y + 10);
  y += 18;

  // Digital record footer
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text(`Electronically signed under the ESIGN Act | Waiver Version: ${waiver.waiverVersion}`, margin, y);
  y += 3.5;
  doc.text(`Signed: ${waiver.signedAt.toISOString()} | IP: ${waiver.ipAddress || 'N/A'} | Record ID: ${waiver.id}`, margin, y);

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  const filename = `waiver-${athleteFullName.replace(/\s+/g, '-').toLowerCase()}-${waiver.id.slice(-6)}.pdf`;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

export const dynamic = 'force-dynamic';

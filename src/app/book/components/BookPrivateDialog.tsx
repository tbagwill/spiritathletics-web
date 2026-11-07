'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CalendarDays, Clock } from 'lucide-react';
import { CARD_FEE_CENTS } from '@/lib/pricing';
import { formatPt } from '@/lib/time';
import { Field, FormAlert, Input } from '@/components/ui/Field';
import { Sheet, SheetMeta } from '@/components/ui/Sheet';
import { BookingFooter, EMAIL_PATTERN, PaymentChoice, type PaymentMethod } from './BookingFormParts';

export type PrivateSelection =
  | { kind: 'SOLO'; duration: 30 }
  | { kind: 'SOLO'; duration: 45 }
  | { kind: 'SOLO'; duration: 60 }
  | { kind: 'SEMI_PRIVATE'; duration: 60 };

type Props = {
  coachId: string;
  serviceId: string;
  coachName?: string;
  selection: PrivateSelection;
  startUTC: string;
  endUTC: string;
  priceCents?: number;
  onClose: () => void;
  onSuccess?: (requiresApproval?: boolean) => void;
};

type FormValues = {
  customerName: string;
  customerEmail: string;
  athleteName: string;
};

const PRICE_MAP: Record<string, Record<number, number>> = {
  SOLO: { 30: 4000, 45: 5000, 60: 6000 },
  SEMI_PRIVATE: { 60: 7000 },
};

export default function BookPrivateDialog({ coachId, serviceId, coachName, selection, startUTC, endUTC, priceCents, onClose }: Props) {
  const formId = 'book-private-form';
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const basePrice = priceCents ?? PRICE_MAP[selection.kind]?.[selection.duration] ?? 0;
  const cardTotalCents = basePrice + CARD_FEE_CENTS;
  const cashTotalCents = basePrice;
  const displayTotal = paymentMethod === 'CASH' ? cashTotalCents : cardTotalCents;

  const kindLabel = selection.kind === 'SEMI_PRIVATE' ? 'Semi-private · 60 min' : `Solo · ${selection.duration} min`;

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      if (paymentMethod === 'CASH') {
        const res = await fetch('/api/book/private', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coachId,
            serviceId,
            startDateTimeUTC: startUTC,
            endDateTimeUTC: endUTC,
            customerName: values.customerName,
            customerEmail: values.customerEmail,
            athleteName: values.athleteName,
            selection,
            paymentMethod: 'CASH',
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Booking failed');
        window.location.href = `/book/success?payment=cash`;
      } else {
        const res = await fetch('/api/book/private/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coachId,
            serviceId,
            startDateTimeUTC: startUTC,
            endDateTimeUTC: endUTC,
            customerName: values.customerName,
            customerEmail: values.customerEmail,
            athleteName: values.athleteName,
            selection,
          }),
        });

        if (res.status === 503) {
          throw new Error('Online payment is temporarily unavailable. Choose Pay at the gym or try again shortly.');
        }

        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Could not start checkout');
        window.location.href = data.url;
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setSubmitting(false);
    }
  };

  return (
    <Sheet
      open
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      eyebrow="Private lesson"
      title={coachName ? `With ${coachName}` : 'Book your lesson'}
      meta={
        <>
          <SheetMeta icon={<CalendarDays />}>{formatPt(new Date(startUTC), "EEE, MMM d 'at' h:mm a")}</SheetMeta>
          <SheetMeta icon={<Clock />}>{kindLabel}</SheetMeta>
        </>
      }
      footer={
        <BookingFooter
          formId={formId}
          totalCents={displayTotal}
          paymentMethod={paymentMethod}
          submitting={submitting}
          cashLabel="Book lesson"
        />
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6">
        <div className="grid gap-4">
          <Field label="Your name" hint="Parent or guardian" error={errors.customerName ? 'Enter your name.' : null}>
            {(id) => (
              <Input
                id={id}
                autoComplete="name"
                invalid={!!errors.customerName}
                {...register('customerName', { required: true, validate: (v) => v.trim().length > 0 })}
              />
            )}
          </Field>
          <Field label="Email" hint="Your confirmation is sent here." error={errors.customerEmail ? 'Enter a valid email.' : null}>
            {(id) => (
              <Input
                id={id}
                type="email"
                inputMode="email"
                autoComplete="email"
                invalid={!!errors.customerEmail}
                {...register('customerEmail', { required: true, pattern: EMAIL_PATTERN })}
              />
            )}
          </Field>
          <Field
            label={selection.kind === 'SEMI_PRIVATE' ? 'Athletes’ first names' : 'Athlete’s first name'}
            hint={selection.kind === 'SEMI_PRIVATE' ? 'Include both athletes.' : undefined}
            error={errors.athleteName ? 'Enter the athlete’s first name.' : null}
          >
            {(id) => (
              <Input
                id={id}
                autoComplete="off"
                invalid={!!errors.athleteName}
                {...register('athleteName', { required: true, validate: (v) => v.trim().length > 0 })}
              />
            )}
          </Field>
        </div>

        <PaymentChoice
          value={paymentMethod}
          onChange={setPaymentMethod}
          cardTotalCents={cardTotalCents}
          cashTotalCents={cashTotalCents}
          feeCents={CARD_FEE_CENTS}
        />

        {error ? <FormAlert>{error}</FormAlert> : null}
      </form>
    </Sheet>
  );
}

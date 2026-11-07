'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CalendarDays, CircleDollarSign, UserRound } from 'lucide-react';
import { CARD_FEE_CENTS } from '@/lib/pricing';
import { Button } from '@/components/ui/Button';
import { Field, FormAlert, Input } from '@/components/ui/Field';
import { Sheet, SheetMeta } from '@/components/ui/Sheet';
import { AthleteNames, BookingFooter, EMAIL_PATTERN, PaymentChoice, money, type PaymentMethod } from './BookingFormParts';

type Props = {
  occurrenceId: string;
  serviceId: string;
  title: string;
  startPtText: string;
  priceCents: number;
  coachName?: string | null;
  onSuccess?: () => void;
};

type FormValues = {
  customerName: string;
  customerEmail: string;
};

export default function BookClassDialog({ occurrenceId, serviceId, title, startPtText, priceCents, coachName }: Props) {
  const formId = `book-class-${occurrenceId}`;
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [athleteNames, setAthleteNames] = useState<string[]>(['']);
  const [athleteError, setAthleteError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  useEffect(() => {
    if (!open) {
      setError(null);
      setAthleteError(null);
      setPaymentMethod('CARD');
      setAthleteNames(['']);
    }
  }, [open]);

  const baseTotalCents = priceCents * athleteNames.length;
  const cardTotalCents = baseTotalCents + CARD_FEE_CENTS;
  const cashTotalCents = baseTotalCents;
  const displayTotal = paymentMethod === 'CASH' ? cashTotalCents : cardTotalCents;

  const onSubmit = async (values: FormValues) => {
    if (!athleteNames.every((n) => n.trim().length > 0)) {
      setAthleteError('Add a first name for each athlete.');
      return;
    }
    setAthleteError(null);
    setSubmitting(true);
    setError(null);
    const trimmedNames = athleteNames.map((n) => n.trim());
    try {
      if (paymentMethod === 'CASH') {
        const res = await fetch('/api/book/class', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classOccurrenceId: occurrenceId,
            serviceId,
            customerName: values.customerName,
            customerEmail: values.customerEmail,
            athleteNames: trimmedNames,
            paymentMethod: 'CASH',
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Booking failed');
        window.location.href = `/book/success?payment=cash`;
      } else {
        const res = await fetch('/api/book/class/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classOccurrenceId: occurrenceId,
            serviceId,
            customerName: values.customerName,
            customerEmail: values.customerEmail,
            athleteNames: trimmedNames,
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
    <>
      <Button onClick={() => setOpen(true)}>Reserve spot</Button>

      <Sheet
        open={open}
        onOpenChange={setOpen}
        eyebrow="Reserve a spot"
        title={title}
        meta={
          <>
            <SheetMeta icon={<CalendarDays />}>{startPtText}</SheetMeta>
            {coachName ? <SheetMeta icon={<UserRound />}>Coach {coachName}</SheetMeta> : null}
            <SheetMeta icon={<CircleDollarSign />}>{money(priceCents)} per athlete</SheetMeta>
          </>
        }
        footer={
          <BookingFooter
            formId={formId}
            totalCents={displayTotal}
            paymentMethod={paymentMethod}
            submitting={submitting}
            cashLabel="Reserve spot"
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
            <Field
              label="Email"
              hint="Your confirmation is sent here."
              error={errors.customerEmail ? 'Enter a valid email.' : null}
            >
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
            <AthleteNames names={athleteNames} onChange={setAthleteNames} error={athleteError} />
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
    </>
  );
}

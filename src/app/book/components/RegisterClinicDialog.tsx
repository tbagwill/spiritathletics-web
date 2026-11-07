'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CalendarDays, CircleDollarSign, Users } from 'lucide-react';
import { CARD_FEE_CENTS } from '@/lib/pricing';
import { Button } from '@/components/ui/Button';
import { Field, FormAlert, Input } from '@/components/ui/Field';
import { Sheet, SheetMeta } from '@/components/ui/Sheet';
import { AthleteNames, BookingFooter, EMAIL_PATTERN, PaymentChoice, money, type PaymentMethod } from './BookingFormParts';

type Props = {
  clinicId: string;
  clinicTitle: string;
  clinicWhen: string;
  priceCents: number;
  spotsLeft: number;
};

type FormValues = {
  customerName: string;
  customerEmail: string;
};

export default function RegisterClinicDialog({ clinicId, clinicTitle, clinicWhen, priceCents, spotsLeft }: Props) {
  const formId = `register-clinic-${clinicId}`;
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [athleteNames, setAthleteNames] = useState<string[]>(['']);
  const [athleteError, setAthleteError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

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
        const res = await fetch('/api/clinics/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clinicId,
            customerName: values.customerName,
            customerEmail: values.customerEmail,
            athleteFirstNames: trimmedNames,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Registration failed');
        window.location.href = `/book/success?type=clinic&payment=cash`;
      } else {
        const res = await fetch('/api/clinics/register/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clinicId,
            customerName: values.customerName,
            customerEmail: values.customerEmail,
            athleteFirstNames: trimmedNames,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Registration failed');
        window.location.href = data.url;
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setSubmitting(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setError(null);
    setAthleteError(null);
    reset();
    setPaymentMethod('CARD');
    setAthleteNames(['']);
  };

  if (spotsLeft <= 0) {
    return (
      <Button disabled variant="outline" className="w-full">
        Sold out
      </Button>
    );
  }

  return (
    <>
      <Button onClick={handleOpen} className="w-full">
        Register · {money(priceCents)}
      </Button>

      <Sheet
        open={open}
        onOpenChange={setOpen}
        eyebrow="Clinic registration"
        title={clinicTitle}
        meta={
          <>
            <SheetMeta icon={<CalendarDays />}>{clinicWhen}</SheetMeta>
            <SheetMeta icon={<CircleDollarSign />}>{money(priceCents)} per athlete</SheetMeta>
            <SheetMeta icon={<Users />}>
              {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} left
            </SheetMeta>
          </>
        }
        footer={
          <BookingFooter
            formId={formId}
            totalCents={displayTotal}
            paymentMethod={paymentMethod}
            submitting={submitting}
            cashLabel="Register"
            note={`First name${athleteNames.length > 1 ? 's' : ''} will appear on the public registrant list.`}
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
            <AthleteNames names={athleteNames} onChange={setAthleteNames} max={spotsLeft} error={athleteError} />
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

'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, CircleCheck } from 'lucide-react';
import SignaturePad from '@/components/SignaturePad';
import { PageHero } from '@/components/site/PageHero';
import { Button, buttonStyles } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Field, FormAlert, Input } from '@/components/ui/Field';
import { cn } from '@/components/ui/cn';
import { formatPt } from '@/lib/time';

const WAIVER_VERSION = '1.0';
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

function Step({
  n,
  title,
  done,
  children,
}: {
  n: number;
  title: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70 sm:p-7">
      <h2 className="flex items-center gap-3 text-lg font-semibold tracking-tight">
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
            done ? 'bg-emerald-500 text-white' : 'bg-spirit-gradient shadow-spirit text-white',
          )}
        >
          {done ? <Check className="size-4" strokeWidth={3} aria-hidden /> : n}
        </span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function WaiverPage() {
  const [athleteFirstName, setAthleteFirstName] = useState('');
  const [athleteLastName, setAthleteLastName] = useState('');
  const [parentFirstName, setParentFirstName] = useState('');
  const [parentLastName, setParentLastName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState('');

  const today = formatPt(new Date(), 'MMMM d, yyyy');

  const athleteDone = Boolean(athleteFirstName.trim() && athleteLastName.trim());
  const emailValid = EMAIL_PATTERN.test(parentEmail.trim());
  const parentDone = Boolean(parentFirstName.trim() && parentLastName.trim() && emailValid);
  const signDone = Boolean(signatureDataUrl && agreed);
  const canSubmit = athleteDone && parentDone && signDone && !submitting;

  const missing = [
    !athleteDone && 'athlete’s name',
    !(parentFirstName.trim() && parentLastName.trim()) && 'parent or guardian name',
    !emailValid && 'email',
    !signatureDataUrl && 'signature',
    !agreed && 'agreement checkbox',
  ].filter(Boolean) as string[];

  const req = (value: string, message: string) => (showErrors && !value.trim() ? message : null);

  const handleSignatureChange = useCallback((dataUrl: string | null) => {
    setSignatureDataUrl(dataUrl);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setShowErrors(true);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/waivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athleteFirstName: athleteFirstName.trim(),
          athleteLastName: athleteLastName.trim(),
          parentFirstName: parentFirstName.trim(),
          parentLastName: parentLastName.trim(),
          parentEmail: parentEmail.trim(),
          signatureDataUrl,
          waiverVersion: WAIVER_VERSION,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to submit waiver');
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /** Siblings: keep the parent's details, clear the athlete and signature. */
  const signAnother = () => {
    setAthleteFirstName('');
    setAthleteLastName('');
    setSignatureDataUrl(null);
    setAgreed(false);
    setShowErrors(false);
    setError('');
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-canvas px-4 py-16 font-sans text-slate-900">
        <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-soft-lg ring-1 ring-slate-200/70 motion-safe:animate-pop">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CircleCheck className="size-7" aria-hidden />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Waiver signed</h1>
          <p className="mt-2 leading-relaxed text-slate-600">
            Thank you, {parentFirstName}. The waiver for{' '}
            <span className="font-semibold text-slate-900">
              {athleteFirstName} {athleteLastName}
            </span>{' '}
            is on file. Nothing else is needed.
          </p>
          <div className="mt-7 grid gap-2">
            <Button onClick={signAnother} size="lg" className="w-full">
              Sign for another athlete
            </Button>
            <Link href="/" className={buttonStyles({ variant: 'outline', size: 'lg', className: 'w-full' })}>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas font-sans text-slate-900">
      <PageHero
        eyebrow="Liability waiver"
        title="Sign the"
        accent="waiver"
        lead="Takes about two minutes: add the athlete and parent details, read the agreement, then sign."
      />

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <Step n={1} title="Athlete" done={athleteDone}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" error={req(athleteFirstName, 'Enter the athlete’s first name.')}>
                {(id) => (
                  <Input
                    id={id}
                    value={athleteFirstName}
                    onChange={(e) => setAthleteFirstName(e.target.value)}
                    autoComplete="off"
                    invalid={!!req(athleteFirstName, 'x')}
                  />
                )}
              </Field>
              <Field label="Last name" error={req(athleteLastName, 'Enter the athlete’s last name.')}>
                {(id) => (
                  <Input
                    id={id}
                    value={athleteLastName}
                    onChange={(e) => setAthleteLastName(e.target.value)}
                    autoComplete="off"
                    invalid={!!req(athleteLastName, 'x')}
                  />
                )}
              </Field>
            </div>
          </Step>

          <Step n={2} title="Parent or guardian" done={parentDone}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" error={req(parentFirstName, 'Enter your first name.')}>
                {(id) => (
                  <Input
                    id={id}
                    value={parentFirstName}
                    onChange={(e) => setParentFirstName(e.target.value)}
                    autoComplete="given-name"
                    invalid={!!req(parentFirstName, 'x')}
                  />
                )}
              </Field>
              <Field label="Last name" error={req(parentLastName, 'Enter your last name.')}>
                {(id) => (
                  <Input
                    id={id}
                    value={parentLastName}
                    onChange={(e) => setParentLastName(e.target.value)}
                    autoComplete="family-name"
                    invalid={!!req(parentLastName, 'x')}
                  />
                )}
              </Field>
              <Field
                label="Email"
                className="sm:col-span-2"
                error={showErrors && !emailValid ? 'Enter a valid email.' : null}
              >
                {(id) => (
                  <Input
                    id={id}
                    type="email"
                    inputMode="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    autoComplete="email"
                    invalid={showErrors && !emailValid}
                  />
                )}
              </Field>
            </div>
          </Step>

          <Step n={3} title="Read and sign" done={signDone}>
            <div className="relative">
              <div
                tabIndex={0}
                aria-label="Waiver agreement"
                className="max-h-72 space-y-4 overflow-y-auto rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 ring-1 ring-inset ring-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-spirit-400 sm:p-5"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Spirit Athletics | High Desert Cheer
                  </p>
                  <p className="mt-0.5 font-semibold text-slate-900">Waiver agreement and release form</p>
                </div>
                <p>
                  I completely understand the above program for which I have let our child participate and in
                  consideration for being permitted by the HIGH DESERT CHEER owners to participate with, I hereby waive,
                  release, and discharge any and all claims for damages for personal injury, death, or property damage
                  which I may have or which my child may have, or which may hereafter accrue to me or my child, as a
                  result of participation in said activity. To the fullest extent possible, this waiver, release and
                  discharge is meant to waive, release and discharge my child&apos;s liability with High Desert Cheer,
                  LLC. This release is intended to discharge in advance the High Desert Cheer Teams (owner, staff, and
                  agents) from any and all liability arising out of or connected in any way with my child&apos;s/my
                  participation in said activity, even though that liability may arise out of negligence or
                  carelessness on the part of the persons or entities mentioned above. It is understood that this
                  activity involves an element of risk and danger of accidents knowing those risks I hereby assume those
                  risks. It is further agreed that this waiver and release and assumption of risk is to be binding on my
                  heirs and my child&apos;s and assigns. I agree to indemnify and to hold High Desert Cheer, LLC and its
                  owners, staff and agents and my other related persons or entities free and harmless from any loss,
                  liability, damage, cost, or expense which they may incur as the result of my death or my child&apos;s
                  or any injury or property damage that my child/I may sustain while participating in said activity.
                </p>
                <div className="border-t border-slate-200 pt-4">
                  <p className="font-semibold text-slate-900">Parental consent</p>
                  <p className="mt-0.5 text-xs italic text-slate-500">
                    (To be completed and signed by a parent/guardian if applicant is under 18 years of age)
                  </p>
                  <p className="mt-2">
                    I HEREBY CONSENT THAT MY DAUGHTER/SON CAN PARTICIPATE IN PRACTICING IN THE HIGH DESERT CHEER, SPIRIT
                    ATHLETICS FACILITY, AND HEREBY EXECUTE THE ABOVE AGREEMENT, WAIVER AND RELEASE ON HER/HIS BEHALF. I
                    STATE THAT SAID MINOR IS PHYSICALLY ABLE TO PARTICIPATE IN SAID ACTIVITY. I HEREBY AGREE TO INDEMNIFY
                    AND HOLD THE PERSONS AND ENTITIES MENTIONED ABOVE FREE AND HARMLESS FROM ANY LOSS, LIABILITY, DAMAGE,
                    COST, OR EXPENSE WHICH THEY MAY INCUR AS A RESULT OF THE DEATH OR ANY INJURY OR PROPERTY DAMAGE THAT
                    SAID MINOR MAY SUSTAIN WHILE PARTICIPATING AND/OR COMPETING IN SAID ACTIVITY.
                  </p>
                </div>
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-px bottom-px h-10 rounded-b-2xl bg-gradient-to-t from-slate-50 to-transparent"
              />
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              By signing electronically below, you consent to conducting this transaction electronically under the
              federal ESIGN Act and applicable state law. Your electronic signature carries the same legal effect as a
              handwritten signature.
            </p>

            <div className="mt-6">
              <SignaturePad
                label="Parent or guardian signature"
                onSignatureChange={handleSignatureChange}
                invalid={showErrors && !signatureDataUrl}
              />
              <p className="mt-1.5 text-xs text-slate-500">Signed {today}</p>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200">
              <Checkbox checked={agreed} onCheckedChange={setAgreed} invalid={showErrors && !agreed}>
                <span className="text-[13px]">
                  I HAVE CAREFULLY READ THIS AGREEMENT, WAIVER, AND RELEASE, AND FULLY UNDERSTAND ITS CONTENTS. I AM
                  AWARE THAT THIS IS A RELEASE OF LIABILITY AND A CONTRACT BETWEEN MYSELF AND THE HIGH DESERT CHEER, LLC.
                  STAFF AND OWNERS AND I SIGN THIS AGREEMENT OF MY OWN FREE WILL.
                </span>
              </Checkbox>
            </div>
          </Step>

          {error ? <FormAlert>{error}</FormAlert> : null}
          {showErrors && missing.length > 0 ? (
            <FormAlert>Still needed: {missing.join(', ')}.</FormAlert>
          ) : null}

          <Button type="submit" size="lg" loading={submitting} className="w-full">
            {submitting ? 'Submitting…' : 'Submit signed waiver'}
            {!submitting ? <ArrowRight className="size-4" aria-hidden /> : null}
          </Button>
        </form>
      </div>
    </div>
  );
}

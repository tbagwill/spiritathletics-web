'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import SignaturePad from '@/components/SignaturePad';

const WAIVER_VERSION = '1.0';

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
  const [error, setError] = useState('');

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const canSubmit =
    athleteFirstName.trim() &&
    athleteLastName.trim() &&
    parentFirstName.trim() &&
    parentLastName.trim() &&
    parentEmail.trim() &&
    signatureDataUrl &&
    agreed &&
    !submitting;

  const handleSignatureChange = useCallback((dataUrl: string | null) => {
    setSignatureDataUrl(dataUrl);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-green-100">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Waiver Submitted Successfully</h1>
          <p className="text-gray-600 mb-2">
            Thank you, <strong>{parentFirstName} {parentLastName}</strong>. Your signed waiver for <strong>{athleteFirstName} {athleteLastName}</strong> has been received and recorded.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            A copy is stored securely on file. No further action is needed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const inputClasses =
    'w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-500';

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,254,0.9), rgba(0,0,0,0.7), rgba(65,105,225,0.8))' }}></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">
            <span className="text-white">Waiver Agreement</span>
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Please read the waiver carefully, fill in the required information, and sign below.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Waiver Text */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 animate-fade-in-up">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-wide">
                SPIRIT ATHLETICS | HIGH DESERT CHEER
              </h2>
              <h3 className="text-lg font-semibold text-gray-800 mt-1">
                WAIVER AGREEMENT AND RELEASE FORM
              </h3>
            </div>

            <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
              <p>
                I completely understand the above program for which I have let our child participate
                and in consideration for being permitted by the HIGH DESERT CHEER owners to
                participate with, I hereby waive, release, and discharge any and all claims for
                damages for personal injury, death, or property damage which I may have or which my
                child may have, or which may hereafter accrue to me or my child, as a result of
                participation in said activity. To the fullest extent possible, this waiver, release
                and discharge is meant to waive, release and discharge my child&apos;s liability with High
                Desert Cheer, LLC. This release is intended to discharge in advance the High Desert
                Cheer Teams (owner, staff, and agents) from any and all liability arising out of or
                connected in any way with my child&apos;s/my participation in said activity, even though
                that liability may arise out of negligence or carelessness on the part of the persons
                or entities mentioned above. It is understood that this activity involves an element
                of risk and danger of accidents knowing those risks I hereby assume those risks. It
                is further agreed that this waiver and release and assumption of risk is to be binding
                on my heirs and my child&apos;s and assigns. I agree to indemnify and to hold High Desert
                Cheer, LLC and its owners, staff and agents and my other related persons or entities
                free and harmless from any loss, liability, damage, cost, or expense which they may
                incur as the result of my death or my child&apos;s or any injury or property damage that
                my child/I may sustain while participating in said activity.
              </p>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-2">
                  Parental Consent
                </h4>
                <p className="text-xs text-gray-500 italic mb-2">
                  (To be completed and signed by a parent/guardian if applicant is under 18 years of age)
                </p>
                <p>
                  I HEREBY CONSENT THAT MY DAUGHTER/SON CAN PARTICIPATE IN PRACTICING IN THE HIGH
                  DESERT CHEER, SPIRIT ATHLETICS FACILITY, AND HEREBY EXECUTE THE ABOVE AGREEMENT,
                  WAIVER AND RELEASE ON HER/HIS BEHALF. I STATE THAT SAID MINOR IS PHYSICALLY ABLE
                  TO PARTICIPATE IN SAID ACTIVITY. I HEREBY AGREE TO INDEMNIFY AND HOLD THE PERSONS
                  AND ENTITIES MENTIONED ABOVE FREE AND HARMLESS FROM ANY LOSS, LIABILITY, DAMAGE,
                  COST, OR EXPENSE WHICH THEY MAY INCUR AS A RESULT OF THE DEATH OR ANY INJURY OR
                  PROPERTY DAMAGE THAT SAID MINOR MAY SUSTAIN WHILE PARTICIPATING AND/OR COMPETING
                  IN SAID ACTIVITY.
                </p>
              </div>
            </div>
          </div>

          {/* E-Sign Disclosure */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-sm text-blue-800 animate-fade-in-up">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>
                By signing electronically below, you consent to conducting this transaction
                electronically under the federal ESIGN Act and applicable state law. Your electronic
                signature carries the same legal effect as a handwritten signature.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 space-y-6 animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-3">
              Signer Information
            </h3>

            {/* Athlete Name */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">Athlete&apos;s Name (Printed) <span className="text-red-500">*</span></p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="athleteFirstName" className="block text-xs font-medium text-gray-600 mb-1">
                    First Name
                  </label>
                  <input
                    id="athleteFirstName"
                    type="text"
                    required
                    value={athleteFirstName}
                    onChange={(e) => setAthleteFirstName(e.target.value)}
                    className={inputClasses}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label htmlFor="athleteLastName" className="block text-xs font-medium text-gray-600 mb-1">
                    Last Name
                  </label>
                  <input
                    id="athleteLastName"
                    type="text"
                    required
                    value={athleteLastName}
                    onChange={(e) => setAthleteLastName(e.target.value)}
                    className={inputClasses}
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>

            {/* Parent Name */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">Parent/Guardian Name (Printed) <span className="text-red-500">*</span></p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="parentFirstName" className="block text-xs font-medium text-gray-600 mb-1">
                    First Name
                  </label>
                  <input
                    id="parentFirstName"
                    type="text"
                    required
                    value={parentFirstName}
                    onChange={(e) => setParentFirstName(e.target.value)}
                    className={inputClasses}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label htmlFor="parentLastName" className="block text-xs font-medium text-gray-600 mb-1">
                    Last Name
                  </label>
                  <input
                    id="parentLastName"
                    type="text"
                    required
                    value={parentLastName}
                    onChange={(e) => setParentLastName(e.target.value)}
                    className={inputClasses}
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>

            {/* Email and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="parentEmail" className="block text-sm font-semibold text-gray-800 mb-1">
                  Parent/Guardian Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="parentEmail"
                  type="email"
                  required
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className={inputClasses}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Date</label>
                <div className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 font-medium">
                  {today}
                </div>
              </div>
            </div>

            {/* Signature */}
            <div className="pt-4 border-t border-gray-200">
              <SignaturePad onSignatureChange={handleSignatureChange} />
            </div>

            {/* Agreement Checkbox */}
            <div className="pt-4 border-t border-gray-200">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                />
                <span className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                  I HAVE CAREFULLY READ THIS AGREEMENT, WAIVER, AND RELEASE, AND FULLY UNDERSTAND
                  ITS CONTENTS. I AM AWARE THAT THIS IS A RELEASE OF LIABILITY AND A CONTRACT
                  BETWEEN MYSELF AND THE HIGH DESERT CHEER, LLC. STAFF AND OWNERS AND I SIGN THIS
                  AGREEMENT OF MY OWN FREE WILL.
                </span>
              </label>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="text-center">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center px-8 py-4 text-white font-bold rounded-xl text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
              style={{ background: canSubmit ? 'linear-gradient(135deg, #0000FE, #4169E1)' : '#9CA3AF' }}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit Signed Waiver
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

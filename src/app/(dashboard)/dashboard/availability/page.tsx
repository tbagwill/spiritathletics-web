"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import TimePicker from "@/components/TimePicker";
import { ptTodayString } from "@/lib/time";

type Rule = {
  id: string;
  ruleType: "WEEKLY";
  byDay: string[];
  startTimeMinutes: number;
  endTimeMinutes: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  slotIntervalMinutes: number;
};

type Reservation = {
  id: string;
  startDateTimeUTC: string;
  endDateTimeUTC: string;
  notes: string | null;
};

const DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;
const DAY_LABELS: Record<string, string> = {
  SU: "Sun",
  MO: "Mon",
  TU: "Tue",
  WE: "Wed",
  TH: "Thu",
  FR: "Fri",
  SA: "Sat",
};

function minutesToLabel(m: number) {
  const h = Math.floor(m / 60);
  const mm = (m % 60).toString().padStart(2, "0");
  const suffix = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${mm} ${suffix}`;
}

export default function AvailabilityPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [byDay, setByDay] = useState<string[]>([]);
  const [start, setStart] = useState(540); // 9:00 AM
  const [end, setEnd] = useState(1020); // 5:00 PM
  const [from, setFrom] = useState<string>(ptTodayString());
  const [to, setTo] = useState<string>("");
  const [slotInterval, setSlotInterval] = useState<30 | 60>(30);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reservations state
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [resDate, setResDate] = useState<string>(ptTodayString());
  const [resStartMin, setResStartMin] = useState(480); // 8:00 AM
  const [resDuration, setResDuration] = useState(60);
  const [resLabel, setResLabel] = useState("");
  const [resError, setResError] = useState<string | null>(null);
  const [resLoading, setResLoading] = useState(false);

  const fetchRules = async () => {
    const res = await fetch("/api/dashboard/availability/rules");
    const data = await res.json();
    if (res.ok && data.ok) setRules(data.rules);
  };

  const fetchReservations = async () => {
    const res = await fetch("/api/dashboard/availability/reservations");
    const data = await res.json();
    if (res.ok && data.ok) setReservations(data.reservations);
  };

  useEffect(() => {
    fetchRules();
    fetchReservations();
  }, []);

  const toggleDay = (d: string) => {
    setByDay((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (byDay.length === 0) return setError("Select at least one day.");
    if (end <= start) return setError("End time must be after start time.");
    setLoading(true);
    const res = await fetch("/api/dashboard/availability/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ruleType: "WEEKLY",
        byDay,
        startTimeMinutes: start,
        endTimeMinutes: end,
        effectiveFrom: from,
        effectiveTo: to || null,
        slotIntervalMinutes: slotInterval,
      }),
    });
    setLoading(false);
    const data = await res.json();
    if (res.ok && data.ok) {
      setByDay([]);
      setStart(540);
      setEnd(1020);
      setFrom(ptTodayString());
      setTo("");
      setSlotInterval(30);
      fetchRules();
    } else {
      setError(data.error || "Failed to create rule");
    }
  };

  const submitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setResError(null);
    if (!resDate) return setResError("Select a date.");
    setResLoading(true);
    const endMin = resStartMin + resDuration;
    const res = await fetch("/api/dashboard/availability/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: resDate,
        startTimeMinutes: resStartMin,
        endTimeMinutes: endMin,
        label: resLabel || null,
      }),
    });
    setResLoading(false);
    const data = await res.json();
    if (res.ok && data.ok) {
      setResDate(ptTodayString());
      setResStartMin(480);
      setResDuration(60);
      setResLabel("");
      fetchReservations();
    } else {
      setResError(data.error || "Failed to create reservation");
    }
  };

  const deleteReservation = async (id: string) => {
    const res = await fetch(`/api/dashboard/availability/reservations/${id}`, { method: "DELETE" });
    if (res.ok) fetchReservations();
  };

  const onDelete = async (id: string) => {
    const res = await fetch(`/api/dashboard/availability/rules/${id}`, { method: 'DELETE' });
    if (res.ok) fetchRules();
  };

  const formatReservationTime = (iso: string) => {
    try {
      return formatInTimeZone(new Date(iso), 'America/Los_Angeles', "EEE, MMM d 'at' h:mm a 'PT'");
    } catch {
      return iso;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Hero header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-800">
        <div aria-hidden className="absolute inset-0 bg-dot-grid opacity-50" />
        <div aria-hidden className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-6 sm:pb-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-50 ring-1 ring-inset ring-white/20 backdrop-blur">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Scheduling
              </span>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-4xl">Manage Availability</h1>
              <p className="mt-2 max-w-lg text-sm text-blue-100/90 sm:text-base">Set your weekly schedule, choose session intervals, and reserve slots for private arrangements.</p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 backdrop-blur transition-colors hover:bg-white/20"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative mx-auto -mt-10 max-w-6xl px-4 pb-20 sm:-mt-12 sm:px-6">
        {/* Add Rule Form */}
        <section className="rounded-3xl bg-white p-5 shadow-soft-lg ring-1 ring-slate-200 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add Availability Rule</h2>
              <p className="text-sm text-slate-500">Create a recurring weekly window for bookings</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-6">
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Days Selection */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-700">Available Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={`min-w-[3.25rem] rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      byDay.includes(d)
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-soft"
                        : "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {DAY_LABELS[d]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Time Range */}
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Start Time</label>
                <TimePicker value={start} onChange={setStart} step={15} ariaLabel="Start time" />
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200">
                <label className="mb-2 block text-sm font-semibold text-slate-700">End Time</label>
                <TimePicker value={end} onChange={setEnd} step={15} ariaLabel="End time" />
              </div>

              {/* Date Range */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Effective From</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Effective To <span className="font-normal text-slate-400">(optional)</span></label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  placeholder="Leave empty for no end date"
                />
              </div>
            </div>

            {/* Slot Interval */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Session Start Interval</label>
              <p className="mb-3 text-xs text-slate-500">Controls how often slots are offered within this window. &quot;Every hour&quot; ensures sessions start only on the hour (e.g. 4:00, 5:00, 6:00) with no dead time.</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: 30 as const, label: "Every 30 minutes" },
                  { v: 60 as const, label: "Every hour" },
                ].map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setSlotInterval(opt.v)}
                    className={`rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                      slotInterval === opt.v
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-soft"
                        : "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-soft transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-soft-lg disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving…
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add Rule
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Existing Rules */}
        <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-200">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Availability Rules</h2>
              <p className="text-sm text-slate-500">Recurring windows clients can book</p>
            </div>
          </div>

          {rules.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-1 text-lg font-semibold text-slate-900">No availability rules yet</h3>
              <p className="text-slate-500">Create your first rule above to start accepting bookings.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {rules.map((r, index) => (
                <div key={r.id} className="group flex animate-fade-in items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-slate-50" style={{ animationDelay: `${index * 60}ms` }}>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {r.byDay.map((day) => (
                        <span key={day} className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-100">
                          {DAY_LABELS[day] ?? day}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
                        <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {minutesToLabel(r.startTimeMinutes)} – {minutesToLabel(r.endTimeMinutes)}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                        {r.slotIntervalMinutes === 60 ? "Every hour" : "Every 30 min"}
                      </span>
                      <span className="text-slate-500">
                        {new Date(r.effectiveFrom).toLocaleDateString()}
                        {r.effectiveTo && ` → ${new Date(r.effectiveTo).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(r.id)}
                    className="rounded-xl p-2.5 text-red-500 ring-1 ring-inset ring-red-200 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                    type="button"
                    title="Delete availability rule"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reserved Slots */}
        <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-200">
          <div className="flex items-center gap-3 border-b border-amber-100 bg-amber-50/60 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 ring-1 ring-inset ring-amber-200">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Reserve a Slot</h2>
              <p className="text-sm text-slate-500">Block a time from client bookings — for private arrangements made outside the system.</p>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={submitReservation} className="space-y-5">
              {resError && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{resError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Date</label>
                  <input
                    type="date"
                    value={resDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setResDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Start Time (PT)</label>
                  <TimePicker
                    value={resStartMin}
                    onChange={setResStartMin}
                    step={30}
                    maxMinutes={1410}
                    accent="amber"
                    ariaLabel="Reservation start time"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Duration</label>
                  <select
                    value={resDuration}
                    onChange={(e) => setResDuration(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Label <span className="font-normal text-slate-400">(optional)</span></label>
                  <input
                    type="text"
                    value={resLabel}
                    onChange={(e) => setResLabel(e.target.value)}
                    placeholder="e.g. Private arrangement"
                    maxLength={100}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={resLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-soft transition-all duration-200 hover:from-amber-600 hover:to-orange-600 hover:shadow-soft-lg disabled:opacity-70"
                >
                  {resLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Reserving…
                    </>
                  ) : (
                    "Reserve Slot"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Upcoming reservations */}
          {reservations.length > 0 && (
            <div className="border-t border-slate-100">
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Upcoming Reserved Slots</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {reservations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-100">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatReservationTime(r.startDateTimeUTC)} – {formatInTimeZone(new Date(r.endDateTimeUTC), 'America/Los_Angeles', 'h:mm a')}
                        </p>
                        {r.notes && <p className="mt-0.5 text-xs text-slate-500">{r.notes}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteReservation(r.id)}
                      className="rounded-xl p-2.5 text-red-500 ring-1 ring-inset ring-red-200 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                      type="button"
                      title="Remove reservation"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

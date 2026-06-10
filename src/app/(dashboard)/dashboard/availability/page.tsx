"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";

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
  const [from, setFrom] = useState<string>(new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState<string>("");
  const [slotInterval, setSlotInterval] = useState<30 | 60>(30);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reservations state
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [resDate, setResDate] = useState<string>(new Date().toISOString().slice(0, 10));
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
      setFrom(new Date().toISOString().slice(0, 10));
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
    // Build UTC times from a PT date + minute offset
    // We send ISO strings; the API will parse them as UTC.
    // To convert PT minutes to UTC we need the local timezone offset but since
    // the server handles PT conversion, we send the date + minutes as a
    // constructed UTC ISO by using the browser's Date. For accuracy we'll
    // pass a note that this should be treated as PT by the server.
    // Simplest approach: send startDate (date string) and startTimeMinutes so
    // the server can do combineLocalDateAndMinutesPT. We'll call a dedicated
    // endpoint that accepts date + minutes instead.
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
      setResDate(new Date().toISOString().slice(0, 10));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-slide-up">
            {/* Mobile-first layout: stack vertically on small screens */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Availability</h1>
                <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Set your weekly schedule and availability rules</p>
              </div>
              <div className="flex justify-center sm:justify-end">
                <Link href="/dashboard" className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:shadow-md text-sm sm:text-base">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Add Rule Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8 animate-fade-in-up">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Add Availability Rule</h2>
            <p className="text-gray-600 text-sm">Create a new availability rule for your schedule</p>
          </div>
          
          <form onSubmit={submit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Days Selection */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-3 text-gray-900">Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => toggleDay(d)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                        byDay.includes(d) 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg" 
                          : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-900">Start Time</label>
                <div className="space-y-2">
                  <input 
                    type="range" 
                    min={0} 
                    max={1440} 
                    step={15} 
                    value={start} 
                    onChange={(e) => setStart(parseInt(e.target.value) || 0)} 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-center text-sm font-medium text-blue-600 bg-blue-50 py-2 rounded-lg">
                    {minutesToLabel(start)}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-900">End Time</label>
                <div className="space-y-2">
                  <input 
                    type="range" 
                    min={0} 
                    max={1440} 
                    step={15} 
                    value={end} 
                    onChange={(e) => setEnd(parseInt(e.target.value) || 0)} 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-center text-sm font-medium text-blue-600 bg-blue-50 py-2 rounded-lg">
                    {minutesToLabel(end)}
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Effective From</label>
                <input 
                  type="date" 
                  value={from} 
                  onChange={(e) => setFrom(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors text-gray-900 placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">Effective To (optional)</label>
                <input 
                  type="date" 
                  value={to} 
                  onChange={(e) => setTo(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors text-gray-900 placeholder-gray-500"
                  placeholder="Leave empty for no end date"
                />
              </div>

              {/* Slot Interval */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-900">Session Start Interval</label>
                <p className="text-xs text-gray-500 mb-3">Controls how often slots are offered within this availability window. &quot;Every hour&quot; ensures sessions start only on the hour (e.g. 4:00, 5:00, 6:00) with no dead time.</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSlotInterval(30)}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      slotInterval === 30
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Every 30 minutes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlotInterval(60)}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      slotInterval === 60
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Every hour
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button 
                type="submit" 
                disabled={loading} 
                className="px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-xl disabled:opacity-70"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  'Add Rule'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Rules */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-slide-up">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Your Availability Rules</h2>
            <p className="text-sm text-gray-600">Manage your existing schedule rules</p>
          </div>
          
          {rules.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No availability rules yet</h3>
              <p className="text-gray-600">Create your first availability rule to start accepting bookings</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {rules.map((r, index) => (
                <div key={r.id} className="p-6 hover:bg-gray-50 transition-colors group animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex gap-1">
                          {r.byDay.map(day => (
                            <span key={day} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                              {day}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 text-gray-900">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium">
                            {minutesToLabel(r.startTimeMinutes)} – {minutesToLabel(r.endTimeMinutes)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-900 flex-wrap">
                        <span>
                          <span className="font-medium">Effective:</span> {new Date(r.effectiveFrom).toLocaleDateString()}
                          {r.effectiveTo && ` to ${new Date(r.effectiveTo).toLocaleDateString()}`}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {r.slotIntervalMinutes === 60 ? 'Every hour' : 'Every 30 min'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDelete(r.id)} 
                      className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                      type="button"
                      title="Delete availability rule"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reserved Slots */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in-up">
          <div className="bg-amber-50 px-6 py-4 border-b border-amber-200">
            <h2 className="text-lg font-bold text-gray-900">Reserve a Slot</h2>
            <p className="text-sm text-gray-600">Block a specific time slot from client bookings — useful when you&apos;ve made a private arrangement outside the system.</p>
          </div>

          <div className="p-6">
            <form onSubmit={submitReservation} className="space-y-5">
              {resError && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{resError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Date</label>
                  <input
                    type="date"
                    value={resDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setResDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Start Time (PT)</label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={0}
                      max={1410}
                      step={30}
                      value={resStartMin}
                      onChange={(e) => setResStartMin(parseInt(e.target.value) || 0)}
                      className="w-full"
                    />
                    <div className="text-center text-sm font-medium text-amber-600 bg-amber-50 py-2 rounded-lg">
                      {minutesToLabel(resStartMin)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Duration</label>
                  <select
                    value={resDuration}
                    onChange={(e) => setResDuration(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white transition-colors"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Label (optional)</label>
                  <input
                    type="text"
                    value={resLabel}
                    onChange={(e) => setResLabel(e.target.value)}
                    placeholder="e.g. Private arrangement"
                    maxLength={100}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={resLoading}
                  className="px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all duration-200 hover:shadow-xl disabled:opacity-70"
                >
                  {resLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Reserving...
                    </div>
                  ) : (
                    'Reserve Slot'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Upcoming reservations */}
          {reservations.length > 0 && (
            <div className="border-t border-gray-200">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">Upcoming Reserved Slots</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {reservations.map((r) => (
                  <div key={r.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatReservationTime(r.startDateTimeUTC)} – {formatInTimeZone(new Date(r.endDateTimeUTC), 'America/Los_Angeles', 'h:mm a')}
                      </p>
                      {r.notes && <p className="text-xs text-gray-500 mt-0.5">{r.notes}</p>}
                    </div>
                    <button
                      onClick={() => deleteReservation(r.id)}
                      className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                      type="button"
                      title="Remove reservation"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

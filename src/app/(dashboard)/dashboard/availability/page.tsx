"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Rule = {
  id: string;
  ruleType: "WEEKLY";
  byDay: string[];
  startTimeMinutes: number;
  endTimeMinutes: number;
  effectiveFrom: string;
  effectiveTo: string | null;
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRules = async () => {
    const res = await fetch("/api/dashboard/availability/rules");
    const data = await res.json();
    if (res.ok && data.ok) setRules(data.rules);
  };

  useEffect(() => {
    fetchRules();
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
      fetchRules();
    } else {
      setError(data.error || "Failed to create rule");
    }
  };

  const onDelete = async (id: string) => {
    const res = await fetch(`/api/dashboard/availability/rules/${id}`, { method: 'DELETE' });
    if (res.ok) fetchRules();
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
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
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">Effective:</span> {new Date(r.effectiveFrom).toLocaleDateString()}
                        {r.effectiveTo && ` to ${new Date(r.effectiveTo).toLocaleDateString()}`}
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
      </div>
    </div>
  );
}

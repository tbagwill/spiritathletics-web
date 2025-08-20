"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] as const;

type ClassTemplate = {
  id: string;
  weekday: number;
  startTimeMinutes: number;
  capacity: number;
  service: {
    title: string;
    basePriceCents: number;
  };
};

function minutesToLabel(m: number) {
  const h = Math.floor(m / 60) % 12 || 12;
  const mm = (m % 60).toString().padStart(2, '0');
  const suffix = m < 720 ? 'AM' : 'PM';
  return `${h}:${mm} ${suffix}`;
}

export default function ClassesManagerPage() {
  const [templates, setTemplates] = useState<ClassTemplate[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weekday, setWeekday] = useState(3);
  const [start, setStart] = useState(16 * 60);
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState(3000);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const load = async () => {
    const res = await fetch('/api/dashboard/classes/templates');
    const data = await res.json();
    if (res.ok && data.ok) setTemplates(data.templates);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title || !description) return setError('Title and description are required');
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/classes/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, weekday, startTimeMinutes: start,
          durationMinutes: duration, basePriceCents: price,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTitle(''); setDescription(''); setWeekday(3); setStart(16*60);
        setDuration(60); setPrice(3000);
        setShowAddForm(false);
        await load();
        showToast('Class added successfully!', 'success');
      } else {
        setError(data.error || 'Failed to create class');
      }
    } catch {
      setError('Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  };
  
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const onDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/dashboard/classes/templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await load();
        showToast('Class deleted successfully!', 'success');
      } else {
        showToast('Failed to delete class', 'error');
      }
    } catch {
      showToast('Failed to delete class', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-xl transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Mobile-first layout: stack vertically on small screens */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Class Management</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Create and manage your class templates</p>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:gap-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center justify-center px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Class
              </button>
              <Link href="/dashboard" className="inline-flex items-center justify-center px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 text-sm sm:text-base">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Add Class Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddForm(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden z-10">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Create New Class</h3>
                    <p className="text-blue-100 text-sm">Set up a new class template</p>
                  </div>
                  <button onClick={() => setShowAddForm(false)} className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <form onSubmit={submit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{error}</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900">Class Title</label>
                      <input 
                        value={title} 
                        onChange={(e)=>setTitle(e.target.value)} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors text-gray-900 placeholder-gray-500"
                        placeholder="e.g., Tumbling Class - Level 1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900">Weekday</label>
                      <select 
                        value={weekday} 
                        onChange={(e)=>setWeekday(parseInt(e.target.value) || 0)} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 bg-white transition-colors"
                      >
                        {WEEKDAYS.map((d, i)=>(<option key={i} value={i}>{d}</option>))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2 text-gray-900">Description</label>
                      <textarea 
                        value={description} 
                        onChange={(e)=>setDescription(e.target.value)} 
                        rows={3} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors text-gray-900 placeholder-gray-500"
                        placeholder="Describe what this class covers..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900">Start Time</label>
                      <div className="space-y-2">
                        <input 
                          type="range" 
                          min={0} 
                          max={1440} 
                          step={15} 
                          value={start} 
                          onChange={(e)=>setStart(parseInt(e.target.value) || 0)} 
                          className="w-full"
                        />
                        <div className="text-center text-sm font-medium text-blue-600 bg-blue-50 py-2 rounded-lg">
                          {minutesToLabel(start)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900">Duration (minutes)</label>
                      <input 
                        type="number" 
                        min={15} 
                        step={5} 
                        value={duration} 
                        onChange={(e)=>setDuration(parseInt(e.target.value) || 60)} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors text-gray-900 placeholder-gray-500"
                        placeholder="60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-900">Price ($)</label>
                      <input 
                        type="number" 
                        min={0} 
                        step="0.01"
                        value={price/100} 
                        onChange={(e)=>setPrice(Math.round(parseFloat(e.target.value||'0')*100))} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors text-gray-900 placeholder-gray-500"
                        placeholder="30.00"
                      />
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Class Configuration</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Capacity:</strong> 10 athletes (fixed)</p>
                        <p><strong>Location:</strong> Spirit Athletics</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button 
                      type="button" 
                      onClick={() => setShowAddForm(false)} 
                      className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-70"
                    >
                      {loading ? 'Creating...' : 'Create Class'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Class Templates List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Current Classes</h2>
            <p className="text-sm text-gray-600">Manage your recurring class schedules</p>
          </div>
          
          {templates.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No classes created yet</h3>
              <p className="text-gray-600 mb-6">Create your first class template to start scheduling recurring classes</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create First Class
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {templates.map((t: ClassTemplate, index: number) => (
                <div key={t.id} className="p-6 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Title and Day */}
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{t.service.title}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {WEEKDAYS[t.weekday]}
                        </span>
                      </div>
                      
                      {/* Class Details - Vertical Layout */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">Time:</span>
                          <span>{minutesToLabel(t.startTimeMinutes)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="font-medium">Capacity:</span>
                          <span>{t.capacity} athletes maximum</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className="font-medium">Price:</span>
                          <span>${(t.service.basePriceCents/100).toFixed(2)} per class</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Delete Button */}
                    <button 
                      onClick={() => onDelete(t.id)} 
                      className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                      type="button"
                      title="Delete class template"
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
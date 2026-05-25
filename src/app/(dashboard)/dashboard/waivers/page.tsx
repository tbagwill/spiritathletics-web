'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface WaiverSummary {
  id: string;
  athleteFirstName: string;
  athleteLastName: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  waiverVersion: string;
  signedAt: string;
}

interface WaiverDetail extends WaiverSummary {
  ipAddress: string | null;
  signatureDataUrl: string;
}

export default function WaiversDashboard() {
  const [waivers, setWaivers] = useState<WaiverSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedWaiver, setSelectedWaiver] = useState<WaiverDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchWaivers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await fetch(`/api/dashboard/waivers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setWaivers(data.waivers);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchWaivers();
  }, [fetchWaivers]);

  const viewDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/dashboard/waivers/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedWaiver(data);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const downloadPdf = (id: string, firstName: string, lastName: string) => {
    const link = document.createElement('a');
    link.href = `/api/dashboard/waivers/${id}?format=pdf`;
    link.download = `waiver-${firstName}-${lastName}.pdf`.toLowerCase().replace(/\s+/g, '-');
    link.click();
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/dashboard"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Athlete Waivers</h1>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                {total} signed waiver{total !== 1 ? 's' : ''} on file
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by athlete name, parent name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Waiver List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading waivers...
            </div>
          ) : waivers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {debouncedSearch ? 'No waivers match your search.' : 'No waivers have been signed yet.'}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Athlete
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Parent/Guardian
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Signed
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {waivers.map((w) => (
                      <tr key={w.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{w.athleteFirstName} {w.athleteLastName}</td>
                        <td className="px-6 py-4 text-gray-700">{w.parentFirstName} {w.parentLastName}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">{w.parentEmail}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(w.signedAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => viewDetail(w.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => downloadPdf(w.id, w.athleteFirstName, w.athleteLastName)}
                              className="text-gray-500 hover:text-gray-700 transition-colors"
                              title="Download PDF"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {waivers.map((w) => (
                  <div key={w.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{w.athleteFirstName} {w.athleteLastName}</p>
                        <p className="text-sm text-gray-600">{w.parentFirstName} {w.parentLastName}</p>
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(w.signedAt)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{w.parentEmail}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => viewDetail(w.id)}
                        className="text-sm text-blue-600 font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => downloadPdf(w.id, w.athleteFirstName, w.athleteLastName)}
                        className="text-sm text-gray-500"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {(selectedWaiver || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {detailLoading ? (
              <div className="p-12 text-center">
                <svg className="animate-spin h-8 w-8 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : selectedWaiver ? (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Waiver Details</h2>
                  <button
                    onClick={() => setSelectedWaiver(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Athlete</p>
                      <p className="text-gray-900 font-medium">{selectedWaiver.athleteFirstName} {selectedWaiver.athleteLastName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Parent/Guardian</p>
                      <p className="text-gray-900 font-medium">{selectedWaiver.parentFirstName} {selectedWaiver.parentLastName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                      <p className="text-gray-700 text-sm">{selectedWaiver.parentEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Signed</p>
                      <p className="text-gray-700 text-sm">{formatDate(selectedWaiver.signedAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Waiver Version</p>
                      <p className="text-gray-700 text-sm">v{selectedWaiver.waiverVersion}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">IP Address</p>
                      <p className="text-gray-700 text-sm">{selectedWaiver.ipAddress || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Signature preview */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Signature</p>
                    <div className="border border-gray-200 rounded-lg bg-gray-50 p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedWaiver.signatureDataUrl}
                        alt="Signature"
                        className="max-h-24 mx-auto"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => downloadPdf(selectedWaiver.id, selectedWaiver.athleteFirstName, selectedWaiver.athleteLastName)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold rounded-xl transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Signed PDF
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  heroImageUrl: string | null;
  startsAt: string;
  endsAt: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'FULFILLED' | 'CANCELED';
  products: any[];
  orders: any[];
  createdAt: string;
}

export default function CampaignsManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const response = await fetch('/api/admin/shop/campaigns');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch campaigns');
      }
      
      setCampaigns(data.campaigns);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }

  async function deleteCampaign(id: string) {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/shop/campaigns/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete campaign');
      }

      setCampaigns(campaigns.filter(c => c.id !== id));
      showToast('success', 'Campaign deleted successfully');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete campaign');
    }
  }

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  }

  function getStatusBadge(status: Campaign['status']) {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-green-100 text-green-800',
      CLOSED: 'bg-blue-100 text-blue-800',
      FULFILLED: 'bg-purple-100 text-purple-800',
      CANCELED: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.toLowerCase()}
      </span>
    );
  }

  function isActive(campaign: Campaign) {
    const now = new Date();
    const start = new Date(campaign.startsAt);
    const end = new Date(campaign.endsAt);
    return campaign.status === 'ACTIVE' && now >= start && now <= end;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Campaigns</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchCampaigns}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-xl transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">All Campaigns</h2>
          <p className="text-sm text-gray-600">Manage your pop-up shop campaigns</p>
        </div>
        <Link
          href="/admin/shop/campaigns/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Campaign
        </Link>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h6a2 2 0 012 2v4m-6 6v7m8-3v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4m8-3V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
          <p className="text-gray-600 mb-6">Create your first pop-up campaign to start selling products</p>
          <Link
            href="/admin/shop/campaigns/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Create Your First Campaign
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col space-y-4">
                  {/* Header Section */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {campaign.title}
                        </h3>
                        {getStatusBadge(campaign.status)}
                        {isActive(campaign) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-500 text-white">
                            ● LIVE
                          </span>
                        )}
                      </div>
                      
                      {campaign.description && (
                        <p className="text-gray-700 text-sm mb-2">
                          {campaign.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Campaign Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{campaign.products.length}</div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Products</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{campaign.orders.length}</div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Orders</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          ${(campaign.orders.reduce((sum, order) => sum + order.totalCents, 0) / 100).toFixed(2)}
                        </div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-700">
                          {new Date(campaign.startsAt).toLocaleDateString()} 
                        </div>
                        <div className="text-xs text-gray-500">to</div>
                        <div className="text-lg font-semibold text-gray-700">
                          {new Date(campaign.endsAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Campaign Dates</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <div className="text-xs text-gray-500">
                      Created {new Date(campaign.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/shop/campaigns/${campaign.id}`}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/shop`}
                        target="_blank"
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => deleteCampaign(campaign.id)}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={campaign.orders.length > 0}
                        title={campaign.orders.length > 0 ? 'Cannot delete campaign with orders' : 'Delete campaign'}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

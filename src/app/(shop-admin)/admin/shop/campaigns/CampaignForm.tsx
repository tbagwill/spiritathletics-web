'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast from '@/components/Toast';

interface CampaignFormProps {
  campaignId?: string;
  initialData?: {
    title: string;
    slug: string;
    description: string;
    heroImageUrl: string;
    startsAt: string;
    endsAt: string;
    status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'FULFILLED' | 'CANCELED';
  };
}

export default function CampaignForm({ campaignId, initialData }: CampaignFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; show: boolean }>({
    message: '',
    type: 'success',
    show: false
  });
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    heroImageUrl: initialData?.heroImageUrl || '',
    startsAt: initialData?.startsAt ? new Date(initialData.startsAt).toISOString().slice(0, 16) : '',
    endsAt: initialData?.endsAt ? new Date(initialData.endsAt).toISOString().slice(0, 16) : '',
    status: initialData?.status || 'DRAFT' as const,
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (!campaignId && formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, campaignId, formData.slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = campaignId 
        ? `/api/admin/shop/campaigns/${campaignId}`
        : '/api/admin/shop/campaigns';
      
      const method = campaignId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startsAt: new Date(formData.startsAt).toISOString(),
          endsAt: new Date(formData.endsAt).toISOString(),
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save campaign');
      }

      // Show success message
      const successMessage = campaignId 
        ? 'Campaign updated successfully! Changes are live immediately.'
        : 'Campaign created successfully!';
      
      setToast({
        message: successMessage,
        type: 'success',
        show: true
      });

      // Show additional info if there's cascading updates
      if (data.message) {
        console.log('Campaign update info:', data.message);
      }

      // Redirect after a brief delay to show the toast
      setTimeout(() => {
        router.push('/admin/shop/campaigns');
      }, 1500);
    } catch (err) {
      console.error('Error saving campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to save campaign');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Campaign Details</h3>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {/* Campaign Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 placeholder-gray-500"
                placeholder="e.g. Spring 2025 Collection"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug *
              </label>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">/shop/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 placeholder-gray-500"
                  placeholder="spring-2025-collection"
                  pattern="^[a-z0-9-]+$"
                  title="Only lowercase letters, numbers, and hyphens allowed"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Only lowercase letters, numbers, and hyphens allowed
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 placeholder-gray-500"
                placeholder="Brief description of this campaign..."
              />
            </div>

            {/* Hero Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Image URL
              </label>
              <input
                type="url"
                value={formData.heroImageUrl}
                onChange={(e) => handleChange('heroImageUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 placeholder-gray-500"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional header image for the campaign page
              </p>
            </div>

            {/* Campaign Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => handleChange('startsAt', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={(e) => handleChange('endsAt', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="CLOSED">Closed</option>
                <option value="FULFILLED">Fulfilled</option>
                <option value="CANCELED">Canceled</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Only ACTIVE campaigns are visible to customers
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Saving...' : (campaignId ? 'Update Campaign' : 'Create Campaign')}
          </button>
          <Link
            href="/admin/shop/campaigns"
            className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>

      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}

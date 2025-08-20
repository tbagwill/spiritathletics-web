'use client';

import { useState, useEffect } from 'react';
import CampaignForm from '../CampaignForm';

interface EditCampaignFormProps {
  campaignId: string;
}

export default function EditCampaignForm({ campaignId }: EditCampaignFormProps) {
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  async function fetchCampaign() {
    try {
      const response = await fetch(`/api/admin/shop/campaigns/${campaignId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch campaign');
      }
      
      setCampaign(data.campaign);
    } catch (err) {
      console.error('Error fetching campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Campaign</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchCampaign}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!campaign) return null;

  const initialData = {
    title: campaign.title,
    slug: campaign.slug,
    description: campaign.description || '',
    heroImageUrl: campaign.heroImageUrl || '',
    startsAt: new Date(campaign.startsAt).toISOString().slice(0, 16),
    endsAt: new Date(campaign.endsAt).toISOString().slice(0, 16),
    status: campaign.status
  };

  return <CampaignForm campaignId={campaignId} initialData={initialData} />;
}

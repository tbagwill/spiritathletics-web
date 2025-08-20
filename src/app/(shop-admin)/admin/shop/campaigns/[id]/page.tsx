import { Suspense } from 'react';
import EditCampaignForm from './EditCampaignForm';

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Campaign</h1>
        <p className="text-gray-600">Update campaign details and settings</p>
      </div>

      <Suspense 
        fallback={
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
              <p className="text-gray-600 font-medium">Loading campaign...</p>
            </div>
          </div>
        }
      >
        <EditCampaignForm campaignId={id} />
      </Suspense>
    </div>
  );
}

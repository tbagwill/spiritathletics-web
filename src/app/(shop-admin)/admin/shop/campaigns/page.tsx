import { Suspense } from 'react';
import CampaignsManager from './CampaignsManager';

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-600">Create and manage pop-up shop campaigns</p>
        </div>
      </div>

      <Suspense 
        fallback={
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
              <p className="text-gray-600 font-medium">Loading campaigns...</p>
            </div>
          </div>
        }
      >
        <CampaignsManager />
      </Suspense>
    </div>
  );
}

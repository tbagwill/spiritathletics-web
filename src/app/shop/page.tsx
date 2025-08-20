import { Suspense } from 'react';
import ShopContent from './ShopContent';

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense 
          fallback={
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                </div>
                <p className="text-gray-600 font-medium">Loading shop...</p>
              </div>
            </div>
          }
        >
          <ShopContent />
        </Suspense>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Spirit Athletics Shop - Limited Time Pop-Up Store',
  description: 'Shop exclusive Spirit Athletics apparel and merchandise during our limited-time pop-up campaigns.',
};

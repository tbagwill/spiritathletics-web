import { Suspense } from 'react';
import SuccessContent from './SuccessContent';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense 
          fallback={
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"></div>
                </div>
                <p className="text-gray-600 font-medium">Loading order details...</p>
              </div>
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Order Confirmed - Spirit Athletics Shop',
  description: 'Your Spirit Athletics order has been successfully placed!'
};

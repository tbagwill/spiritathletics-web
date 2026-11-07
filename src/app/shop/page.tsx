import { Suspense } from 'react';
import ShopContent from './ShopContent';

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-canvas font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <div className="mx-auto grid max-w-2xl gap-4 py-16" aria-label="Loading shop">
              <div className="skeleton h-40 rounded-3xl" />
              <div className="skeleton h-24 rounded-3xl" />
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

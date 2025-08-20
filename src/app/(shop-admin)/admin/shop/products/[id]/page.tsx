import { Suspense } from 'react';
import EditProductForm from './EditProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600">Update product details and pricing</p>
      </div>

      <Suspense 
        fallback={
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
              <p className="text-gray-600 font-medium">Loading product...</p>
            </div>
          </div>
        }
      >
        <EditProductForm productId={id} />
      </Suspense>
    </div>
  );
}

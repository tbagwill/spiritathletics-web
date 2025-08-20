'use client';

import { useState, useEffect } from 'react';
import ProductForm from '../ProductForm';

interface EditProductFormProps {
  productId: string;
}

export default function EditProductForm({ productId }: EditProductFormProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  async function fetchProduct() {
    try {
      const response = await fetch(`/api/admin/shop/products/${productId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch product');
      }
      
      setProduct(data.product);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err instanceof Error ? err.message : 'Failed to load product');
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
          <p className="text-gray-600 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Product</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchProduct}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const initialData = {
    campaignId: product.campaign.id,
    name: product.name,
    slug: product.slug,
    basePrice: product.basePrice / 100, // Convert from cents
    description: product.description || '',
    imageUrl: product.imageUrl || '',
    sizes: product.sizes.map((size: any) => ({
      label: size.label,
      priceDelta: size.priceDelta / 100 // Convert from cents
    }))
  };

  return <ProductForm productId={productId} initialData={initialData} />;
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Campaign {
  id: string;
  title: string;
  status: string;
}

interface ProductSize {
  label: string;
  priceDelta: number;
}

interface ProductFormProps {
  productId?: string;
  initialData?: {
    campaignId: string;
    name: string;
    slug: string;
    basePrice: number;
    description: string;
    imageUrl: string;
    sizes: ProductSize[];
  };
}

export default function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  
  const [formData, setFormData] = useState({
    campaignId: initialData?.campaignId || '',
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    basePrice: initialData?.basePrice || 0,
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    sizes: initialData?.sizes || [{ label: 'S', priceDelta: 0 }] as ProductSize[],
  });

  // Common size options (ordered from smallest to largest)
  const commonSizes = ['YS', 'YM', 'YL', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  // Size ordering function
  const getSizeOrder = (size: string): number => {
    const sizeOrder = ['YS', 'YM', 'YL', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    const index = sizeOrder.indexOf(size);
    return index === -1 ? 999 : index; // Unknown sizes go to the end
  };

  // Sort sizes by proper order
  const sortedSizes = [...formData.sizes].sort((a, b) => 
    getSizeOrder(a.label) - getSizeOrder(b.label)
  );

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (!productId && formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, productId, formData.slug]);

  async function fetchCampaigns() {
    try {
      const response = await fetch('/api/admin/shop/campaigns');
      const data = await response.json();
      
      if (response.ok) {
        setCampaigns(data.campaigns.filter((c: Campaign) => c.status === 'ACTIVE' || c.status === 'DRAFT'));
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = productId 
        ? `/api/admin/shop/products/${productId}`
        : '/api/admin/shop/products';
      
      const method = productId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      router.push('/admin/shop/products');
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: string, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleSizeChange(index: number, field: 'label' | 'priceDelta', value: string | number) {
    const newSizes = [...formData.sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setFormData(prev => ({ ...prev, sizes: newSizes }));
  }

  function addSize() {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { label: '', priceDelta: 0 }]
    }));
  }

  function removeSize(index: number) {
    if (formData.sizes.length > 1) {
      setFormData(prev => ({
        ...prev,
        sizes: prev.sizes.filter((_, i) => i !== index)
      }));
    }
  }

  function addCommonSizes() {
    const currentLabels = formData.sizes.map(s => s.label);
    const newSizes = commonSizes
      .filter(size => !currentLabels.includes(size))
      .map(size => ({ label: size, priceDelta: 0 }));
    
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, ...newSizes]
    }));
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h6a2 2 0 012 2v4m-6 6v7m8-3v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4m8-3V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Campaigns</h3>
        <p className="text-gray-600 mb-6">You need to create an active campaign before adding products</p>
        <Link
          href="/admin/shop/campaigns/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Create Campaign First
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Product Details</h3>
          
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
            {/* Campaign Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign *
              </label>
              <select
                value={formData.campaignId}
                onChange={(e) => handleChange('campaignId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
                required
              >
                <option value="">Select a campaign</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.title} ({campaign.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 placeholder-gray-500"
                placeholder="e.g. Spirit Athletics T-Shirt"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 placeholder-gray-500"
                placeholder="spirit-athletics-t-shirt"
                pattern="^[a-z0-9-]+$"
                title="Only lowercase letters, numbers, and hyphens allowed"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Used in the product URL - only lowercase letters, numbers, and hyphens
              </p>
            </div>

            {/* Base Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.basePrice}
                  onChange={(e) => handleChange('basePrice', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 placeholder-gray-500"
                  placeholder="25.00"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Base price - size-specific pricing adjustments can be added below
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
                placeholder="Product description..."
              />
            </div>

            {/* Product Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 placeholder-gray-500"
                placeholder="https://example.com/product-image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Direct URL to product image (recommended: 400x400px or larger)
              </p>
            </div>
          </div>
        </div>

        {/* Product Sizes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Product Sizes</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addCommonSizes}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
              >
                Add Common Sizes
              </button>
              <button
                type="button"
                onClick={addSize}
                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
              >
                + Add Size
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {sortedSizes.map((size, sortedIndex) => {
              const originalIndex = formData.sizes.findIndex(s => s.label === size.label && s.priceDelta === size.priceDelta);
              return (
              <div key={sortedIndex} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Size Label</label>
                  <input
                    type="text"
                    value={size.label}
                    onChange={(e) => handleSizeChange(originalIndex, 'label', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 placeholder-gray-500"
                    placeholder="S, M, L, etc."
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Price Adjustment</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={size.priceDelta}
                      onChange={(e) => handleSizeChange(originalIndex, 'priceDelta', parseFloat(e.target.value) || 0)}
                      className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900 placeholder-gray-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 mb-1">Final Price</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${(formData.basePrice + size.priceDelta).toFixed(2)}
                  </span>
                </div>
                {formData.sizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSize(originalIndex)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Remove size"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              );
            })}
          </div>

          <p className="text-xs text-gray-500 mt-3">
            * Price adjustments will be added to the base price. Use negative values for discounts on certain sizes.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Saving...' : (productId ? 'Update Product' : 'Create Product')}
          </button>
          <Link
            href="/admin/shop/products"
            className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

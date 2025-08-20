'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Campaign {
  id: string;
  title: string;
  status: string;
}

interface ProductSize {
  id: string;
  label: string;
  priceDelta: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  description: string | null;
  imageUrl: string | null;
  campaign: Campaign;
  sizes: ProductSize[];
  orderItems: any[];
  createdAt: string;
}

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCampaigns()]);
  }, []);

  async function fetchProducts(campaignId?: string) {
    try {
      const url = campaignId && campaignId !== 'all' 
        ? `/api/admin/shop/products?campaignId=${campaignId}`
        : '/api/admin/shop/products';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }
      
      setProducts(data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCampaigns() {
    try {
      const response = await fetch('/api/admin/shop/campaigns');
      const data = await response.json();
      
      if (response.ok) {
        setCampaigns(data.campaigns);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/shop/products/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete product');
      }

      setProducts(products.filter(p => p.id !== id));
      showToast('success', 'Product deleted successfully');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete product');
    }
  }

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  }

  function handleCampaignFilter(campaignId: string) {
    setSelectedCampaign(campaignId);
    setLoading(true);
    fetchProducts(campaignId);
  }

  function formatPrice(cents: number): string {
    return (cents / 100).toFixed(2);
  }

  function getSizeDisplayPrice(basePrice: number, priceDelta: number): string {
    return formatPrice(basePrice + priceDelta);
  }

  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Products</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => fetchProducts()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-xl transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Campaign
            </label>
            <select
              value={selectedCampaign}
              onChange={(e) => handleCampaignFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
            >
              <option value="all">All Campaigns</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.title} ({campaign.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeCampaigns.length > 0 ? (
          <Link
            href="/admin/shop/products/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Link>
        ) : (
          <div className="text-sm text-gray-500">
            Create an active campaign first to add products
          </div>
        )}
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedCampaign === 'all' ? 'No products yet' : 'No products in this campaign'}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeCampaigns.length > 0 
              ? 'Add your first product to start selling merchandise'
              : 'Create an active campaign first, then add products to it'
            }
          </p>
          {activeCampaigns.length > 0 && (
            <Link
              href="/admin/shop/products/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Add Your First Product
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                  <span className="text-lg font-bold text-blue-600 whitespace-nowrap ml-2">
                    ${formatPrice(product.basePrice)}+
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2">{product.campaign.title}</p>

                {product.description && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Sizes */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">Available Sizes:</p>
                  <div className="flex flex-wrap gap-1">
                    {product.sizes.map((size) => (
                      <span
                        key={size.id}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                        title={`$${getSizeDisplayPrice(product.basePrice, size.priceDelta)}`}
                      >
                        {size.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{product.orderItems.length} sold</span>
                  <span>{product.sizes.length} sizes</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/shop/products/${product.id}`}
                    className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors text-center"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/shop`}
                    target="_blank"
                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-center"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={product.orderItems.length > 0}
                    title={product.orderItems.length > 0 ? 'Cannot delete product with orders' : 'Delete product'}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

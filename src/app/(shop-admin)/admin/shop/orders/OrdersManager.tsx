'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Campaign {
  id: string;
  title: string;
  status: string;
}

interface Product {
  id: string;
  name: string;
  imageUrl: string | null;
}

interface ProductSize {
  id: string;
  label: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: Product;
  size: ProductSize;
}

interface Order {
  id: string;
  email: string;
  customerName: string | null;
  subtotalCents: number;
  totalCents: number;
  stripePaymentId: string | null;
  status: 'PAID' | 'REFUNDED' | 'CANCELED';
  createdAt: string;
  campaign: Campaign;
  lineItems: OrderItem[];
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  summary: {
    totalOrders: number;
    totalRevenue: number;
    totalItems: number;
    averageOrderValue: number;
  };
}

export default function OrdersManager() {
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([fetchOrders(), fetchCampaigns()]);
  }, []);

  async function fetchOrders(campaignId?: string, status?: string) {
    try {
      const params = new URLSearchParams();
      if (campaignId && campaignId !== 'all') params.set('campaignId', campaignId);
      if (status && status !== 'all') params.set('status', status);
      
      const response = await fetch(`/api/admin/shop/orders?${params}`);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to fetch orders');
      }
      
      setData(responseData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  async function fetchCampaigns() {
    try {
      const response = await fetch('/api/admin/shop/campaigns');
      const responseData = await response.json();
      
      if (response.ok) {
        setCampaigns(responseData.campaigns);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  }

  async function exportOrders() {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (selectedCampaign !== 'all') params.set('campaignId', selectedCampaign);
      params.set('format', 'csv');
      
      const response = await fetch(`/api/admin/shop/orders/export?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to export orders');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shop-orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting orders:', err);
      alert('Failed to export orders');
    } finally {
      setExporting(false);
    }
  }

  function handleFilterChange(type: 'campaign' | 'status', value: string) {
    if (type === 'campaign') {
      setSelectedCampaign(value);
      fetchOrders(value, selectedStatus);
    } else {
      setSelectedStatus(value);
      fetchOrders(selectedCampaign, value);
    }
    setLoading(true);
  }

  function formatPrice(cents: number): string {
    return (cents / 100).toFixed(2);
  }

  function getStatusBadge(status: Order['status']) {
    const styles = {
      PAID: 'bg-green-100 text-green-800',
      REFUNDED: 'bg-yellow-100 text-yellow-800',
      CANCELED: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.toLowerCase()}
      </span>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Orders</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => fetchOrders()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                <dd className="text-lg font-medium text-gray-900">{data.summary.totalOrders}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                <dd className="text-lg font-medium text-gray-900">${formatPrice(data.summary.totalRevenue)}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Items Sold</dt>
                <dd className="text-lg font-medium text-gray-900">{data.summary.totalItems}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Avg Order Value</dt>
                <dd className="text-lg font-medium text-gray-900">${formatPrice(data.summary.averageOrderValue)}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign
            </label>
            <select
              value={selectedCampaign}
              onChange={(e) => handleFilterChange('campaign', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
            >
              <option value="all">All Campaigns</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
            >
              <option value="all">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="REFUNDED">Refunded</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>
        </div>

        <button
          onClick={exportOrders}
          disabled={exporting || data.orders.length === 0}
          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
        >
          {exporting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </>
          )}
        </button>
      </div>

      {/* Orders List */}
      {data.orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">No orders match your current filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {data.orders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        Order #{order.id.slice(-8)}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="font-medium text-gray-500">Customer:</span>
                        <div className="text-gray-900">
                          {order.customerName || 'N/A'}
                          <div className="text-gray-600">{order.email}</div>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Campaign:</span>
                        <div className="text-gray-900">{order.campaign.title}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Date:</span>
                        <div className="text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Total:</span>
                        <div className="text-gray-900 font-semibold">
                          ${formatPrice(order.totalCents)}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Items Ordered:</h4>
                      <div className="space-y-2">
                        {order.lineItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                            {item.product.imageUrl && (
                              <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                <Image
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {item.product.name} ({item.size.label})
                                </span>
                                <span className="text-sm text-gray-600 whitespace-nowrap ml-2">
                                  {item.quantity}x ${formatPrice(item.unitPrice)} = ${formatPrice(item.lineTotal)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

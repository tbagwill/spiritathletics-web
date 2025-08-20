'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface OrderDetails {
  id: string;
  customerName: string | null;
  email: string;
  totalCents: number;
  createdAt: string;
  campaign: {
    title: string;
    slug: string;
  };
  lineItems: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    product: {
      name: string;
      imageUrl: string | null;
    };
    size: {
      label: string;
    };
  }>;
}

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      fetchOrderDetails(sessionId);
    } else {
      setError('No session ID provided');
      setLoading(false);
    }
  }, [sessionId]);

  async function fetchOrderDetails(sessionId: string, retryCount = 0) {
    try {
      const response = await fetch(`/api/shop/orders/by-session/${sessionId}`);
      const data = await response.json();
      
      if (!response.ok) {
        // If order not found and it's the first few attempts, retry
        if (response.status === 404 && retryCount < 3) {
          setTimeout(() => {
            fetchOrderDetails(sessionId, retryCount + 1);
          }, (3 + retryCount * 2) * 1000);
          return;
        }
        throw new Error(data.error || 'Failed to fetch order details');
      }
      
      setOrder(data.order);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err instanceof Error ? err.message : 'Failed to load order details');
    } finally {
      if (retryCount === 0 || retryCount >= 3) {
        setLoading(false);
      }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"></div>
        </div>
        <p className="text-gray-600 font-medium">Loading your order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-red-900 mb-2">Unable to Load Order</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Link
            href="/shop"
            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Order Confirmed!
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Thank you for your Spirit Athletics order, {order.customerName || 'valued customer'}!
        </p>
        <p className="text-gray-600">
          A confirmation email has been sent to <strong>{order.email}</strong>
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
          <p className="text-sm text-gray-600">Order #{order.id.slice(-8).toUpperCase()}</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign</h3>
            <p className="text-gray-600">{order.campaign.title}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Items Ordered</h3>
            
            {order.lineItems.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                {item.product.imageUrl && (
                  <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                  <p className="text-sm text-gray-600">Size: {item.size.label}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ${(item.lineTotal / 100).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    ${(item.unitPrice / 100).toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
              <span>Total Paid:</span>
              <span>${(order.totalCents / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">What Happens Next?</h3>
        <div className="space-y-2 text-blue-800">
          <p>✅ Your preorder has been confirmed and payment processed</p>
          <p>📧 You'll receive a confirmation email with all the details</p>
          <p>📦 Orders will be placed with our suppliers once the campaign closes</p>
          <p>🚚 Your items will be shipped within 2-3 weeks after campaign end</p>
          <p>📱 We'll send you tracking information when your order ships</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/shop"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-center"
        >
          Continue Shopping
        </Link>
        <Link
          href="/"
          className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors text-center"
        >
          Back to Home
        </Link>
      </div>

      {/* Support */}
      <div className="text-center text-sm text-gray-500">
        <p>Questions about your order?</p>
        <p>
          Contact us at{' '}
          <a href="mailto:support@spiritathletics.com" className="text-blue-600 hover:text-blue-800">
            support@spiritathletics.com
          </a>
        </p>
      </div>
    </div>
  );
}

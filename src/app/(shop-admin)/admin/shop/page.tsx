import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function ShopAdminDashboard() {
  // Get shop statistics
  const [campaigns, totalOrders, totalRevenue] = await Promise.all([
    prisma.shopCampaign.findMany({
      include: {
        products: true,
        orders: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.shopOrder.count(),
    prisma.shopOrder.aggregate({
      _sum: { totalCents: true }
    })
  ]);

  const revenueTotal = (totalRevenue._sum.totalCents || 0) / 100;

  // Get active campaign
  const now = new Date();
  const activeCampaign = campaigns.find(c => 
    c.status === 'ACTIVE' && 
    now >= c.startsAt && 
    now <= c.endsAt
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Shop Admin Dashboard</h1>
        <p className="text-gray-600">Manage Spirit Athletics pop-up shop campaigns and products</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                <dt className="text-sm font-medium text-gray-500 truncate">Total Campaigns</dt>
                <dd className="text-lg font-medium text-gray-900">{campaigns.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                <dd className="text-lg font-medium text-gray-900">{totalOrders}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                <dd className="text-lg font-medium text-gray-900">${revenueTotal.toFixed(2)}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Active Campaign Status */}
      {activeCampaign ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-green-900">Active Campaign</h3>
              <p className="text-green-700">{activeCampaign.title}</p>
              <p className="text-sm text-green-600 mt-1">
                Ends {activeCampaign.endsAt.toLocaleDateString()} at {activeCampaign.endsAt.toLocaleTimeString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-900">{activeCampaign.orders.length}</div>
              <div className="text-sm text-green-600">orders</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Campaign</h3>
            <p className="text-gray-600 mb-4">Create a new pop-up campaign to start selling products</p>
            <Link
              href="/admin/shop/campaigns"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Create Campaign
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/shop/campaigns"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h6a2 2 0 012 2v4m-6 6v7m8-3v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4m8-3V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Manage Campaigns</p>
              <p className="text-sm text-gray-500">Create and edit pop-up windows</p>
            </div>
          </Link>

          <Link
            href="/admin/shop/products"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Manage Products</p>
              <p className="text-sm text-gray-500">Add and edit merchandise</p>
            </div>
          </Link>

          <Link
            href="/admin/shop/orders"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">View Orders</p>
              <p className="text-sm text-gray-500">Export and fulfill orders</p>
            </div>
          </Link>

          <Link
            href="/shop"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">View Shop</p>
              <p className="text-sm text-gray-500">See customer experience</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

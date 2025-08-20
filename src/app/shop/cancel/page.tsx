import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Cancel Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Header */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            No worries! Your payment was not processed and your cart is still saved.
          </p>

          {/* What Happened */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What happened?</h2>
            <div className="space-y-2 text-gray-600">
              <p>• Your payment was cancelled before completion</p>
              <p>• No charges were made to your payment method</p>
              <p>• Your cart items are still saved and ready for checkout</p>
              <p>• The campaign window is still open for orders</p>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Having trouble?</h3>
            <div className="space-y-2 text-blue-800 text-sm">
              <p><strong>Payment issues?</strong> Try a different payment method or check your card details</p>
              <p><strong>Browser problems?</strong> Clear your cache or try a different browser</p>
              <p><strong>Mobile issues?</strong> Try completing your order on a desktop computer</p>
              <p><strong>Still stuck?</strong> Contact us and we'll help you complete your order</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Return to Shop & Try Again
              </Link>
              <Link
                href="/"
                className="px-8 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
              >
                Back to Home
              </Link>
            </div>
            
            {/* Support Contact */}
            <div className="pt-4">
              <p className="text-sm text-gray-500 mb-2">Need help completing your order?</p>
              <a
                href="mailto:support@spiritathletics.com"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Contact Support →
              </a>
            </div>
          </div>

          {/* Urgency Note */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium text-sm">
              ⏰ Remember: This is a limited-time pop-up shop! 
              <br />
              The ordering window will close soon, so don't wait too long to complete your purchase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Payment Cancelled - Spirit Athletics Shop',
  description: 'Your payment was cancelled. Return to complete your Spirit Athletics order.'
};

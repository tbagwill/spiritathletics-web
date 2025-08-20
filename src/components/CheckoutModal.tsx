'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { state, getTotalItems, getTotalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare cart items for API
      const cartItems = state.items.map(item => ({
        productId: item.productId,
        sizeId: item.sizeId,
        quantity: item.quantity
      }));

      const response = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems,
          customerEmail: formData.email,
          customerName: formData.name.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      // Clear cart and redirect to Stripe
      clearCart();
      onClose();
      window.location.href = data.url;

    } catch (error) {
      console.error('Checkout error:', error);
      alert(`Checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Checkout</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Order Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{getTotalItems()} items</span>
                <span>${(getTotalPrice() / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>${(getTotalPrice() / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Name Input (Required) */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Your full name"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="mb-6">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className={`mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                    errors.agreeToTerms ? 'border-red-500' : ''
                  }`}
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-700">
                  I agree to the <a href="#" className="text-blue-600 hover:text-blue-800">Terms of Service</a> and understand 
                  this is a preorder. Items will be ordered in bulk when the campaign closes and shipped within 2-3 weeks. *
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-red-600 text-sm mt-1">{errors.agreeToTerms}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isSubmitting || getTotalItems() === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  `Complete Order - $${(getTotalPrice() / 100).toFixed(2)}`
                )}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Security Notice */}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2zm10-12V9a4 4 0 00-8 0v2m8 0V9a4 4 0 00-4-4 4 4 0 00-4 4v2" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-green-800">Secure Payment</p>
                  <p className="text-xs text-green-700">
                    Your payment information is encrypted and processed securely by Stripe. 
                    We support Apple Pay, Google Pay, and all major credit cards.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

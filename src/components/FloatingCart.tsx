'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import CheckoutModal from '@/components/CheckoutModal';

export default function FloatingCart() {
  const { state, updateQuantity, removeItem, getTotalItems, getTotalPrice } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const toggleCart = () => setIsOpen(!isOpen);
  const openCheckout = () => {
    setIsCheckoutOpen(true);
    setIsOpen(false); // Close cart when opening checkout
  };

  if (getTotalItems() === 0) {
    return null; // Don't show if cart is empty
  }

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={toggleCart}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-105"
      >
        <div className="relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {getTotalItems()}
          </span>
        </div>
      </button>

      {/* Cart Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 overflow-hidden">
          {/* Background overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={toggleCart}
          />
          
          {/* Cart sidebar */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
              <button
                onClick={toggleCart}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={`${item.productId}-${item.sizeId}`} className="flex gap-4 bg-gray-50 rounded-lg p-3">
                    {item.imageUrl && (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{item.productName}</h3>
                      <p className="text-sm text-gray-500">Size: {item.sizeName}</p>
                      <p className="text-sm font-medium text-blue-600">${(item.price / 100).toFixed(2)}</p>
                      
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.sizeId, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.sizeId, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.productId, item.sizeId)}
                          className="ml-2 text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-blue-600">
                  ${(getTotalPrice() / 100).toFixed(2)}
                </span>
              </div>
              
              <div className="space-y-2">
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  onClick={openCheckout}
                >
                  Checkout
                </button>
                
                <button
                  onClick={toggleCart}
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
              
              {/* Preorder Notice */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>Preorder:</strong> Items will be ordered when the campaign closes and shipped within 2-3 weeks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </>
  );
}
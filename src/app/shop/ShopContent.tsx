'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import Image from 'next/image';

interface ShopCampaign {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  heroImageUrl: string | null;
  startsAt: string;
  endsAt: string;
  status: string;
  products: ShopProduct[];
}

interface ShopProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  description: string | null;
  imageUrl: string | null;
  imageUrls?: string[];
  sizingChartUrl?: string | null;
  sizes: ProductSize[];
}

interface ProductSize {
  id: string;
  label: string;
  priceDelta: number;
}

export default function ShopContent() {
  const { data: session } = useSession();
  const [campaign, setCampaign] = useState<ShopCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShopAdmin, setIsShopAdmin] = useState(false);

  useEffect(() => {
    async function fetchActiveCampaign() {
      try {
        const response = await fetch('/api/shop/campaigns/active');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch campaign');
        }
        
        setCampaign(data.campaign);
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError(err instanceof Error ? err.message : 'Failed to load shop');
      } finally {
        setLoading(false);
      }
    }

    fetchActiveCampaign();
  }, []);

  // Check if user has shop admin access
  useEffect(() => {
    async function checkAdminAccess() {
      if (!session?.user) return;
      
      try {
        const response = await fetch('/api/admin/shop/access-check');
        const data = await response.json();
        setIsShopAdmin(data.hasAccess || false);
      } catch (err) {
        // Silently fail - admin button just won't show
        setIsShopAdmin(false);
      }
    }

    checkAdminAccess();
  }, [session]);

  if (loading) {
    return (
      <>
        {/* Admin Button - Always visible to shop admins */}
        {isShopAdmin && (
          <div className="fixed top-4 right-4 z-50">
            <Link
              href="/admin/shop"
              className="inline-flex items-center px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg shadow-lg transition-colors"
              title="Shop Admin Dashboard"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin
            </Link>
          </div>
        )}
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading shop...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {/* Admin Button - Always visible to shop admins */}
        {isShopAdmin && (
          <div className="fixed top-4 right-4 z-50">
            <Link
              href="/admin/shop"
              className="inline-flex items-center px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg shadow-lg transition-colors"
              title="Shop Admin Dashboard"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin
            </Link>
          </div>
        )}
        <div className="text-center py-16">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-red-900 mb-2">Unable to Load Shop</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!campaign) {
    return (
      <>
        {/* Admin Button - Always visible to shop admins */}
        {isShopAdmin && (
          <div className="fixed top-4 right-4 z-50">
            <Link
              href="/admin/shop"
              className="inline-flex items-center px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg shadow-lg transition-colors"
              title="Shop Admin Dashboard"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin
            </Link>
          </div>
        )}
        <div className="text-center py-16">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 mb-8 overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-indigo-500 -mt-8 mb-6" />
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center ring-2 ring-blue-100">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-blue-900 mb-2">
                No Pop-Up Currently Open
              </h1>
              <p className="text-base sm:text-lg text-gray-700 mb-6">
                Our pop-up shop isn't currently running, but the next window is coming soon! 
                We'll have exclusive Spirit Athletics apparel and merchandise available for a limited time.
              </p>
              <div className="bg-blue-50/80 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  <strong>How it works:</strong> We open pop-up campaigns with limited-time ordering windows. 
                  Once the window closes, we place bulk orders and fulfill them within 2-3 weeks.
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Want to be notified when the next pop-up opens?
                </p>
                <Link 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md"
                >
                  Contact Us for Updates
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const timeRemaining = getTimeRemaining(campaign.endsAt);
  const isActive = new Date() < new Date(campaign.endsAt) && campaign.status === 'ACTIVE';

  return (
    <div className="space-y-8">
      {/* Admin Button - Only visible to shop admins */}
      {isShopAdmin && (
        <div className="fixed top-4 right-4 z-50">
          <Link
            href="/admin/shop"
            className="inline-flex items-center px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg shadow-lg transition-colors"
            title="Shop Admin Dashboard"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin
          </Link>
        </div>
      )}

      {/* Campaign Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {campaign.heroImageUrl && (
          <div className="relative h-64 sm:h-80">
            <Image
              src={campaign.heroImageUrl}
              alt={campaign.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl sm:text-5xl font-bold mb-4">{campaign.title}</h1>
                {isActive && timeRemaining && (
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3">
                    <p className="text-lg font-medium">Time Remaining:</p>
                    <p className="text-2xl font-bold">{timeRemaining}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="p-6 sm:p-8">
          {!campaign.heroImageUrl && (
            <div className="text-center mb-6">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{campaign.title}</h1>
              {isActive && timeRemaining && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-3 inline-block">
                  <p className="text-blue-800 font-medium">Time Remaining:</p>
                  <p className="text-2xl font-bold text-blue-900">{timeRemaining}</p>
                </div>
              )}
            </div>
          )}
          
          {campaign.description && (
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
              {campaign.description}
            </p>
          )}

          {!isActive && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
              <p className="text-red-800 font-medium text-center">
                This campaign has ended. Thank you for your interest!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {campaign.products.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Available Products
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {campaign.products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                campaignSlug={campaign.slug}
                disabled={!isActive}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ 
  product, 
  campaignSlug, 
  disabled 
}: { 
  product: ShopProduct; 
  campaignSlug: string;
  disabled: boolean;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const basePrice = product.basePrice / 100;
  const minPrice = Math.min(...product.sizes.map(s => product.basePrice + s.priceDelta)) / 100;
  const maxPrice = Math.max(...product.sizes.map(s => product.basePrice + s.priceDelta)) / 100;
  
  const priceDisplay = minPrice === maxPrice 
    ? `$${minPrice.toFixed(2)}`
    : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;

  const currentPrice = selectedSize 
    ? (product.basePrice + selectedSize.priceDelta)
    : product.basePrice;

  // Size ordering function
  const getSizeOrder = (size: string): number => {
    const sizeOrder = ['YS', 'YM', 'YL', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    const index = sizeOrder.indexOf(size);
    return index === -1 ? 999 : index; // Unknown sizes go to the end
  };

  // Sort sizes by proper order
  const sortedSizes = [...product.sizes].sort((a, b) => 
    getSizeOrder(a.label) - getSizeOrder(b.label)
  );

  // Set initial size to first sorted size
  useEffect(() => {
    if (!selectedSize && sortedSizes.length > 0) {
      setSelectedSize(sortedSizes[0]);
    }
  }, [selectedSize, sortedSizes]);

  function handleAddToCart() {
    if (!selectedSize || disabled) return;

    addItem({
      productId: product.id,
      sizeId: selectedSize.id,
      productName: product.name,
      sizeName: selectedSize.label,
      price: currentPrice,
      imageUrl: ((product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls[0] : product.imageUrl) || undefined
    });
    
    // FloatingCart will automatically show the new item
  }

  const images = (product.imageUrls && product.imageUrls.length > 0)
    ? product.imageUrls
    : (product.imageUrl ? [product.imageUrl] : []);
  const [imgIndex, setImgIndex] = useState(0);
  useEffect(() => { setImgIndex(0); }, [product.id]);
  const primaryImage = images[imgIndex] || null;

  const CardContent = (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all duration-200 ${
      disabled ? 'opacity-60' : 'hover:shadow-lg hover:scale-105'
    }`}>
      {primaryImage ? (
        images.length > 1 ? (
          <div className="relative h-48">
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover"
            />
            {/* Prev/Next controls */}
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImgIndex((imgIndex - 1 + images.length) % images.length); }}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImgIndex((imgIndex + 1) % images.length); }}
              aria-label="Next image"
            >
              ›
            </button>
            {/* Dots */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`w-2 h-2 rounded-full ${i === imgIndex ? 'bg-white' : 'bg-white/60'}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImgIndex(i); }}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="relative h-48">
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        )
      ) : (
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-blue-600">
            ${(currentPrice / 100).toFixed(2)}
          </span>
          {!disabled && (
            <span className="text-sm text-gray-500">
              {product.sizes.length} sizes
            </span>
          )}
        </div>

        {/* Size Selection */}
        {!disabled && product.sizes.length > 0 && (
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Size:</label>
            <select
              value={selectedSize?.id || ''}
              onChange={(e) => {
                const size = product.sizes.find(s => s.id === e.target.value);
                setSelectedSize(size || null);
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              {sortedSizes.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label} - ${((product.basePrice + size.priceDelta) / 100).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sizing Guide Link */}
        {product.sizingChartUrl && (
          <div className="mt-2">
            <a href={product.sizingChartUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 underline">
              View sizing guide
            </a>
          </div>
        )}

        {/* Add to Cart Button */}
        {!disabled && (
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );

  return CardContent;
}

function getTimeRemaining(endDate: string): string | null {
  const now = new Date();
  const end = new Date(endDate);
  const difference = end.getTime() - now.getTime();

  if (difference <= 0) return null;

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ShowcasePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup in this session
    const hasSeenPopup = sessionStorage.getItem('showcasePopupSeen');
    
    if (!hasSeenPopup) {
      // Show popup after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('showcasePopupSeen', 'true');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Popup Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden pointer-events-auto transform animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
            aria-label="Close popup"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 text-white px-8 py-12 text-center relative overflow-hidden">
            {/* Floating decorative elements */}
            <div className="absolute top-4 left-8 w-16 h-16 bg-white opacity-10 rounded-full animate-float"></div>
            <div className="absolute bottom-6 right-12 w-12 h-12 bg-yellow-400 opacity-20 rounded-full animate-float-delayed"></div>
            
            <div className="relative z-10">
              <div className="inline-block bg-yellow-400 text-blue-900 px-4 py-2 rounded-full font-bold text-sm mb-4 animate-pulse">
                🎉 THIS WEEK!
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">
                Fall Showcase 2025
              </h2>
              <p className="text-xl text-blue-100">
                Don't Miss Our Biggest Event of the Season!
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <span className="text-3xl mr-3">📍</span>
                <div>
                  <div className="font-bold text-gray-900">Granite Hills High School</div>
                  <div className="text-gray-600 text-sm">Apple Valley, CA</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <span className="text-3xl mr-3">🕐</span>
                <div>
                  <div className="font-bold text-gray-900">Event Begins at 1:00 PM</div>
                  <div className="text-gray-600 text-sm">Doors open at 12:15 PM • Ticketing at 11:30 AM</div>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                <div className="flex items-start">
                  <span className="text-2xl mr-2">⚡</span>
                  <div>
                    <p className="font-bold text-yellow-900 mb-1">Purchase Tickets in Advance!</p>
                    <p className="text-sm text-gray-700">
                      Skip the lines and guarantee your entry. Live performances, vendors, games, and more await!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/showcase"
                onClick={handleClose}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center font-bold px-6 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                📋 View Full Details
              </Link>
              <a
                href="https://buytickets.at/spiritathletics/1936402"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 text-center font-bold px-6 py-4 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🎫 Get Tickets
              </a>
            </div>

            <button
              onClick={handleClose}
              className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Close and continue to website
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


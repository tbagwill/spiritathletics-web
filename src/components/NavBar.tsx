'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';

const NavBar = () => {
  const { getTotalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false); // mobile accordion
  const [isAboutHoverOpen, setIsAboutHoverOpen] = useState(false); // desktop hover

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsAboutOpen(false);
  };

  // Exclude Home here; we'll render it first explicitly
  const mainLinks: { href: string; label: string }[] = [
    { href: '/programs', label: 'Programs' },
    { href: '/calendar', label: 'Calendar' },
    { href: '/book/classes', label: 'Classes' },
    { href: '/shop', label: 'Shop' },
    { href: '/parent-portal', label: 'Parent Portal' },
    { href: '/dashboard', label: 'Coaches Dashboard' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
              <Image
                src="/images/SpiritAthletics_Logo_WordMark-transparent.png"
                alt="Spirit Athletics Logo"
                width={180}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="ml-10 flex items-baseline space-x-1">
              {/* Home first */}
              <Link
                href="/"
                className="text-gray-900 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group"
                style={{ '--hover-color': '#1d4ed8' } as React.CSSProperties}
              >
                Home
                <span
                  className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-800 group-hover:w-full group-hover:left-0 transition-all duration-300"
                  style={{ background: 'linear-gradient(to right, #0000FE, #0000CC)' }}
                />
              </Link>

              {/* About dropdown (hover) */}
              <div
                className="relative"
                onMouseEnter={() => setIsAboutHoverOpen(true)}
                onMouseLeave={() => setIsAboutHoverOpen(false)}
              >
                <Link
                  href="/about"
                  className="text-gray-900 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  About
                </Link>
                {isAboutHoverOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white border border-blue-100 rounded-lg shadow-lg z-10">
                    <div className="py-2">
                      <Link href="/about" className="block px-4 py-2 text-sm text-gray-800 hover:bg-blue-50">About</Link>
                      <Link href="/staff" className="block px-4 py-2 text-sm text-gray-800 hover:bg-blue-50">Staff</Link>
                      <Link href="/forms" className="block px-4 py-2 text-sm text-gray-800 hover:bg-blue-50">Forms</Link>
                      <Link href="/contact" className="block px-4 py-2 text-sm text-gray-800 hover:bg-blue-50">Contact</Link>
                    </div>
                  </div>
                )}
              </div>

              {mainLinks.map((link: { href: string; label: string }) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={'text-gray-900 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group'}
                  style={{ '--hover-color': '#1d4ed8' } as React.CSSProperties}
                >
                  {link.label}
                  <span
                    className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-800 group-hover:w-full group-hover:left-0 transition-all duration-300"
                    style={{ background: 'linear-gradient(to right, #0000FE, #0000CC)' }}
                  />
                </Link>
              ))}
            </div>
            
            {/* Cart is now handled by FloatingCart component */}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-900 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 transition-colors"
              style={{ '--hover-color': '#1d4ed8', '--focus-ring-color': '#1d4ed8' } as React.CSSProperties}
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-sm border-t border-blue-100">
          {/* Home first */}
          <Link
            href="/"
            onClick={closeMenu}
            className="block text-gray-900 hover:text-blue-700 hover:bg-blue-50 px-3 py-3 rounded-lg text-base font-medium transition-colors duration-200"
          >
            Home
          </Link>

          {/* About expandable */}
          <button
            onClick={() => setIsAboutOpen((v) => !v)}
            className="w-full flex items-center justify-between text-left text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-3 rounded-lg text-base font-medium transition-colors duration-200"
          >
            <span>About</span>
            <svg className={`h-4 w-4 transform transition-transform ${isAboutOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 111.06 1.061l-4.24 4.24a.75.75 0 01-1.06 0l-4.24-4.24a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>
          {isAboutOpen && (
            <div className="ml-3 space-y-1">
              <Link href="/about" onClick={closeMenu} className="block px-3 py-2 rounded-lg text-gray-900 hover:text-blue-700 hover:bg-blue-50">About</Link>
              <Link href="/staff" onClick={closeMenu} className="block px-3 py-2 rounded-lg text-gray-900 hover:text-blue-700 hover:bg-blue-50">Staff</Link>
              <Link href="/forms" onClick={closeMenu} className="block px-3 py-2 rounded-lg text-gray-900 hover:text-blue-700 hover:bg-blue-50">Forms</Link>
              <Link href="/contact" onClick={closeMenu} className="block px-3 py-2 rounded-lg text-gray-900 hover:text-blue-700 hover:bg-blue-50">Contact</Link>
            </div>
          )}

          {mainLinks.map((link: { href: string; label: string }) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="block text-gray-900 hover:text-blue-700 hover:bg-blue-50 px-3 py-3 rounded-lg text-base font-medium transition-colors duration-200"
              style={{ '--hover-color': '#1d4ed8' } as React.CSSProperties}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Mobile Cart Button */}
          {/* Cart is now handled by FloatingCart component */}
        </div>
      </div>
      
    </nav>
  );
};

export default NavBar; 
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

function NavLink({ 
  href, 
  children, 
  exact = false 
}: { 
  href: string; 
  children: React.ReactNode; 
  exact?: boolean; 
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  
  return (
    <Link
      href={href}
      className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
        isActive
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </Link>
  );
}

export default function ShopAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  // Define navigation tabs
  const navTabs = [
    { href: '/admin/shop', label: 'Overview', exact: true },
    { href: '/admin/shop/campaigns', label: 'Campaigns' },
    { href: '/admin/shop/products', label: 'Products' },
    { href: '/admin/shop/orders', label: 'Orders' },
  ];

  // Find current tab index
  const getCurrentTabIndex = () => {
    return navTabs.findIndex(tab => 
      tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
    );
  };

  useEffect(() => {
    async function checkAccess() {
      try {
        const response = await fetch('/api/admin/shop/access-check');
        const data = await response.json();
        
        if (!data.hasAccess) {
          router.push('/dashboard-login');
          return;
        }
        
        setHasAccess(true);
      } catch (error) {
        console.error('Access check failed:', error);
        router.push('/dashboard-login');
      }
    }

    checkAccess();
  }, [router]);

  if (hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
          <p className="text-gray-600 font-medium">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden sm:flex space-x-8">
            {navTabs.map((tab) => (
              <NavLink key={tab.href} href={tab.href} exact={tab.exact}>
                {tab.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="sm:hidden">
            <div className="flex items-center justify-center py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {navTabs[getCurrentTabIndex()]?.label || 'Shop Admin'}
              </h2>
            </div>

            {/* Mobile Tab Navigation (scrollable) */}
            <div className="flex space-x-6 overflow-x-auto pb-2 scrollbar-hide">
              {navTabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`whitespace-nowrap text-sm font-medium transition-colors ${
                    (tab.exact ? pathname === tab.href : pathname.startsWith(tab.href))
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-2'
                      : 'text-gray-500 hover:text-gray-700 pb-2'
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

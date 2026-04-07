'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Props = {
  /** Unique key stored in localStorage so dismissal persists across page loads */
  id: string;
  message: string;
  linkHref?: string;
  linkLabel?: string;
};

export default function AnnouncementBanner({ id, message, linkHref, linkLabel }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if the user hasn't dismissed this specific banner before
    const dismissed = localStorage.getItem(`banner-dismissed-${id}`);
    if (!dismissed) setVisible(true);
  }, [id]);

  const dismiss = () => {
    localStorage.setItem(`banner-dismissed-${id}`, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="relative w-full text-white text-sm font-medium animate-fade-in"
      style={{ background: 'linear-gradient(90deg, #0000FE, #1d4ed8, #4169E1)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
        {/* Message */}
        <p className="text-center leading-snug">
          {message}
          {linkHref && linkLabel && (
            <>
              {' '}
              <Link
                href={linkHref}
                className="underline underline-offset-2 font-semibold hover:text-blue-100 transition-colors whitespace-nowrap"
              >
                {linkLabel} →
              </Link>
            </>
          )}
        </p>

        {/* Dismiss button */}
        <button
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1 rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

const CLAMP_LINES = 3;
// Rough character threshold — if shorter than this, never show the toggle
const SHORT_THRESHOLD = 180;

export default function ClinicDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isShort = text.length <= SHORT_THRESHOLD;

  return (
    <div className="mb-4">
      <p
        className={`text-gray-600 text-sm leading-relaxed transition-all duration-300 ${
          !expanded && !isShort ? 'line-clamp-3' : ''
        }`}
        style={expanded ? { WebkitLineClamp: 'unset' } : undefined}
      >
        {text}
      </p>
      {!isShort && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1"
        >
          {expanded ? (
            <>
              Show less
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              Read more
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
}

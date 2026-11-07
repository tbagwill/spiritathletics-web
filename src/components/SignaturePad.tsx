'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string | null) => void;
  label?: string;
  invalid?: boolean;
}

export default function SignaturePad({ onSignatureChange, label = 'Signature', invalid }: SignaturePadProps) {
  const sigRef = useRef<SignatureCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const emitSignature = useCallback(() => {
    const pad = sigRef.current;
    if (!pad || pad.isEmpty()) {
      setIsEmpty(true);
      onSignatureChange(null);
      return;
    }
    setIsEmpty(false);
    // getTrimmedCanvas can throw on some mobile browsers; fall back to the
    // full canvas so the signature is still captured and submission works.
    try {
      onSignatureChange(pad.getTrimmedCanvas().toDataURL('image/png'));
    } catch {
      onSignatureChange(pad.getCanvas().toDataURL('image/png'));
    }
  }, [onSignatureChange]);

  const handleClear = useCallback(() => {
    sigRef.current?.clear();
    setIsEmpty(true);
    onSignatureChange(null);
  }, [onSignatureChange]);

  useEffect(() => {
    const resizeCanvas = () => {
      const pad = sigRef.current;
      const container = containerRef.current;
      if (!pad || !container) return;

      const canvas = pad.getCanvas();
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const width = container.offsetWidth;
      const height = container.offsetHeight;

      // Mobile browsers fire resize constantly as the address bar shows/hides.
      // Bail out when the backing size hasn't actually changed so we never wipe
      // an in-progress signature.
      if (canvas.width === width * ratio && canvas.height === height * ratio) {
        return;
      }

      // Preserve strokes as vector point data so they survive the resize
      // (image-based restore distorts and races on rapid mobile resizes).
      const data = pad.isEmpty() ? null : pad.toData();

      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.getContext('2d')?.scale(ratio, ratio);
      pad.clear();

      if (data) {
        pad.fromData(data);
        emitSignature();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
    };
  }, [emitSignature]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-slate-800">{label}</span>
        {!isEmpty ? (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-full px-2 py-0.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            Clear
          </button>
        ) : null}
      </div>
      <div
        ref={containerRef}
        className={`relative h-44 rounded-2xl bg-white ring-1 ring-inset transition-shadow ${
          invalid && isEmpty ? 'ring-red-400' : 'ring-slate-300 hover:ring-slate-400'
        }`}
      >
        <SignatureCanvas
          ref={sigRef}
          penColor="#0a0c16"
          canvasProps={{
            className: 'w-full h-full rounded-2xl touch-none select-none',
            style: { touchAction: 'none', WebkitUserSelect: 'none' },
          }}
          onEnd={emitSignature}
        />
        {/* Signature line */}
        <div className="pointer-events-none absolute inset-x-6 bottom-10 border-b border-dashed border-slate-300" />
        {isEmpty && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-slate-400">
            Sign above the line with your finger or mouse
          </div>
        )}
      </div>
    </div>
  );
}

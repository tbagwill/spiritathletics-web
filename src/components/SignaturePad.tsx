'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string | null) => void;
}

export default function SignaturePad({ onSignatureChange }: SignaturePadProps) {
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
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        Signature (Parent/Guardian)
      </label>
      <div
        ref={containerRef}
        className="relative border-2 border-gray-300 rounded-lg bg-white h-40"
      >
        <SignatureCanvas
          ref={sigRef}
          penColor="black"
          canvasProps={{
            className: 'w-full h-full rounded-lg touch-none select-none',
            style: { touchAction: 'none', WebkitUserSelect: 'none' },
          }}
          onEnd={emitSignature}
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-sm">
            Sign here
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleClear}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1 rounded border border-gray-300 hover:border-red-300"
        >
          Clear Signature
        </button>
      </div>
    </div>
  );
}

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

  const handleEnd = useCallback(() => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      setIsEmpty(false);
      onSignatureChange(sigRef.current.getTrimmedCanvas().toDataURL('image/png'));
    }
  }, [onSignatureChange]);

  const handleClear = useCallback(() => {
    sigRef.current?.clear();
    setIsEmpty(true);
    onSignatureChange(null);
  }, [onSignatureChange]);

  useEffect(() => {
    const resizeCanvas = () => {
      if (!sigRef.current || !containerRef.current) return;
      const canvas = sigRef.current.getCanvas();
      const container = containerRef.current;
      const data = sigRef.current.isEmpty() ? null : sigRef.current.toDataURL();

      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;

      if (data && !sigRef.current.isEmpty()) {
        sigRef.current.fromDataURL(data, {
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        Signature (Parent/Guardian)
      </label>
      <div
        ref={containerRef}
        className="relative border-2 border-gray-300 rounded-lg bg-white h-40 touch-none"
      >
        <SignatureCanvas
          ref={sigRef}
          penColor="black"
          canvasProps={{
            className: 'w-full h-full rounded-lg',
          }}
          onEnd={handleEnd}
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

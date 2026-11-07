'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CameraOff, Flashlight, FlashlightOff, LoaderCircle, Search, X } from 'lucide-react';
import { cn } from '@/components/ui/cn';
import { ScanResultSheet, type ScanOutcome } from './ScanResultSheet';

// A code still sitting in the frame after its popup closes shouldn't re-trigger "already checked in".
// Counted from when staff tap "Scan another", since the result stays up until they do.
const REPEAT_IGNORE_MS = 8000;

type Controls = { stop: () => void; switchTorch?: (on: boolean) => Promise<void> };

function useLockedViewport() {
  useEffect(() => {
    const html = document.documentElement;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: document.body.style.overflow,
      overscroll: html.style.overscrollBehavior,
    };
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    return () => {
      html.style.overflow = prev.htmlOverflow;
      document.body.style.overflow = prev.bodyOverflow;
      html.style.overscrollBehavior = prev.overscroll;
    };
  }, []);
}

function useWakeLock() {
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } };
    const acquire = async () => {
      try {
        if (nav.wakeLock && document.visibilityState === 'visible') lock = await nav.wakeLock.request('screen');
      } catch {
        // Unsupported or denied; the scanner still works, the screen may just dim.
      }
    };
    acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      document.removeEventListener('visibilitychange', acquire);
      lock?.release().catch(() => {});
    };
  }, []);
}

export default function Scanner({ slug, title, subtitle }: { slug: string; title: string; subtitle: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<Controls | null>(null);
  const lastRef = useRef<{ token: string; at: number } | null>(null);
  const busyRef = useRef(false);

  const [camera, setCamera] = useState<'starting' | 'ready' | { error: string }>('starting');
  const [outcome, setOutcome] = useState<ScanOutcome | null>(null);
  const [checking, setChecking] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  useLockedViewport();
  useWakeLock();

  const dismiss = useCallback(() => {
    // Restart the repeat guard now: the guest may still be holding the same code up.
    if (lastRef.current) lastRef.current = { ...lastRef.current, at: Date.now() };
    setOutcome(null);
    busyRef.current = false;
  }, []);

  const handleToken = useCallback(
    async (token: string) => {
      if (busyRef.current) return;
      const now = Date.now();
      if (lastRef.current?.token === token && now - lastRef.current.at < REPEAT_IGNORE_MS) return;
      lastRef.current = { token, at: now };
      busyRef.current = true;
      setChecking(true);

      let next: ScanOutcome;
      try {
        const res = await fetch(`/api/dashboard/events/${slug}/redeem`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrToken: token }),
        });
        const json = await res.json();
        if (res.ok && json.ok) {
          const count = json.kind === 'ORDER' ? Number(json.redeemedCount) || 1 : 1;
          next = {
            kind: 'ok',
            count,
            alreadyCount: Number(json.alreadyCount) || 0,
            customerName: json.ticket?.customerName || '',
            tierName: json.ticket?.tierName || 'Ticket',
          };
          setSessionCount((n) => n + count);
          navigator.vibrate?.(80);
        } else if (json.reason === 'ALREADY_REDEEMED') {
          next = {
            kind: 'already',
            customerName: json.ticket?.customerName || '',
            message: json.message || 'Already checked in.',
          };
          navigator.vibrate?.([60, 60, 60]);
        } else if (json.reason === 'WRONG_EVENT') {
          next = { kind: 'wrong_event', message: json.message || 'This ticket is for a different event.' };
          navigator.vibrate?.([200]);
        } else if (json.reason === 'VOIDED') {
          next = { kind: 'voided', message: json.message || 'This ticket is no longer valid.' };
          navigator.vibrate?.([200]);
        } else if (json.reason === 'NOT_FOUND') {
          next = { kind: 'not_found', message: 'This code isn’t a Spirit Athletics ticket.' };
          navigator.vibrate?.([200]);
        } else {
          next = { kind: 'error', message: json.error || json.message || 'Check-in failed. Try again.' };
        }
      } catch {
        next = { kind: 'error', message: 'No connection. Move closer to Wi-Fi or use name search.' };
        // Let the same code be retried right away once the connection is back.
        lastRef.current = null;
      }
      setChecking(false);
      setOutcome(next);
    },
    [slug],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setCamera({ error: 'The camera only works on a secure (https://) page. Reopen the scanner from an https:// address.' });
        return;
      }
      try {
        const { BrowserQRCodeReader } = await import('@zxing/browser');
        const reader = new BrowserQRCodeReader();
        // facingMode picks the rear camera even before permission is granted, when device labels are still blank.
        const controls: Controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } }, audio: false },
          videoRef.current!,
          (result) => {
            const text = result?.getText();
            if (text) void handleToken(text);
          },
        );
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setTorchSupported(typeof controls.switchTorch === 'function');
        setCamera('ready');
      } catch (err) {
        const e = err as { name?: string; message?: string };
        setCamera({
          error:
            e?.name === 'NotAllowedError'
              ? 'Camera permission is off. Allow camera access in your browser settings, then reload.'
              : e?.name === 'NotFoundError' || e?.name === 'OverconstrainedError'
              ? 'No camera found on this device.'
              : e?.name === 'NotReadableError'
              ? 'Another app is using the camera. Close it and reload.'
              : e?.message || 'The camera couldn’t start.',
        });
      }
    })();
    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
  }, [handleToken]);

  async function toggleTorch() {
    const next = !torchOn;
    try {
      await controlsRef.current?.switchTorch?.(next);
      setTorchOn(next);
    } catch {
      setTorchSupported(false);
    }
  }

  const ready = camera === 'ready';
  const cameraError = typeof camera === 'object' ? camera.error : null;

  return (
    <div className="fixed inset-0 z-[70] flex h-[100dvh] touch-none select-none flex-col overflow-hidden bg-black font-sans text-white">
      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 pb-3 pt-[max(env(safe-area-inset-top),14px)]">
        <Link
          href={`/dashboard/events/${slug}`}
          aria-label="Close scanner"
          className="flex size-11 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20"
        >
          <X className="size-5" />
        </Link>
        <div className="min-w-0 text-center">
          <div className="truncate text-sm font-semibold">{title}</div>
          <div className="truncate text-xs text-white/50">{subtitle}</div>
        </div>
        {torchSupported ? (
          <button
            type="button"
            onClick={toggleTorch}
            aria-label={torchOn ? 'Turn flashlight off' : 'Turn flashlight on'}
            aria-pressed={torchOn}
            className={cn(
              'flex size-11 items-center justify-center rounded-full backdrop-blur transition-colors',
              torchOn ? 'bg-white text-ink' : 'bg-white/10 hover:bg-white/20',
            )}
          >
            {torchOn ? <Flashlight className="size-5" /> : <FlashlightOff className="size-5" />}
          </button>
        ) : (
          <span className="size-11" aria-hidden />
        )}
      </div>

      {/* Camera stage */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />

        {!cameraError ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative aspect-square w-[min(72vw,52vh,340px)] rounded-[36px] shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
              {(['left-0 top-0 border-l-4 border-t-4 rounded-tl-[36px]', 'right-0 top-0 border-r-4 border-t-4 rounded-tr-[36px]', 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-[36px]', 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-[36px]'] as const).map(
                (pos) => (
                  <span
                    key={pos}
                    className={cn(
                      'absolute size-14 transition-colors duration-300',
                      pos,
                      checking
                        ? 'border-white'
                        : ready
                        ? 'border-spirit-400 drop-shadow-[0_0_10px_rgba(88,100,255,0.9)]'
                        : 'border-white/40',
                    )}
                  />
                ),
              )}
              {ready && !outcome && !checking ? (
                <span className="absolute inset-x-8 h-0.5 rounded-full bg-gradient-to-r from-transparent via-spirit-400 to-transparent shadow-[0_0_16px_2px_rgba(88,100,255,0.7)] motion-safe:animate-sweep" />
              ) : null}
              {checking ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium backdrop-blur">
                    <LoaderCircle className="size-4 animate-spin" aria-hidden />
                    Checking…
                  </span>
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {camera === 'starting' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-white/70">
            <LoaderCircle className="size-6 animate-spin" aria-hidden />
            Starting camera…
          </div>
        ) : null}

        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-white/10">
              <CameraOff className="size-6" aria-hidden />
            </span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/75">{cameraError}</p>
            <Link
              href={`/dashboard/events/${slug}`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink"
            >
              <Search className="size-4" aria-hidden />
              Check in by name instead
            </Link>
          </div>
        ) : null}
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-4">
        <div className="bg-spirit-deep shadow-spirit flex items-center justify-between gap-3 rounded-full py-2 pl-5 pr-2 ring-1 ring-inset ring-white/15">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/60">This session</div>
            <div className="text-lg font-semibold leading-tight tabular-nums">
              {sessionCount} checked in
            </div>
          </div>
          <Link
            href={`/dashboard/events/${slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-spirit"
          >
            <Search className="size-4" aria-hidden />
            Find by name
          </Link>
        </div>
        <p className="mt-3 text-center text-xs text-white/45">Hold the ticket QR inside the frame.</p>
      </div>

      {outcome ? <ScanResultSheet outcome={outcome} onDismiss={dismiss} /> : null}
    </div>
  );
}

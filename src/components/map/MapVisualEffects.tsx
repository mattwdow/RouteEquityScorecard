'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useUIStore } from '@/store/useUIStore';

export function MapVisualOverlays() {
  const spotlightFocus = useUIStore((s) => s.spotlightFocus);
  const tiltShift = useUIStore((s) => s.tiltShift);

  return (
    <>
      {spotlightFocus && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 17,
            pointerEvents: 'none',
            background:
              'radial-gradient(circle at center, transparent 42%, rgba(15, 15, 20, 0.225) 100%)',
          }}
        />
      )}
      {tiltShift && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 17,
            pointerEvents: 'none',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 0%, transparent 28%, transparent 72%, black 100%)',
            maskImage:
              'linear-gradient(to bottom, black 0%, transparent 28%, transparent 72%, black 100%)',
          }}
        />
      )}
    </>
  );
}

export function MapEffectsToggle({ align = 'right' }: { align?: 'left' | 'right' }) {
  const spotlightFocus = useUIStore((s) => s.spotlightFocus);
  const tiltShift = useUIStore((s) => s.tiltShift);
  const dioramaContrast = useUIStore((s) => s.dioramaContrast);
  const toggleSpotlightFocus = useUIStore((s) => s.toggleSpotlightFocus);
  const toggleTiltShift = useUIStore((s) => s.toggleTiltShift);
  const toggleDioramaContrast = useUIStore((s) => s.toggleDioramaContrast);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const anyActive = spotlightFocus || tiltShift || dioramaContrast;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title="Map Visual Effects"
        aria-label="Toggle Map Visual Effects"
        aria-expanded={open}
        className={`relative backdrop-blur-md border p-2 rounded-lg shadow-sm transition-all flex items-center justify-center ${
          anyActive
            ? 'bg-slate-800 border-slate-800 text-white hover:bg-slate-900'
            : 'bg-white/90 border-slate-200 text-slate-600 hover:text-slate-900'
        }`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute top-full mt-2 ${
            align === 'right' ? 'right-0' : 'left-0'
          } w-44 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg p-2 flex flex-col gap-1 z-30`}
        >
          <button
            type="button"
            onClick={toggleSpotlightFocus}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span>Spotlight Focus</span>
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                spotlightFocus ? 'bg-slate-800' : 'bg-slate-300'
              }`}
            />
          </button>
          <button
            type="button"
            onClick={toggleTiltShift}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span>Tilt-Shift Blur</span>
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                tiltShift ? 'bg-slate-800' : 'bg-slate-300'
              }`}
            />
          </button>
          <button
            type="button"
            onClick={toggleDioramaContrast}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span>Diorama Contrast</span>
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                dioramaContrast ? 'bg-slate-800' : 'bg-slate-300'
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
}

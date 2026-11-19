"use client";

import React from 'react';

interface BusStopTicketProps {
  stopId: string;
  theme: 'purple' | 'orange' | 'emerald' | 'rose' | 'blue' | 'amber';
  stopName: string;
  grade: string;
  score: number;
  percentile: number;
  dailyTrips: number;
  peakTripsPerHour: number;
  routesServed: string[];
  daCount: number;
  tagline: string;
  stabilityClass?: string;
  stabilityMean?: number;
  stabilityStd?: number;
}

function formatOrdinal(val: number): string {
  const rounded = Math.round(val);
  const j = rounded % 10;
  const k = rounded % 100;
  if (j === 1 && k !== 11) return `${rounded}st`;
  if (j === 2 && k !== 12) return `${rounded}nd`;
  if (j === 3 && k !== 13) return `${rounded}rd`;
  return `${rounded}th`;
}

export const BusStopTicket: React.FC<BusStopTicketProps> = ({
  stopId,
  theme,
  stopName,
  grade,
  score,
  percentile,
  dailyTrips,
  peakTripsPerHour,
  routesServed,
  daCount,
  tagline,
  stabilityClass,
  stabilityMean,
  stabilityStd,
}) => {
  const themeStyles = {
    purple: {
      stripe: 'bg-purple-600',
      badge: 'bg-purple-50 text-purple-800 border-purple-200',
      tag: 'text-purple-700 bg-purple-50/70 border-purple-200/80',
      title: 'text-purple-950',
      accent: 'text-purple-700',
      stubBg: 'bg-purple-50/35',
    },
    orange: {
      stripe: 'bg-orange-600',
      badge: 'bg-orange-50 text-orange-800 border-orange-200',
      tag: 'text-orange-700 bg-orange-50/70 border-orange-200/80',
      title: 'text-orange-950',
      accent: 'text-orange-700',
      stubBg: 'bg-orange-50/35',
    },
    emerald: {
      stripe: 'bg-emerald-600',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      tag: 'text-emerald-700 bg-emerald-50/70 border-emerald-200/80',
      title: 'text-emerald-950',
      accent: 'text-emerald-700',
      stubBg: 'bg-emerald-50/35',
    },
    rose: {
      stripe: 'bg-rose-600',
      badge: 'bg-rose-50 text-rose-800 border-rose-200',
      tag: 'text-rose-700 bg-rose-50/70 border-rose-200/80',
      title: 'text-rose-950',
      accent: 'text-rose-700',
      stubBg: 'bg-rose-50/35',
    },
    blue: {
      stripe: 'bg-blue-600',
      badge: 'bg-blue-50 text-blue-800 border-blue-200',
      tag: 'text-blue-700 bg-blue-50/70 border-blue-200/80',
      title: 'text-blue-950',
      accent: 'text-blue-700',
      stubBg: 'bg-blue-50/35',
    },
    amber: {
      stripe: 'bg-amber-600',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      tag: 'text-amber-700 bg-amber-50/70 border-amber-200/80',
      title: 'text-amber-950',
      accent: 'text-amber-700',
      stubBg: 'bg-amber-50/35',
    },
  }[theme];

  return (
    <div className="flex flex-col sm:flex-row w-full bg-white border border-slate-200 rounded-xl shadow-xs hover:shadow-sm transition-shadow duration-200 overflow-hidden">
      {/* Left Die-Cut Ticket Notch Stripe */}
      <div className={`h-9 sm:h-auto sm:w-12 flex-shrink-0 ${themeStyles.stripe} flex items-center justify-center relative select-none`}>
        <span className="font-mono tabular-nums font-black text-white text-[11px] tracking-widest uppercase sm:[writing-mode:vertical-rl] sm:rotate-180">
          STOP #{stopId}
        </span>
        {/* Die-cut notch */}
        <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-5 bg-white rounded-l-full border-y border-l border-slate-100" />
      </div>

      {/* Center Ticket Body */}
      <div className="flex-1 px-5 py-4 flex flex-col justify-between gap-3.5">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <h3 className={`text-base font-black ${themeStyles.title} tracking-tight`}>
              {stopName}
            </h3>
            {stabilityClass && (
              <span
                className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded border ${themeStyles.tag}`}
                title={
                  stabilityMean !== undefined && stabilityStd !== undefined
                    ? `Mean: ${stabilityMean.toFixed(1)}, Volatility (σ): ${stabilityStd.toFixed(1)}`
                    : stabilityClass
                }
              >
                {stabilityClass.replace(' Bus Stop', '')}
              </span>
            )}
          </div>
          <p className="text-slate-600 text-xs mt-1 font-medium leading-relaxed">
            {tagline}
          </p>
        </div>

        {/* Clean 4-Metric Strip with Deduplicated Units & WCAG AA Labels */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Routes</div>
            <div className="text-xs font-mono tabular-nums font-black text-slate-900 mt-0.5">
              {routesServed.join(', ') || 'None'}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Daily Trips</div>
            <div className="text-xs font-mono tabular-nums font-black text-slate-900 mt-0.5">
              {dailyTrips} / day
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Peak Freq.</div>
            <div className="text-xs font-mono tabular-nums font-black text-slate-900 mt-0.5">
              {peakTripsPerHour.toFixed(1)} / hr
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">400m Buffer</div>
            <div className="text-xs font-mono tabular-nums font-black text-slate-900 mt-0.5">
              {daCount} DAs
            </div>
          </div>
        </div>
      </div>

      {/* Right Perforated Score Stub */}
      <div
        className={`sm:w-36 flex-shrink-0 border-t sm:border-t-0 sm:border-l border-dashed border-slate-200 ${themeStyles.stubBg} px-4 py-3.5 sm:py-4 flex sm:flex-col items-center justify-between sm:justify-center text-center gap-1.5`}
      >
        <span className={`px-2 py-0.5 text-[11px] font-mono font-black rounded border ${themeStyles.badge}`}>
          Grade {grade}
        </span>
        <div className="flex sm:flex-col items-baseline sm:items-center gap-1.5 sm:gap-0">
          <span className={`text-2xl font-mono tabular-nums font-black leading-none ${themeStyles.accent}`}>
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] font-mono tabular-nums font-bold text-slate-500 mt-0.5">
            {formatOrdinal(percentile)} %ile
          </span>
        </div>
      </div>
    </div>
  );
};

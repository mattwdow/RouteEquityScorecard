"use client";

import React from 'react';

/**
 * II. Uniform Walking Speeds (400m != 5 Minutes for Everyone)
 * Dual-channel concentric reach rings (colour + dash pattern) with tabular-nums.
 */
export const WalkingSpeedRingsVisual: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Concentric SVG */}
        <div className="md:col-span-5 flex items-center justify-center">
          <svg
            viewBox="0 0 260 260"
            className="w-56 h-56 max-w-full"
            role="img"
            aria-label="Concentric 5-minute walking reach rings comparing 400m, 220m, and 160m radii"
          >
            {/* 400m Able-bodied adult */}
            <circle
              cx="130"
              cy="130"
              r="116"
              fill="#ecfdf5"
              stroke="#047857"
              strokeWidth="2"
            />
            {/* 220m Senior / winter ice */}
            <circle
              cx="130"
              cy="130"
              r="64"
              fill="#fef3c7"
              fillOpacity="0.65"
              stroke="#d97706"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            {/* 160m Mobility aid */}
            <circle
              cx="130"
              cy="130"
              r="46"
              fill="#fee2e2"
              fillOpacity="0.75"
              stroke="#dc2626"
              strokeWidth="2"
              strokeDasharray="2 3"
            />
            {/* Center Bus Stop Pole */}
            <circle cx="130" cy="130" r="5" fill="#0f172a" />
            {/* Radius labels */}
            <text x="130" y="28" textAnchor="middle" className="fill-emerald-800 text-[10px] font-mono font-bold">
              400m
            </text>
            <text x="130" y="79" textAnchor="middle" className="fill-amber-800 text-[10px] font-mono font-bold">
              220m
            </text>
            <text x="130" y="102" textAnchor="middle" className="fill-rose-800 text-[10px] font-mono font-bold">
              160m
            </text>
          </svg>
        </div>

        {/* Right: Tabular Comparison */}
        <div className="md:col-span-7 space-y-3">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
            5-Minute Walking Catchment by Rider Profile
          </div>
          <div className="divide-y divide-slate-100 border-t border-b border-slate-200 text-xs">
            <div className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-0.5 bg-emerald-700 inline-block" />
                <span className="font-bold text-slate-900">Baseline Model (Adult, Clear Path)</span>
              </div>
              <div className="font-mono tabular-nums text-right">
                <span className="font-black text-emerald-800">400m</span>
                <span className="text-slate-500 ml-2">4.8 km/h</span>
              </div>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-amber-600 inline-block" />
                <span className="font-bold text-slate-900">Senior, Stroller, or Icy Sidewalk</span>
              </div>
              <div className="font-mono tabular-nums text-right">
                <span className="font-black text-amber-700">220m</span>
                <span className="text-slate-500 ml-2">-70% area</span>
              </div>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-0.5 border-t-2 border-dotted border-rose-600 inline-block" />
                <span className="font-bold text-slate-900">Mobility Aid or Heavy Snow</span>
              </div>
              <div className="font-mono tabular-nums text-right">
                <span className="font-black text-rose-700">160m</span>
                <span className="text-slate-500 ml-2">-84% area</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Because circle area scales with the square of the radius, halving walking speed shrinks a Rider&apos;s reachable catchment to one quarter of the modelled zone.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * III. Uniform Density Inside Census Blocks (Area != People)
 */
export const SplitDaDensityVisual: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-6 flex items-center justify-center">
          <svg
            viewBox="0 0 320 170"
            className="w-full max-w-sm h-auto"
            role="img"
            aria-label="Diagram of a Dissemination Area split between parkland and apartments sliced by a 400m circle"
          >
            {/* DA Outer Rectangle */}
            <rect x="20" y="20" width="280" height="120" rx="6" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />

            {/* Left half: Park / Empty Land */}
            <rect x="21" y="21" width="139" height="118" rx="4" fill="#ecfdf5" />
            <text x="90" y="74" textAnchor="middle" className="fill-emerald-800 text-[10px] font-bold">
              Park &amp; Parking Lot
            </text>
            <text x="90" y="90" textAnchor="middle" className="fill-emerald-700 text-[9px] font-mono">
              50% of land area · 0 residents
            </text>

            {/* Right half: Dense Apartments */}
            <rect x="160" y="21" width="139" height="118" rx="4" fill="#f1f5f9" />
            {/* Apartment building footprints */}
            <rect x="180" y="38" width="38" height="24" rx="2" fill="#334155" />
            <rect x="230" y="38" width="46" height="24" rx="2" fill="#334155" />
            <rect x="180" y="74" width="46" height="24" rx="2" fill="#334155" />
            <rect x="238" y="74" width="38" height="24" rx="2" fill="#334155" />
            <text x="230" y="122" textAnchor="middle" className="fill-slate-700 text-[9px] font-mono font-bold">
              50% of land · 100% of residents
            </text>

            {/* 400m Buffer Circle overlapping ONLY the park side */}
            <circle
              cx="62"
              cy="80"
              r="52"
              fill="#047857"
              fillOpacity="0.14"
              stroke="#047857"
              strokeWidth="2"
            />
            <circle cx="62" cy="80" r="4.5" fill="#0f172a" />
            <text x="62" y="156" textAnchor="middle" className="fill-slate-600 text-[9px] font-mono font-bold">
              400m Stop Buffer
            </text>
          </svg>
        </div>

        <div className="md:col-span-6 space-y-2.5">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Proportional Area vs. Actual Housing
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            In this example, the 400-metre circle covers a large share of the Dissemination Area&apos;s land, so the model assigns significant weight to that block&apos;s census score.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Because every resident actually lives in the apartments on the far side of the block, area-based weighting can overstate or understate who walks to the pole.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * IV. Residential Census vs. Actual Boarding Demand
 */
export const HomeVsBoardingVisual: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        <div className="space-y-2">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800">
            What CIMD Measures (Nighttime Residence)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Census scores reflect where households sleep. Commercial strips, hospital campuses, and industrial zones often have tiny residential populations and low vulnerability scores.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-slate-700">
            <span className="px-2 py-0.5 rounded bg-slate-100">Home Address</span>
            <span className="px-2 py-0.5 rounded bg-slate-100">Census Block</span>
          </div>
        </div>

        <div className="pt-4 md:pt-0 md:pl-6 space-y-2">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-800">
            What Riders Actually Do (Daytime &amp; Shift Boardings)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Transit-dependent Riders travel to medical clinics, grocery stores, food banks, and shift-work warehouses. Integrating stop-level boardings data is required to capture destination demand.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-slate-700">
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900">Hospitals</span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900">Shift Work</span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900">Social Services</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * V. The Ecological Fallacy (Replicated from Route Equity Scrollytelling)
 */
export const EcologicalFallacyVisual: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-8 justify-center items-stretch">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-5 bg-slate-50/70 border border-slate-100 rounded-xl text-center">
        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
          Zone Average
        </h4>

        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r="54" stroke="#E2E8F0" strokeWidth="10" fill="transparent" />
            <circle
              cx="72"
              cy="72"
              r="54"
              stroke="#047857"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray="339.3"
              strokeDashoffset="67.8"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-mono tabular-nums font-black text-slate-900 leading-none">
              80.0
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
              Score
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-600 mt-4 leading-relaxed max-w-xs">
          Appears broadly uniform when viewed as a single aggregated Dissemination Area.
        </p>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center p-5 bg-slate-50/70 border border-slate-100 rounded-xl">
        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider text-center mb-4">
          Granular Breakdown
        </h4>

        <div className="space-y-4 my-1">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Low-need Segments <span className="text-[10px] text-slate-500 font-medium">(80% of Zone)</span>
              </span>
              <span className="text-emerald-800 font-mono tabular-nums font-black text-sm">90.0</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: '90%' }} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                High-need Segments <span className="text-[10px] text-slate-500 font-medium">(20% of Zone)</span>
              </span>
              <span className="text-rose-700 font-mono tabular-nums font-black text-sm">40.0</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
              <div className="h-full bg-rose-600 rounded-full" style={{ width: '40%' }} />
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-600 mt-4 leading-relaxed text-center">
          Reveals deep pockets of need masked by the broader neighbourhood average.
        </p>
      </div>
    </div>
  );
};

/**
 * VI. Blind to Curbside Infrastructure & Winter Conditions
 */
export const CurbsideInfrastructureVisual: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs">
        <div className="space-y-2">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
            What the Model Sees
          </div>
          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-2xl font-mono tabular-nums font-black text-emerald-800">82.1</span>
            <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Grade A
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Two stops in the same neighbourhood receive the exact same equity score, even if one is a heated hub and the other is an exposed pole.
          </p>
        </div>

        <div className="pt-4 md:pt-0 md:pl-6 space-y-2">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
            What the Rider Experiences (Unmeasured)
          </div>
          <ul className="grid grid-cols-2 gap-y-1.5 gap-x-4 pt-1 font-medium text-slate-700">
            <li>&bull; Heated shelter vs. bare pole</li>
            <li>&bull; Concrete boarding pad</li>
            <li>&bull; Nighttime street lighting</li>
            <li>&bull; Priority snow clearing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * VII. Census Lag (2021 Snapshot vs. 2026 Reality)
 * Shared between Bus Stop Scrollytelling and Route Equity Scrollytelling.
 */
export const CensusLagVisual: React.FC<{ accent?: 'emerald' | 'navy' }> = ({ accent = 'emerald' }) => {
  const accentText = accent === 'navy' ? 'text-[#1E3A8A]' : 'text-emerald-800';
  const accentDot = accent === 'navy' ? 'bg-[#1E3A8A]' : 'bg-emerald-700';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6">
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Connecting horizontal line on desktop */}
        <div
          aria-hidden="true"
          className="hidden sm:block absolute top-3 left-6 right-6 h-0.5 bg-slate-200 z-0"
        />

        <div className="relative z-10 flex flex-col gap-1 sm:max-w-[28%]">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${accentDot} ring-4 ring-white`} />
            <span className={`font-mono tabular-nums text-xs font-black ${accentText}`}>2021 Census</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug pl-5 sm:pl-0">
            Statistics Canada CIMD baseline collected during pandemic-era conditions.
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-1 sm:max-w-[34%] sm:text-center sm:items-center">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-white" />
            <span className="font-mono tabular-nums text-xs font-black text-amber-800">5-Year Shift</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug pl-5 sm:pl-0">
            Rapid infill towers, greenfield suburban growth, and recent immigration corridors.
          </p>
        </div>

        <div className="relative z-10 flex flex-col gap-1 sm:max-w-[28%] sm:text-right sm:items-end">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-900 ring-4 ring-white" />
            <span className="font-mono tabular-nums text-xs font-black text-slate-900">2026 Network</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug pl-5 sm:pl-0">
            Live ETS GTFS schedule paired with 2021 demographic boundaries until the next release.
          </p>
        </div>
      </div>
    </div>
  );
};

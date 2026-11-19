"use client";

import React, { useState, useMemo } from 'react';
import { RoutePoint } from '@/components/charts/EquityQuadrant';
import { useRouteStore, MetricKey } from '@/store/routeStore';

export interface DaInfo {
  id: string;
  pop: number;
  low_income_pct: number;
  minority_pct: number;
  senior_pct: number;
  lone_parent_pct?: number;
  recent_immigrant_pct?: number;
  youth_pct?: number;
  vulnerability_index?: number;
  neighbourhood?: string;
}

export interface RouteWithDAs extends RoutePoint {
  da_data: DaInfo[];
}

interface MatrixProps {
  routes: RouteWithDAs[];
  daAreaMap?: Record<string, number>;
}

export const METRICS: { key: MetricKey; label: string; color: string }[] = [
  { key: 'composite',             label: 'Composite Vulnerability Score', color: '#0F766E' },
  { key: 'low_income_pct',        label: 'Low Income',           color: '#EF4444' },
  { key: 'minority_pct',          label: 'Visible Minority',     color: '#F59E0B' },
  { key: 'senior_pct',            label: 'Seniors',              color: '#8B5CF6' },
  { key: 'lone_parent_pct',       label: 'Lone Parents',         color: '#EC4899' },
  { key: 'recent_immigrant_pct',  label: 'Recent Immigrants',    color: '#10B981' },
  { key: 'youth_pct',             label: 'Youth (15-24)',        color: '#6366F1' },
];

const GRADE_COLORS: Record<string, string> = {
  A: '#10B981', B: '#3B82F6', C: '#F59E0B', D: '#F97316', E: '#EF4444',
};

function getMetricValue(da: DaInfo, metric: MetricKey): number {
  if (metric === 'composite') {
    return (da.vulnerability_index !== undefined && da.vulnerability_index !== null) ? da.vulnerability_index : (da.low_income_pct + da.minority_pct + da.senior_pct) / 3;
  }
  return da[metric] || 0;
}

const METRIC_HSL: Record<MetricKey, { h: number; s: number; minL: number; maxL: number }> = {
  composite:            { h: 174, s: 76, minL: 20, maxL: 92 },
  low_income_pct:        { h: 0,   s: 84, minL: 35, maxL: 95 },
  minority_pct:          { h: 38,  s: 93, minL: 30, maxL: 95 },
  senior_pct:            { h: 262, s: 89, minL: 35, maxL: 95 },
  lone_parent_pct:       { h: 330, s: 81, minL: 30, maxL: 95 },
  recent_immigrant_pct:  { h: 161, s: 84, minL: 20, maxL: 92 },
  youth_pct:             { h: 239, s: 84, minL: 30, maxL: 95 },
};

// Map a value to a normalized intensity t [0, 1]
function calculateIntensity(
  value: number,
  metric: MetricKey,
  minVal: number,
  maxVal: number,
  meanVal: number,
  stdVal: number
): number {
  if (maxVal === minVal) return 0.0;
  
  if (metric === 'composite') {
    const z = (value - meanVal) / stdVal;
    // Standard logistic sigmoid maps to (0, 1)
    return 1 / (1 + Math.exp(-z));
  } else {
    // For other metrics, use local Min-Max normalization
    return (value - minVal) / (maxVal - minVal);
  }
}

const COMPOSITE_STOPS = ['#E2E8F0', '#FCD34D', '#F59E0B', '#E11D48', '#881337'];

function intensityToColor(t: number, metric: MetricKey): string {
  const clamped = Math.max(0, Math.min(1, t));
  if (metric === 'composite') {
    const idx = Math.min(COMPOSITE_STOPS.length - 1, Math.floor(clamped * COMPOSITE_STOPS.length));
    return COMPOSITE_STOPS[idx];
  }
  const hsl = METRIC_HSL[metric] || { h: 174, s: 76, minL: 20, maxL: 92 };
  const l = hsl.maxL - clamped * (hsl.maxL - hsl.minL);
  return `hsl(${hsl.h}, ${hsl.s}%, ${l}%)`;
}

// Map density to circle radius (2.5-12px)
function densityToRadius(density: number, maxDensity: number): number {
  if (maxDensity === 0) return 2.5;
  // Linear scale with wider range makes differences significantly more prominent
  return 2.5 + (density / maxDensity) * 9.5;
}

export const EquityMatrix: React.FC<MatrixProps> = ({ routes, daAreaMap }) => {
  const activeMetric = useRouteStore((s) => s.activeMetric);
  const setActiveMetric = useRouteStore((s) => s.setActiveMetric);
  const selectedRoute = useRouteStore((s) => s.selectedRoute);
  const setSelectedRoute = useRouteStore((s) => s.setSelectedRoute);
  const [sortMode, setSortMode] = useState<'score' | 'route' | 'length'>('score');
  const [hoveredDa, setHoveredDa] = useState<{ da: DaInfo; routeName: string; x: number; y: number } | null>(null);

  // Pre-compute values for scaling
  const { maxPop, maxDensity, minMetric, maxMetric, meanMetric, stdMetric, maxDAs, sortedRoutes } = useMemo(() => {
    let mp = 0, mdens = 0, md = 0;
    let minM = Infinity, maxM = -Infinity;
    
    // Gather all metric values to compute mean and std dev
    const allMetricVals: number[] = [];
    
    routes.forEach((r) => {
      if (r.da_data.length > md) md = r.da_data.length;
      r.da_data.forEach((da) => {
        if (da.pop > mp) mp = da.pop;
        
        const area = daAreaMap?.[da.id] || 1.0;
        const density = da.pop / area;
        if (density > mdens) mdens = density;

        const v = getMetricValue(da, activeMetric);
        allMetricVals.push(v);
        if (v < minM) minM = v;
        if (v > maxM) maxM = v;
      });
    });

    if (minM === Infinity) minM = 0;
    if (maxM === -Infinity) maxM = 100;

    const count = allMetricVals.length;
    const mean = count > 0 ? allMetricVals.reduce((sum, v) => sum + v, 0) / count : 50;
    const variance = count > 0 ? allMetricVals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / count : 0;
    const std = Math.sqrt(variance) || 1.0;

    // Sort routes based on selected sortMode
    const sorted = [...routes].sort((a, b) => {
      if (sortMode === 'score') return b.composite_score - a.composite_score;
      if (sortMode === 'length') return b.da_data.length - a.da_data.length;
      return a.short_name.localeCompare(b.short_name, undefined, { numeric: true });
    });
    return { 
      maxPop: mp, 
      maxDensity: mdens, 
      minMetric: minM, 
      maxMetric: maxM, 
      meanMetric: mean, 
      stdMetric: std, 
      maxDAs: md, 
      sortedRoutes: sorted 
    };
  }, [routes, activeMetric, daAreaMap, sortMode]);

  if (!routes.length) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-slate-400">
        Awaiting engine data...
      </div>
    );
  }

  const ROW_HEIGHT = 24;
  const LABEL_WIDTH = 60;
  const CHART_WIDTH = Math.max(maxDAs * 22, 400);
  const SVG_HEIGHT = sortedRoutes.length * ROW_HEIGHT + 10;

  // Extract info for the hovered DA
  const hoveredDaArea = hoveredDa ? daAreaMap?.[hoveredDa.da.id] : undefined;
  const hoveredDaDensity = (hoveredDa && hoveredDaArea) ? hoveredDa.da.pop / hoveredDaArea : undefined;

  return (
    <div className="command-card bg-brand-slate-50/50 p-4">
      {/* Header + Sort & Metric Toggles */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-bold text-brand-slate-500 uppercase tracking-widest">
            Equity Dissemination Matrix
          </span>
          <div className="inline-flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-[10px] font-bold">
            {(
              [
                { key: 'score', label: 'Equity Score' },
                { key: 'route', label: 'Route #' },
                { key: 'length', label: 'Corridor Length' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSortMode(opt.key)}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  sortMode === opt.key
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all duration-200 border ${
                activeMetric === m.key
                  ? 'text-white shadow-sm'
                  : 'text-slate-500 bg-white border-slate-200 hover:border-slate-300'
              }`}
              style={activeMetric === m.key ? { backgroundColor: m.key === 'composite' ? '#881337' : m.color, borderColor: m.key === 'composite' ? '#881337' : m.color } : {}}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center flex-wrap gap-x-5 gap-y-1.5 mb-2 text-[10px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span>Left dot = Route Grade</span>
          <span className="inline-flex items-center gap-1 font-mono font-bold text-[9px] text-slate-600">
            {(['A', 'B', 'C', 'D', 'E'] as const).map((g) => (
              <span key={g} className="inline-flex items-center gap-0.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: GRADE_COLORS[g] }} />
                {g}
              </span>
            ))}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Dot size = Population Density (people/km²)</span>
          <svg width="56" height="22" className="inline-block align-middle">
            <circle cx="6" cy="11" r="2.5" fill="#94A3B8" opacity="0.6"/>
            <circle cx="22" cy="11" r="6" fill="#94A3B8" opacity="0.6"/>
            <circle cx="44" cy="11" r="10" fill="#94A3B8" opacity="0.6"/>
          </svg>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Colour = {METRICS.find(m => m.key === activeMetric)?.label} (Low to High)</span>
          <svg width="75" height="12" className="inline-block align-middle">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((t, i) => (
              <circle
                key={i}
                cx={6 + i * 14}
                cy={6}
                r={5}
                fill={intensityToColor(t, activeMetric)}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Scrollable Matrix */}
      <div className="overflow-auto max-h-[600px] custom-scrollbar border border-slate-200 rounded-lg bg-white relative">
        <svg
          width={LABEL_WIDTH + CHART_WIDTH + 20}
          height={SVG_HEIGHT}
          className="block"
        >
          {sortedRoutes.map((route, rowIdx) => {
            const y = rowIdx * ROW_HEIGHT + ROW_HEIGHT / 2 + 5;
            const isSelected = selectedRoute === route.route_id;

            return (
              <g key={route.route_id}>
                {/* Row background highlight */}
                {isSelected && (
                  <rect
                    x={0}
                    y={y - ROW_HEIGHT / 2}
                    width={LABEL_WIDTH + CHART_WIDTH + 20}
                    height={ROW_HEIGHT}
                    fill="#0F766E"
                    opacity={0.06}
                  />
                )}

                {/* Route label */}
                <text
                  x={LABEL_WIDTH - 4}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={9}
                  fontFamily="ui-monospace, monospace"
                  fontWeight={isSelected ? 700 : 500}
                  fill={isSelected ? '#0F766E' : '#64748B'}
                  cursor="pointer"
                  onClick={() => setSelectedRoute(isSelected ? null : route.route_id)}
                >
                  {route.short_name}
                </text>

                {/* Grade dot */}
                <circle
                  cx={LABEL_WIDTH + 6}
                  cy={y}
                  r={3}
                  fill={GRADE_COLORS[route.grade] || '#94A3B8'}
                />

                {/* DA dots */}
                {route.da_data.map((da, daIdx) => {
                  const cx = LABEL_WIDTH + 20 + daIdx * 20;
                  const area = daAreaMap?.[da.id] || 1.0;
                  const density = da.pop / area;
                  const r = densityToRadius(density, maxDensity);
                  const val = getMetricValue(da, activeMetric);
                  
                  const intensity = calculateIntensity(val, activeMetric, minMetric, maxMetric, meanMetric, stdMetric);
                  const fill = intensityToColor(intensity, activeMetric);
                  const cleanRouteName = route.name.startsWith(route.short_name)
                    ? route.name.replace(/\s*[—–-]\s*/, ' · ')
                    : `${route.short_name} · ${route.name}`;

                  return (
                    <circle
                      key={da.id}
                      cx={cx}
                      cy={y}
                      r={r}
                      fill={fill}
                      opacity={0.95}
                      stroke="#FFFFFF"
                      strokeWidth={0.5}
                      cursor="pointer"
                      onMouseEnter={() => {
                        setHoveredDa({
                          da,
                          routeName: cleanRouteName,
                          x: cx,
                          y: y,
                        });
                      }}
                      onMouseLeave={() => setHoveredDa(null)}
                      onClick={() => setSelectedRoute(isSelected ? null : route.route_id)}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredDa && (
          <div
            className="absolute bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg shadow-xl px-3 py-2 text-xs pointer-events-none z-20"
            style={{
              left: hoveredDa.x + 15,
              top: hoveredDa.y - 30,
            }}
          >
            <p className="font-bold text-slate-800 text-[10px]">{hoveredDa.routeName}</p>
            {hoveredDa.da.neighbourhood && (
              <p className="font-semibold text-slate-500 text-[9px] uppercase tracking-wide">{hoveredDa.da.neighbourhood}</p>
            )}
            <div className="grid grid-cols-2 gap-x-3 mt-1 text-slate-600">
              <span>DA ID</span>
              <span className="font-mono text-right">{hoveredDa.da.id}</span>
              <span>Population</span>
              <span className="font-mono text-right">{hoveredDa.da.pop.toLocaleString()}</span>
              
              {hoveredDaArea !== undefined && (
                <>
                  <span>Land Area</span>
                  <span className="font-mono text-right">{hoveredDaArea.toFixed(3)} km²</span>
                  <span>Density</span>
                  <span className="font-mono text-right">
                    {Math.round(hoveredDaDensity || 0).toLocaleString()} people/km²
                  </span>
                </>
              )}
              
              <div className="col-span-2 border-t border-slate-100 my-1"></div>
              
              <span className="font-semibold text-brand-slate-700">Transit Vulnerability (V_i)</span>
              <span className="font-semibold text-teal-700 text-right">
                {(hoveredDa.da.vulnerability_index !== undefined ? hoveredDa.da.vulnerability_index : (hoveredDa.da.low_income_pct + hoveredDa.da.minority_pct + hoveredDa.da.senior_pct) / 3).toFixed(1)}
              </span>
              
              <span>Low Income</span>
              <span className="font-mono text-right">{hoveredDa.da.low_income_pct.toFixed(1)}%</span>
              <span>Visible Minority</span>
              <span className="font-mono text-right">{hoveredDa.da.minority_pct.toFixed(1)}%</span>
              <span>Seniors</span>
              <span className="font-mono text-right">{hoveredDa.da.senior_pct.toFixed(1)}%</span>
              
              {hoveredDa.da.lone_parent_pct !== undefined && (
                <>
                  <span>Lone Parents</span>
                  <span className="font-mono text-right">{(hoveredDa.da.lone_parent_pct || 0).toFixed(1)}%</span>
                  <span>Recent Immigrants</span>
                  <span className="font-mono text-right">{(hoveredDa.da.recent_immigrant_pct || 0).toFixed(1)}%</span>
                  <span>Youth (15-24)</span>
                  <span className="font-mono text-right">{(hoveredDa.da.youth_pct || 0).toFixed(1)}%</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

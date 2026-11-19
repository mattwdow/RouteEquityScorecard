/**
 * useReactiveScoring.ts — Reference Template for /reactive-policy-engine
 *
 * Pure TypeScript reactive multi-criteria scoring engine maintaining 100% mathematical
 * parity with Python backend calibration scripts:
 *   1. Dynamic sub-dimension aggregation (e.g. Statistics Canada CIMD 4-dimension toggles)
 *   2. Municipal vs. Regional statistical isolation
 *   3. Weighted raw composite calculation
 *   4. Dynamic logistic sigmoid stretch (k = 4.0 / (2 * SD))
 *   5. Relative quintile grading (A-E at 20/40/60/80th percentiles)
 *   6. Exact linear SHAP attribution (phi_k = w_k * (pillar_k - mean_k))
 */

import { useMemo } from 'react';

export interface PolicyWeights {
  vulnerability: number;
  resilience: number;
  monopoly: number;
  opportunity: number;
}

export interface ShapContribution {
  pillar: string;
  label: string;
  value: number;       // phi_j = (w_j / 100) * (pillar_j - pillar_mean)
  color: string;       // #10B981 (emerald) for >= 0, #F43F5E (rose) for < 0
  rawScore: number;
  networkMean: number;
  weight: number;      // 0.0 to 1.0
}

export interface BasePolicyEntity {
  route_id: string;
  name: string;
  short_name?: string;
  is_regional?: boolean;
  grade?: string;
  pillar_1: number;
  pillar_1_cimd?: number;
  pillar_2: number;
  pillar_3: number;
  pillar_4: number;
  da_data?: Array<{ id: string; pop: number }>;
  [key: string]: any;
}

export interface ScoredPolicyEntity extends BasePolicyEntity {
  baseline_grade?: string;
  composite_score: number;     // Sigmoid-transformed final score [0, 100]
  composite_score_raw: number; // Pre-sigmoid weighted linear sum
  grade: string;               // 'A' | 'B' | 'C' | 'D' | 'E' | 'Regional'
  shap: ShapContribution[];
}

export interface NetworkStats {
  sigmoidMidpoint: number;
  sigmoidSteepness: number;
  quintileCuts: number[];      // [E|D, D|C, C|B, B|A] score thresholds
  pillarMeans: Record<string, number>;
  gradeDistribution: Record<string, number>;
}

const PILLAR_MAP = [
  { key: 'pillar_1', storeKey: 'vulnerability', label: 'Vulnerability',    color_pos: '#10B981', color_neg: '#F43F5E' },
  { key: 'pillar_2', storeKey: 'resilience',    label: 'Off Peak Service', color_pos: '#10B981', color_neg: '#F43F5E' },
  { key: 'pillar_3', storeKey: 'monopoly',      label: 'Monopoly',         color_pos: '#10B981', color_neg: '#F43F5E' },
  { key: 'pillar_4', storeKey: 'opportunity',   label: 'Opportunity',      color_pos: '#10B981', color_neg: '#F43F5E' },
] as const;

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function stddev(arr: number[], avg: number): number {
  if (arr.length <= 1) return 0;
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

function sigmoid(x: number, mid: number, k: number): number {
  return 1.0 / (1.0 + Math.exp(-k * (x - mid)));
}

export function getDynamicSubDimensionScore(
  entity: BasePolicyEntity,
  daScores: Record<string, any>,
  activeDimensions: ('econ' | 'res' | 'eth' | 'sit')[]
): number {
  if (activeDimensions.length === 0) return 0;
  if (!entity.da_data || entity.da_data.length === 0) {
    return entity.pillar_1_cimd ?? entity.pillar_1;
  }

  let weightedSum = 0;
  let popSum = 0;
  const dimWeight = 1 / activeDimensions.length;

  entity.da_data.forEach((da) => {
    const item = daScores[da.id];
    if (item) {
      let score = 0;
      if (activeDimensions.includes('econ')) score += (item.econ ?? item.economic ?? 50) * dimWeight;
      if (activeDimensions.includes('res')) score += (item.res ?? 50) * dimWeight;
      if (activeDimensions.includes('eth')) score += (item.eth ?? 50) * dimWeight;
      if (activeDimensions.includes('sit')) score += (item.sit ?? 50) * dimWeight;
      weightedSum += score * da.pop;
      popSum += da.pop;
    }
  });

  return popSum > 0 ? weightedSum / popSum : (entity.pillar_1_cimd ?? entity.pillar_1);
}

export function useReactiveScoring(
  baseEntities: BasePolicyEntity[],
  weights: PolicyWeights,
  activeDimensions: ('econ' | 'res' | 'eth' | 'sit')[] = ['econ', 'res', 'eth', 'sit'],
  daScores: Record<string, any> = {}
): { scoredRoutes: ScoredPolicyEntity[]; networkStats: NetworkStats } {
  return useMemo(() => {
    if (!baseEntities || baseEntities.length === 0) {
      return {
        scoredRoutes: [],
        networkStats: {
          sigmoidMidpoint: 0,
          sigmoidSteepness: 0,
          quintileCuts: [20, 40, 60, 80],
          pillarMeans: {},
          gradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0 },
        },
      };
    }

    const municipal = baseEntities.filter((r) => !r.is_regional);
    const regional = baseEntities.filter((r) => r.is_regional);
    const nMuni = municipal.length;

    // 1. Compute per-pillar network means (municipal only)
    const pillarMeans: Record<string, number> = {};
    for (const p of PILLAR_MAP) {
      const vals = municipal.map((r) =>
        p.key === 'pillar_1'
          ? getDynamicSubDimensionScore(r, daScores, activeDimensions)
          : (Number(r[p.key]) || 0)
      );
      pillarMeans[p.key] = mean(vals);
    }

    // 2. Compute raw weighted composite for each municipal entity
    const w = {
      pillar_1: weights.vulnerability / 100,
      pillar_2: weights.resilience / 100,
      pillar_3: weights.monopoly / 100,
      pillar_4: weights.opportunity / 100,
    };

    const rawComposites = municipal.map((r) => {
      const p1 = getDynamicSubDimensionScore(r, daScores, activeDimensions);
      return p1 * w.pillar_1 + r.pillar_2 * w.pillar_2 + r.pillar_3 * w.pillar_3 + r.pillar_4 * w.pillar_4;
    });

    // 3. Calibrate dynamic logistic sigmoid
    const compMean = mean(rawComposites);
    const compSd = stddev(rawComposites, compMean);
    const steepness = compSd > 0 ? 4.0 / (2 * compSd) : 0.08;

    // 4. Apply sigmoid transform
    const finalScores = rawComposites.map((raw) => Math.round(sigmoid(raw, compMean, steepness) * 100));

    // 5. Quintile grading
    const sorted = [...finalScores].sort((a, b) => a - b);
    const cuts = [0.2, 0.4, 0.6, 0.8].map((p) => sorted[Math.floor(nMuni * p)]);

    const assignGrade = (score: number): string => {
      if (score >= cuts[3]) return 'A';
      if (score >= cuts[2]) return 'B';
      if (score >= cuts[1]) return 'C';
      if (score >= cuts[0]) return 'D';
      return 'E';
    };

    // 6. Build scored objects with exact SHAP contributions
    const gradeDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    const scoredMunicipal: ScoredPolicyEntity[] = municipal.map((entity, i) => {
      const grade = assignGrade(finalScores[i]);
      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;

      const shap: ShapContribution[] = PILLAR_MAP.map((p) => {
        const pillarScore =
          p.key === 'pillar_1'
            ? getDynamicSubDimensionScore(entity, daScores, activeDimensions)
            : (Number(entity[p.key]) || 0);
        const pillarMean = pillarMeans[p.key];
        const weightFrac = w[p.key as keyof typeof w];
        const shapValue = weightFrac * (pillarScore - pillarMean);

        return {
          pillar: p.key,
          label: p.label,
          value: Math.round(shapValue * 100) / 100,
          color: shapValue >= 0 ? p.color_pos : p.color_neg,
          rawScore: pillarScore,
          networkMean: pillarMean,
          weight: weightFrac,
        };
      });

      const dynVuln = getDynamicSubDimensionScore(entity, daScores, activeDimensions);

      return {
        ...entity,
        pillar_1_cimd: dynVuln,
        baseline_grade: entity.grade,
        composite_score: finalScores[i],
        composite_score_raw: Math.round(rawComposites[i] * 100) / 100,
        grade,
        shap,
      };
    });

    const scoredRegional: ScoredPolicyEntity[] = regional.map((entity) => ({
      ...entity,
      baseline_grade: 'Regional',
      composite_score: 0.0,
      composite_score_raw: 0.0,
      grade: 'Regional',
      shap: PILLAR_MAP.map((p) => ({
        pillar: p.key,
        label: p.label,
        value: 0.0,
        color: p.color_pos,
        rawScore: 0.0,
        networkMean: 0.0,
        weight: 0.0,
      })),
    }));

    return {
      scoredRoutes: [...scoredMunicipal, ...scoredRegional],
      networkStats: {
        sigmoidMidpoint: compMean,
        sigmoidSteepness: steepness,
        quintileCuts: cuts,
        pillarMeans,
        gradeDistribution,
      },
    };
  }, [baseEntities, weights, activeDimensions, daScores]);
}

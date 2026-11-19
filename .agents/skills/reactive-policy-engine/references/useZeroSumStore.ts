/**
 * useZeroSumStore.ts — Reference Template for /reactive-policy-engine
 *
 * Zustand state machine implementing zero-sum policy weight sliders with the
 * Hamilton (Largest Remainder) integer-step apportionment method, pillar
 * checkbox disabling/enabling, atomic multi-weight updates (for presets and
 * 2D bilinear sensitivity terrains), and Grade vs. Stability focus isolation.
 */

import { create } from 'zustand';

export type WeightKey = 'vulnerability' | 'resilience' | 'monopoly' | 'opportunity';
export type CimdDimKey = 'econ' | 'res' | 'eth' | 'sit';

export interface PolicyEngineState {
  weights: Record<WeightKey, number>;
  disabledWeights: WeightKey[];
  activeDimensions: CimdDimKey[];
  mapFilterMode: 'grade' | 'stability';
  selectedGrade: string | null;
  selectedStabilityClasses: string[];

  // Actions
  setWeight: (key: WeightKey, value: number) => void;
  setWeights: (weights: Record<WeightKey, number>) => void;
  toggleWeightEnabled: (key: WeightKey) => void;
  toggleDimension: (dim: CimdDimKey) => void;
  setMapFilterMode: (mode: 'grade' | 'stability') => void;
  setSelectedGrade: (grade: string | null) => void;
  toggleStabilityClass: (cls: string) => void;
}

const STEP = 5;
const TOTAL_STEPS = 20; // 20 steps * 5% = 100%

/**
 * Distributes `targetRemainingSteps` across `keys` proportionally to their `currentSteps`
 * using the Largest Remainder (Hamilton) method so the integer step sum is strictly exact.
 */
function distributeHamiltonSteps(
  keys: WeightKey[],
  currentWeights: Record<WeightKey, number>,
  targetRemainingSteps: number
): Record<WeightKey, number> {
  const result = { ...currentWeights };
  if (keys.length === 0) return result;

  const itemSteps = keys.map((k) => ({
    key: k,
    steps: Math.round(currentWeights[k] / STEP),
  }));
  const totalCurrent = itemSteps.reduce((sum, item) => sum + item.steps, 0);

  if (totalCurrent === 0) {
    const baseShare = Math.floor(targetRemainingSteps / keys.length);
    const extra = targetRemainingSteps % keys.length;
    keys.forEach((k, idx) => {
      result[k] = (baseShare + (idx < extra ? 1 : 0)) * STEP;
    });
    return result;
  }

  const allocations = itemSteps.map((item) => {
    const ideal = (item.steps / totalCurrent) * targetRemainingSteps;
    const floor = Math.floor(ideal);
    return {
      key: item.key,
      allocated: floor,
      remainder: ideal - floor,
    };
  });

  const allocatedSum = allocations.reduce((sum, a) => sum + a.allocated, 0);
  const leftover = targetRemainingSteps - allocatedSum;

  allocations.sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; leftover > i; i++) {
    allocations[i].allocated += 1;
  }

  allocations.forEach((a) => {
    result[a.key] = a.allocated * STEP;
  });

  return result;
}

export const useZeroSumStore = create<PolicyEngineState>((set) => ({
  weights: {
    vulnerability: 15,
    resilience: 40,
    monopoly: 10,
    opportunity: 35,
  },
  disabledWeights: [],
  activeDimensions: ['econ', 'res', 'eth', 'sit'],
  mapFilterMode: 'grade',
  selectedGrade: null,
  selectedStabilityClasses: [],

  setWeight: (key, value) =>
    set((state) => {
      if (state.disabledWeights.includes(key)) return {};

      const allKeys = Object.keys(state.weights) as WeightKey[];
      const others = allKeys.filter((k) => k !== key && !state.disabledWeights.includes(k));
      if (others.length === 0) return {};

      const targetSteps = Math.min(Math.max(Math.round(value / STEP), 0), TOTAL_STEPS);
      const remainingSteps = TOTAL_STEPS - targetSteps;

      const updated = distributeHamiltonSteps(others, state.weights, remainingSteps);
      updated[key] = targetSteps * STEP;
      return { weights: updated };
    }),

  // Atomic multi-weight setter (prevents race conditions during preset restores or 2D terrain scrubs)
  setWeights: (weights) => set({ weights, disabledWeights: [] }),

  toggleWeightEnabled: (key) =>
    set((state) => {
      const allKeys = Object.keys(state.weights) as WeightKey[];
      const isDisabled = state.disabledWeights.includes(key);

      // Must keep at least one weight enabled
      if (!isDisabled && state.disabledWeights.length >= allKeys.length - 1) {
        return {};
      }

      const newDisabled = isDisabled
        ? state.disabledWeights.filter((k) => k !== key)
        : [...state.disabledWeights, key];

      const others = allKeys.filter((k) => k !== key && !newDisabled.includes(k));

      if (!isDisabled) {
        // Disabling `key`: lock to 0% and redistribute all 20 steps across remaining active keys
        const updated = distributeHamiltonSteps(others, state.weights, TOTAL_STEPS);
        updated[key] = 0;
        return { disabledWeights: newDisabled, weights: updated };
      } else {
        // Re-enabling `key`: seed at 10% (2 steps) and distribute 18 steps across others
        const seedSteps = 2;
        const updated = distributeHamiltonSteps(others, state.weights, TOTAL_STEPS - seedSteps);
        updated[key] = seedSteps * STEP;
        return { disabledWeights: newDisabled, weights: updated };
      }
    }),

  toggleDimension: (dim) =>
    set((state) => ({
      activeDimensions: state.activeDimensions.includes(dim)
        ? state.activeDimensions.filter((d) => d !== dim)
        : [...state.activeDimensions, dim],
    })),

  setMapFilterMode: (mode) =>
    set({ mapFilterMode: mode, selectedGrade: null, selectedStabilityClasses: [] }),

  setSelectedGrade: (grade) => set({ selectedGrade: grade }),

  toggleStabilityClass: (cls) =>
    set((state) => ({
      selectedStabilityClasses: state.selectedStabilityClasses.includes(cls)
        ? state.selectedStabilityClasses.filter((c) => c !== cls)
        : [...state.selectedStabilityClasses, cls],
    })),
}));

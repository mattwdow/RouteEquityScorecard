---
name: reactive-policy-engine
description: |
  Principal Policy Simulation & Reactive Multi-Criteria Scoring Architect. Designs and implements client/server dual-runtime policy decision engines with 100% Python-to-TypeScript mathematical parity. Features immutable base data loading via DuckDB-Wasm (CDN Blob Worker bypass), zero-sum Zustand weight sliders using the Hamilton (Largest Remainder) apportionment method, live Z-score/Sigmoid/Quintile recalibration (`useReactiveScoring`), real-time SHAP feature attribution waterfalls, bilinear 4-weight sensitivity terrain heatmaps, and vectorized Stars-and-Bars / binary-toggle Monte Carlo stability engines. Use whenever the user invokes /reactive-policy-engine, asks to build a reactive policy scorecard, needs zero-sum weight sliders, requests SHAP attribution breakdowns, or wants Monte Carlo weight sensitivity and stability classifications.
license: MIT
metadata:
  version: "1.0.0"
  author: "Antigravity Engineering"
---

# /reactive-policy-engine: Reactive Multi-Criteria Policy & Monte Carlo Engine

You are the Principal Policy Simulation & Decision Systems Architect for Antigravity. Your mission is to engineer zero-latency, mathematically transparent multi-criteria scoring engines that allow policy makers to drag weight sliders, toggle sub-dimensions, inspect feature-level SHAP attributions, and stress-test rankings across thousands of Monte Carlo weight permutations in real time.

Your architecture eliminates common policy dashboard failure modes: Python backend vs. TypeScript frontend rounding drift, zero-sum slider race conditions, uncalibrated linear sums that bunch scores in the middle, opaque black-box composite scores without attribution, and Next.js Webpack WASM worker crashes.

---

## 1. Operating Rules & Boundaries

1. **Immutable Base vs. Derived Reactive State:** Never mutate base pillar scores loaded from Parquet or JSON. Store raw/Z-scored pillar vectors in an immutable `baseEntities` collection, and compute composite scores, sigmoid transforms, quintile grades, and SHAP attributions exclusively inside a single memoized hook (`useReactiveScoring`). No downstream chart or map component may independently compute or cache composite scores.
2. **Strict Python $\leftrightarrow$ TypeScript Mathematical Parity:** The frontend TypeScript scoring hook (`useReactiveScoring.ts`) and backend Python calibration scripts (`refine_scoring.py` / `monte_carlo_simplex_engine.py`) must share identical equations: 95th-percentile outlier capping, Z-score standardization ($\mu=50, \sigma=20$), dynamic logistic sigmoid calibration ($k = 4.0 / (2 \cdot \sigma_C)$), and floor-indexed relative quintile cutoffs (`[0.2, 0.4, 0.6, 0.8]`). At default weights, frontend and backend scores must match within $\pm 0.01$.
3. **Hamilton (Largest Remainder) Zero-Sum Apportionment:** When a user adjusts one weight in a zero-sum system ($\sum w_k = 100\%$) or disables a pillar checkbox, never use naive floating-point division or sequential `setTimeout` updates. Convert weights to discrete integer steps (e.g., $20\text{ steps} \times 5\% = 100\%$), allocate remaining steps proportionally via floor division, and distribute leftover steps by descending fractional remainder. Always provide an atomic `setWeights(newWeights)` action for presets and 2D terrain dragging.
4. **Semantic Color Isolation on Input Controls:** Never style policy weight sliders or input checkboxes with the same high-contrast categorical colors used for scorecard grades (`A`–`E` emerald/blue/amber/orange/red). Style slider tracks in neutral medium slate (`#64748B`) with high-contrast black/white thumbs so policy inputs are visually decoupled from data outputs.
5. **SWC-Safe TypeScript Syntax in `.tsx` Files:** In Next.js SWC environments, never place angle-bracket generic type arguments (e.g., `useState<string>()` or `Array<keyof typeof weights>`) or raw `<` loop comparators inside `.tsx` component bodies where arrow functions (`=>`) follow. Always use `as` cast syntax (`useState('' as string)`) or move hooks into pure `.ts` files to prevent SWC JSX backtracking parser crashes.
6. **Transparent Stability Nomenclature:** When classifying entities via Monte Carlo weight sweeps, avoid opaque academic or geological jargon (e.g., avoid `"Bedrock"` in user-facing UI when plain language is preferred). Use self-explanatory policy tiers: `Essential Equity` (Always High Priority), `High Swing` (Policy Sensitive), `Low Swing` (Moderate Stability), and `Always Low Equity` (Consistently Low Priority).

---

## 2. Core Heuristics & Mathematical Architecture

### 2.1 End-to-End Scoring & Attribution Pipeline

| Stage | Mathematical Formulation | Operational Purpose |
| :--- | :--- | :--- |
| **1. Sub-Dimension Aggregation** | $P_{1,i} = \frac{\sum_{m \in M_{\text{active}}} \text{Pop}_m \cdot \left(\frac{1}{|D_{\text{active}}|} \sum_{d \in D_{\text{active}}} X_{m,d}\right)}{\sum_{m \in M_{\text{active}}} \text{Pop}_m}$ | Dynamically re-weights Pillar 1 when users toggle sub-indicators (e.g., 4 Statistics Canada CIMD dimensions) before composite scoring. |
| **2. Raw Weighted Composite** | $C_{\text{raw},i} = \sum_{k=1}^K w_k P_{k,i} \quad \text{where } \sum_{k=1}^K w_k = 1.0$ | Linear combination of standardized pillar scores ($P_{k,i} \in [0, 100]$). |
| **3. Dynamic Sigmoid Calibration** | $\mu_C = \text{mean}(C_{\text{raw}}), \quad \sigma_C = \text{std}(C_{\text{raw}}), \quad k = \frac{4.0}{2 \cdot \sigma_C}$<br>$S_i = \text{round}\left(\frac{100}{1 + \exp\left(-k \cdot (C_{\text{raw},i} - \mu_C)\right)}\right)$ | Stretches compressed linear sums across the full $0\text{–}100$ scale so $\pm 2\sigma_C$ spans roughly $12\text{ to }88$, preventing middle-bunching when weights are uniform. |
| **4. Relative Quintile Grading** | $\text{cuts} = \left[S_{\text{sorted}}[\lfloor 0.2N \rfloor], S_{\text{sorted}}[\lfloor 0.4N \rfloor], S_{\text{sorted}}[\lfloor 0.6N \rfloor], S_{\text{sorted}}[\lfloor 0.8N \rfloor]\right]$ | Guarantees balanced 20% cohort tiers (`A`, `B`, `C`, `D`, `E`) across municipal entities under any weight configuration. |
| **5. Exact Linear SHAP Attribution** | $\phi_{k,i} = w_k \cdot (P_{k,i} - \bar{P}_k) \implies C_{\text{raw},i} = \mu_C + \sum_{k=1}^K \phi_{k,i}$ | Explains exact positive (`#10B981` emerald) and negative (`#F43F5E` rose) pillar contributions from the network baseline ($\approx 50.0$) to the raw composite. |
| **6. No-Intercept OLS Driver Betas** | $S_{i,c} = \beta_{1,i} w_{1,c} + \beta_{2,i} w_{2,c} + \dots + \beta_{K,i} w_{K,c} + \varepsilon$ | Regresses simulated scores against simplex weight vectors $W$. Each $\beta_{k,i}$ represents the expected score of entity $i$ at 100% weight on pillar $k$. |

### 2.2 Combinatorial Monte Carlo Engines

1. **Stars & Bars Simplex Sweep (Continuous Pillars):**
   * For $K$ pillars in $5\%$ increments ($N = 20$ steps), generate all zero-sum weight vectors:
     $$\text{Configurations} = \binom{N + K - 1}{K - 1}$$
   * For $K = 4, N = 20$: $\binom{23}{3} = 1,771$ configurations (a 99.1% reduction vs. a $21^4 = 194,481$ brute-force grid).
   * For $K = 2, N = 20$: $\binom{21}{1} = 21$ configurations (used when 2 pillars are disabled).
2. **Binary Sub-Dimension Toggle Sweep ($2^k - 1$):**
   * For $k$ binary indicator toggles (e.g., 4 CIMD socio-economic dimensions), generate all $2^4 - 1 = 15$ non-empty subsets with equal weight $1/|S|$ per active indicator.
3. **Vectorized Matrix Evaluation:**
   * Always compute raw composites via single-pass matrix multiplication: `RawComposites = np.dot(P, W.T)` of shape `(N_entities, N_configs)`, followed by column-wise vectorized sigmoid and `np.percentile(..., [20, 40, 60, 80], axis=0)`.

---

## 3. Step-by-Step Execution Workflow

### Stage 1: DuckDB-Wasm Zero-Config Hydration & Store Setup
1. Initialize client-side Parquet analytical querying via [`references/useDuckDBWasm.ts`](./references/useDuckDBWasm.ts):
   * Load `@duckdb/duckdb-wasm` from `jsDelivr` CDN bundles and wrap `importScripts(bundle.mainWorker)` inside a local `Blob` URL (`URL.createObjectURL`) to bypass Next.js Webpack WASM bundler errors and Cross-Origin Worker security blocks.
2. Scaffold the Zustand policy state store using [`references/useZeroSumStore.ts`](./references/useZeroSumStore.ts):
   * Include `weights`, `disabledWeights`, `activeDimensions`, `mapFilterMode` (`'grade' | 'stability'`), `selectedStabilityClasses`, and Hamilton Largest Remainder redistribution in `setWeight` and `toggleWeightEnabled`.

### Stage 2: Reactive Scoring & SHAP Attribution Hook
1. Wire [`references/useReactiveScoring.ts`](./references/useReactiveScoring.ts) at the top-level dashboard container (`CommandCentre.tsx`):
   * Filter out `is_regional` entities before computing network pillar means $\bar{P}_k$, composite mean $\mu_C$, composite standard deviation $\sigma_C$, and quintile cutoffs.
   * Compute `shap` contribution arrays for every entity and attach `baseline_grade`, `composite_score_raw`, `composite_score`, and `grade`.
   * Pass `scoredEntities` and `networkStats` down as props to map layers, directory tables, scatterplots, and waterfalls.

### Stage 3: Vectorized Sensitivity & Stability Pre-Computation
1. Run [`references/monte_carlo_simplex_engine.py`](./references/monte_carlo_simplex_engine.py) to evaluate all simplex weight mixes (4-pillar and 2-pillar fallback) and binary indicator combinations.
2. Compute per-entity sensitivity metrics: `score_mean`, `score_std` (Robustness/Volatility $\sigma$), `score_min`, `score_max`, `score_range`, `grade_spread`, `pct_high_equity` (`A`/`B` rate), `pct_low_equity` (`D`/`E` rate), and OLS driver coefficients $\beta_k$.
3. Export summary CSVs (`public/data/sensitivity_summary.csv`, `sensitivity_summary_2_pillar.csv`) and enrich the primary JSON/Parquet asset with `stability_class` and `stability` metadata.
4. In the frontend container, dynamically swap the active `sensitivityData` lookup from the 4-pillar dataset to the 2-pillar dataset whenever two pillars are disabled in `disabledWeights`.

### Stage 4: Diagnostic & Interactive Policy Widgets
1. **Dual-Mode SHAP / OLS Sensitivity Waterfall (`ShapWaterfall.tsx`):**
   * Lock the horizontal SVG scale strictly to `[0, 100]` with vertical dashed reference lines at `0`, `50` (Baseline), and `100`.
   * In **Grade Focus Mode**, plot $\phi_k = w_k (P_k - \bar{P}_k)$ stepping from `50.0` to `RAW`, followed by a visually separated `FINAL` sigmoid bar.
   * In **Stability Focus Mode**, switch the waterfall to plot OLS driver sensitivity deviations: $\Delta_k = \beta_k \cdot (w_k - 0.25)$ relative to the entity's Monte Carlo `score_mean`.
   * Animate bar widths and numeric counters with Framer Motion springs (`useMotionValue`, `useSpring`).
2. **Bilinear 4-Weight Sensitivity Terrain (`TernaryWeightTerrain.tsx`):**
   * Map 2D square coordinates $(u, v) \in [0, 1]^2$ to four corner weights via bilinear interpolation:
     $$w_{\text{TL}} = (1-u)v, \quad w_{\text{TR}} = uv, \quad w_{\text{BR}} = u(1-v), \quad w_{\text{BL}} = (1-u)(1-v)$$
   * Render an in-memory HTML5 `<canvas>` pixel heatmap (`createImageData`) of the selected entity's score across all $(u, v)$ coordinates, overlaid with an SVG reticle that calls atomic `setWeights(coordsToWeights(u, v))` on pointer drag.
3. **Mean vs. Volatility Policy Risk Scatterplot & Live Monte Carlo Simulator:**
   * Plot `score_mean` (X-axis) against `score_std` (Y-axis) colored by `stability_class`, with hover tooltips rendering normal distribution bell-curve sparklines ($\mathcal{N}(\mu, \sigma^2)$).

---

## 4. Verification & Output Standards

Before marking any `/reactive-policy-engine` implementation complete, verify and present proof for all five gates:
1. **Zero-Sum Invariant Gate:** Confirm that across any sequence of slider drags, pillar disables/enables, or 2D terrain scrubs, $\sum_{k \notin \text{disabled}} w_k = 100$ (exact integer sum with zero floating-point drift).
2. **SHAP Additivity Identity Gate:** Confirm that for every municipal entity, $\text{Baseline} + \sum_{k=1}^K \phi_{k,i} = C_{\text{raw},i}$ within $\pm 0.01$.
3. **Python $\leftrightarrow$ TypeScript Parity Gate:** Confirm default-weight composite scores and quintile grade counts (`A`–`E`) in `useReactiveScoring.ts` match `monte_carlo_simplex_engine.py` output 100%.
4. **Fixed Baseline Domain Gate:** Confirm quadrant scatterplots and SHAP waterfalls lock their axis domains (`[0, 100]`) and reference crosshairs to the unfiltered municipal baseline (`allRoutes`) so isolating a single grade (`A`–`E`) never warps or rescales the chart axes.
5. **Build & Runtime Compilation Gate:** Compile all Python scripts (`py -m py_compile`) and verify zero TypeScript/SWC parser errors in `.ts` and `.tsx` files.

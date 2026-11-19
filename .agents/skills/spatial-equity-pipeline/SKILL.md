---
name: spatial-equity-pipeline
description: |
  Principal Geospatial Transit & Municipal Equity Pipeline Architect. Ingests GTFS schedule feeds, Statistics Canada Census Dissemination Area (DA) boundaries, CIMD socio-economic dimensions, and OpenStreetMap POIs to build pre-computed spatial equity assets (JSON, GeoJSON, and DuckDB Parquet). Enforces non-destructive shadow GTFS comparison, garage short-turn shape filtering, metric CRS projection (UTM / 10-TM), Shapely morphological closing for contiguous walkshed envelopes (90%+ payload reduction), proportional DA area intersections, KDTree destination catchments, and Capacity-Weighted Functional Monopoly Indexing (FMI). Use whenever the user invokes /spatial-equity-pipeline, asks to process GTFS transit feeds, compute spatial demographic catchments, optimize GeoJSON walkshed isochrones, or build municipal equity scoring pipelines.
license: MIT
metadata:
  version: "1.0.0"
  author: "Antigravity Engineering"
---

# /spatial-equity-pipeline: Geospatial Transit & Municipal Equity Engine

You are the Principal Geospatial & Transit Systems Architect for Antigravity. Your mission is to engineer deterministic, mathematically rigorous, and high-performance spatial data pipelines that join transit schedule feeds (GTFS), census demographic geometries (Dissemination Areas / Census Tracts), deprivation indices (Statistics Canada CIMD), and Points of Interest (POIs) into web-ready analytical assets (`JSON`, `GeoJSON`, and `Parquet`).

Your pipelines eliminate common geospatial failure modes: unprojected degree-space buffering, garage pull-out shape truncation, fragmented street-buffer polygon islands, uncalibrated census count vs. rate scaling, and destructive overwrites of live production assets.

---

## 1. Operating Rules & Boundaries

1. **Non-Destructive Shadow Pipeline First:** Never overwrite live production files (`public/data/*`) during initial GTFS or census ingestion. Always write candidate records to `scratch/` (e.g., `scratch/golden_route_record_new.json`) and generate a side-by-side delta audit (`docs/gtfs_route_comparison.csv` and `.md`) before running an atomic cutover script with automatic baseline backup (`data/archive_baseline/`).
2. **Mandatory Metric Projection Before Buffering:** Never call `.buffer()` or compute Euclidean distances in `EPSG:4326` (WGS84 latitude/longitude). Always project geometries to a local metric Coordinate Reference System first—such as `EPSG:32612` (UTM Zone 12N) or `EPSG:3400` (Alberta 10-TM)—perform all metric operations in metres, and reproject back to `EPSG:4326` only at serialization time.
3. **Representative Shape Filtering (Anti-Stub Rule):** Never select a route's spatial geometry using naive `trips.drop_duplicates('route_id')`. Early-morning garage pull-outs and short-turn stubs often appear first in `trips.txt`, truncating 15 km corridors to 2 km stubs. Always filter to shapes representing $\ge 20\%$ of the route's maximum shape trip frequency, then select the longest qualifying geometry (or `unary_union` main A/B branch shapes).
4. **Municipal vs. Regional Statistical Isolation:** When computing relative network normalizations (95th-percentile outlier caps, Z-score standardization, sigmoid transforms, and quintile grades `A`–`E`), strictly isolate municipal routes/stops (`is_regional == False`) from regional commuter or school special (`6xx`) routes so suburban commuter corridors do not skew city-wide equity cutoffs.
5. **Morphological Walkshed Compression:** Raw street-network buffers and multi-stop circles produce thousands of disconnected polygon slivers and bloated GeoJSON payloads (70+ MB). Always apply Shapely morphological closing (`buffer(+d)` $\to$ `buffer(-d)`), interior hole pruning, and Douglas-Peucker simplification (`simplify(3.0)`) in metric space to deliver contiguous corridor envelopes under 6 MB total.
6. **Windows Terminal Encoding Safety:** Never print raw Unicode emojis or non-ASCII mathematical symbols in Python CLI output logs on Windows (`CP1252` crash risk). Use clean ASCII status tags (`[1/6]`, `[SUCCESS]`, `[WARNING]`).

---

## 2. Core Heuristics & Mathematical Formulations

### 2.1 Spatial & Demographic Joining Heuristics

| Analytical Scale | Spatial Join Mechanism | Weighting Formula | Target Use Case |
| :--- | :--- | :--- | :--- |
| **Micro-Scale (Bus Stops)** | Geodesic Buffer $\cap$ DA Polygon (`sindex` accelerated) | **Proportional Area Overlap:** $w_{s,i} = \frac{\text{Area}(B_s \cap DA_i)}{\sum_k \text{Area}(B_s \cap DA_k)}$ | Individual bus stop equity, shelter allocation, micro-walksheds |
| **Meso-Scale (Transit Corridors)** | Route LineString to DA Centroid (with 400m polygon intersect fallback for industrial DAs) | **Linear Distance-Decay Social Gravity:** $G_r = \sum_{i \in D_r} \text{Pop}_i \cdot V_i \cdot \max\left(0.05, 1 - \frac{d_{i,r}}{R}\right)$ | Corridor-level vulnerability density (`pillar_1_vulnerability`) |
| **Variable Demographic Walksheds** | Mobility-Adjusted Time-Speed Isochrones ($R = v_{\text{group}} \times t$) | **Cohort Radii (5-min walk):** Standard Adult: $400\text{m}$ ($4.8\text{ km/h}$); Seniors / Encumbered / Children: $250\text{m}\text{–}300\text{m}$ ($3.0\text{–}3.6\text{ km/h}$); Rapid Walker: $600\text{m}$ | "15 Minutes. For Whom?" differential accessibility sensitivity |
| **Destination Catchments (POIs)** | `scipy.spatial.KDTree` in UTM metric coordinates | **Tiered Radius Ball Query:** $400\text{m}$ standard amenities (groceries, schools, clinics); $800\text{m}$ regional hospitals/emergency rooms | Critical opportunity access (`pillar_4_opportunity`) |

### 2.2 The Four Equity Pillars & Normalization Pipeline

1. **Pillar 1 — Demographic Vulnerability ($P_1$):**
   * **Continuous CIMD 4-Dimension Score:** Parse raw factor scores from Statistics Canada CIMD (`.xlsx` or `.csv`) for *Economic Dependency*, *Residential Instability*, *Ethno-Cultural Composition*, and *Situational Vulnerability*. Min-Max normalize each factor across populated DAs to $[1, 100]$, then compute population-weighted or area-weighted averages.
   * **6-Indicator Social Gravity ($V_i$):** Compute percentage rates (`low_income`, `minority`, `seniors`, `lone_parent`, `recent_immigrant`, `youth_15_24`) strictly guarded against `total_pop == 0`, Z-score standardize across populated DAs, and apply On-Demand Transit (ODT) zone discounts ($0.90\times$ vulnerability multiplier where supplemental ODT coverage exists).
2. **Pillar 2 — Temporal / Off-Peak Service Resilience ($P_2$):**
   * Stream `stop_times.txt` in 500,000-row chunks. Identify the most common full-service weekday in `calendar_dates.txt`.
   * For corridors: ratio of late-evening trips (`21:30`–`22:30`) to AM peak trips (`07:30`–`08:30`).
   * For stops: average hourly arrivals in peak windows (`07:00`–`09:00`, `16:00`–`18:00`, 4h divisor) vs. midday base window (`09:00`–`15:00`, 7h divisor).
3. **Pillar 3 — Capacity-Weighted Functional Monopoly Index ($P_3$ / $FMI$):**
   * For route $r$ serving DA $i$ and destination set $D_r$ with daily trip capacity $C_r$:
     $$FMI_{i,r} = \frac{1}{|D_r|} \sum_{d \in D_r} \frac{C_r}{C_r + \sum_{a \in A_{i,d}} C_a}$$
     where $A_{i,d}$ is the set of alternative routes serving both DA $i$ and destination $d$. Apply a $0.50\times$ discount for DAs inside On-Demand Transit (ODT) zones, then scale by $\ln(1 + C_r)$.
4. **Pillar 4 — Critical Destination Opportunities ($P_4$):**
   * Unique POI union across all stops served by route $r$: $D_r = \bigcup_{s \in S_r} \text{POI}(s)$.
5. **Phase A Network Calibration (Python $\leftrightarrow$ TypeScript Parity):**
   * **Step 1 (Outlier Cap):** Cap raw municipal pillar values at the 95th percentile ($P_{95}$).
   * **Step 2 (Z-Score Standardization):** Map each capped pillar to $\mu = 50.0, \sigma = 20.0$, clamped to $[0.0, 100.0]$.
   * **Step 3 (Weighted Composite & Sigmoid Transform):**
     $$C_{\text{raw}} = \sum_{k=1}^4 w_k P_k, \quad k_{\text{steep}} = \frac{4.0}{2 \cdot \sigma_{C}}, \quad S = \frac{100}{1 + \exp\left(-k_{\text{steep}} \cdot (C_{\text{raw}} - \mu_{C})\right)}$$
   * **Step 4 (Relative Quintile Grading):** Partition sorted municipal scores at the 20th, 40th, 60th, and 80th percentiles into grades `E`, `D`, `C`, `B`, `A`.

---

## 3. Step-by-Step Execution Workflow

### Stage 1: Feed Discovery & Non-Destructive Shadow Audit
1. Inspect the workspace for GTFS archives (`gtfs.zip`, `trips.txt`, `stop_times.txt`), DA boundaries (`da_boundaries_simple.geojson`), and socio-economic tables (`prairies_scores_quintiles_EN.xlsx`, `demographics.csv`).
2. Add any raw Socrata CSV exports ($>50\text{ MB}$) or `.zip` archives to `.gitignore` immediately to protect git remotes.
3. Run the shadow comparison pipeline (see [`references/gtfs_shadow_comparator.py`](./references/gtfs_shadow_comparator.py)):
   * Merge split A/B branches (e.g., `001A`/`001B` $\to$ `001`) where appropriate.
   * Filter out school specials (`6xx`) and tag regional routes (`is_regional`).
   * Extract representative corridor shapes using the $\ge 20\%$ max-frequency rule.
   * Output `scratch/golden_route_record_new.json` and `docs/gtfs_route_comparison.csv`.

### Stage 2: Spatial Catchment & Walkshed Envelope Generation
1. Project stop points, route LineStrings, and DA polygons to metric CRS (`EPSG:32612` or `EPSG:3400`).
2. For stop-level assets: build an R-tree spatial index (`gdf_das.sindex`), intersect $R$-metre buffers (e.g., $400\text{m}$ standard or multi-tier $200\text{m}/300\text{m}/400\text{m}/600\text{m}$ demographic walksheds) against DA polygons, and compute proportional area weights.
3. For corridor walk isochrones: run [`references/walkshed_morphology.py`](./references/walkshed_morphology.py) to apply morphological closing (`closing_dist = 85.0m`), prune micro-slivers ($< 5,000\text{ m}^2$), fill minor interior voids ($< 15,000\text{ m}^2$), and simplify vertices (`3.0m` tolerance).

### Stage 3: Vectorized Sensitivity & Monte Carlo Stability Classification
1. Before finalizing any spatial asset, evaluate score durability across weight permutations:
   * **Discrete Indicator Combinations ($2^k - 1$):** For $k=4$ CIMD dimensions, evaluate all 15 active binary toggle combinations via matrix multiplication (`(N_stops, 4) @ (4, 15)`).
   * **Simplex Weight Sweep:** For 4-pillar or 2-pillar route models, evaluate all zero-sum weight combinations across the policy simplex.
2. Classify each spatial entity into four transparent policy tiers (avoiding opaque jargon):
   * `Essential Equity` (Grade A/B in $\ge 85\%$ of runs, high mean score)
   * `High Swing` (Grade spread $\ge 3$ letter grades or score range $\ge 25.0$)
   * `Low Swing` (Stable intermediate scores, 1–2 grade spread)
   * `Always Low Equity` (Grade D/E in $\ge 85\%$ of runs)
3. Embed the resulting `stability` object directly into the JSON/Parquet record and export a summary CSV (`public/data/*_sensitivity_summary.csv`).

### Stage 4: Atomic Production Cutover & Dual-Format Serialization
1. Archive current production assets to `data/archive_baseline/`.
2. Promote candidate JSON assets to `public/data/`.
3. Serialize DuckDB-Wasm compatible Parquet files using the 1-row nested schema (`pd.DataFrame([{"metadata": ..., "routes": ...}]).to_parquet(...)`) so frontend `useDuckDB` hooks load with zero schema friction.
4. Verify that every `route_id` in `golden_route_record.json` has a corresponding `{route_id}.json` walk envelope in `public/data/isochrones/` to prevent HTTP 404 errors on map selection.

---

## 4. Verification & Output Standards

Before declaring any spatial pipeline task complete, verify and present proof for all five gates:
1. **Zero NaN / Zero Infinity Gate:** Confirm `0` NaN, null, or infinite values across all normalized pillar scores, percentiles, and DA overlap percentages.
2. **Quintile Balance Gate:** Verify municipal grades `A`, `B`, `C`, `D`, `E` each contain $20\% \pm 1\%$ of municipal entities, and all regional entities are strictly labeled `"Regional"`.
3. **Python $\leftrightarrow$ TypeScript Parity Gate:** Confirm `metadata.scoring` (`sigmoid_midpoint`, `sigmoid_steepness`, `quintileCuts`) matches the frontend reactive scoring hook (`useReactiveScoring.ts`) within $\pm 0.01$.
4. **Payload Weight Gate:** Confirm individual route isochrone GeoJSONs average $< 50\text{ KB}$ and total `public/data/isochrones/` directory weight remains $< 10\text{ MB}$.
5. **Asset Completeness Gate:** Confirm 100% 1-to-1 coverage between active route IDs and isochrone GeoJSON files.

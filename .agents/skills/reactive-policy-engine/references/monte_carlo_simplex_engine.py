"""
monte_carlo_simplex_engine.py — Reference Template for /reactive-policy-engine
Vectorized Monte Carlo sensitivity & stability classification engine supporting:
  1. Stars-and-Bars Simplex Weight Sweeps (e.g., 1,771 zero-sum 4-pillar mixes or 21 2-pillar mixes)
  2. Binary Indicator Subset Sweeps (2^k - 1 active combinations)
  3. Dynamic Sigmoid & Relative Quintile Grading via NumPy broadcasting
  4. No-Intercept OLS Regression Driver Betas
  5. Transparent 4-Tier Stability Classification (Essential Equity, High Swing, Low Swing, Always Low Equity)
"""
import itertools
import numpy as np
import pandas as pd


def generate_simplex_weights(num_pillars: int = 4, step_pct: int = 5) -> np.ndarray:
    """
    Generates all valid zero-sum weight vectors (w_1 + ... + w_K = 1.0) in increments of `step_pct`.
    For K=4, step=5%: returns (1771, 4) matrix. For K=2, step=5%: returns (21, 2) matrix.
    """
    total_steps = 100 // step_pct
    configs = []

    def backtrack(remaining_pillars: int, remaining_steps: int, current: list[int]):
        if remaining_pillars == 1:
            configs.append([ (s * step_pct) / 100.0 for s in (current + [remaining_steps]) ])
            return
        for s in range(remaining_steps + 1):
            backtrack(remaining_pillars - 1, remaining_steps - s, current + [s])

    backtrack(num_pillars, total_steps, [])
    return np.array(configs, dtype=np.float64)


def generate_binary_toggle_weights(num_dimensions: int = 4) -> tuple[np.ndarray, list[str]]:
    """
    Generates all (2^k - 1) non-empty binary indicator toggle combinations with equal weights.
    For k=4: returns (15, 4) matrix.
    """
    configs = []
    labels = []
    for r in range(1, num_dimensions + 1):
        for combo in itertools.combinations(range(num_dimensions), r):
            w = np.zeros(num_dimensions, dtype=np.float64)
            for idx in combo:
                w[idx] = 1.0 / len(combo)
            configs.append(w)
            labels.append("+".join(f"D{i+1}" for i in combo))
    return np.array(configs, dtype=np.float64), labels


def evaluate_monte_carlo_matrix(
    pillar_matrix: np.ndarray,
    weight_matrix: np.ndarray,
    apply_sigmoid: bool = True,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Evaluates all entities across all weight configurations via vectorized matrix multiplication.
    - pillar_matrix: shape (N_entities, K)
    - weight_matrix: shape (N_configs, K)
    Returns:
      - scores: float array of shape (N_entities, N_configs) in [0, 100]
      - grades: object array of shape (N_entities, N_configs) with values 'A'..'E'
    """
    raw_composites = np.dot(pillar_matrix, weight_matrix.T)  # (N_entities, N_configs)

    if apply_sigmoid:
        comp_mean = np.mean(raw_composites, axis=0)
        comp_sd = np.std(raw_composites, axis=0)
        steepness = np.where(comp_sd > 0, 4.0 / (2.0 * comp_sd), 0.08)
        exponent = -steepness * (raw_composites - comp_mean)
        scores = np.round(100.0 / (1.0 + np.exp(exponent)), 2)
    else:
        scores = np.round(raw_composites, 1)

    n_entities, n_configs = scores.shape
    grades = np.empty((n_entities, n_configs), dtype="object")

    for c in range(n_configs):
        col = scores[:, c]
        cuts = np.percentile(col, [20, 40, 60, 80])
        col_g = np.empty(n_entities, dtype="object")
        col_g[col < cuts[0]] = "E"
        col_g[(col >= cuts[0]) & (col < cuts[1])] = "D"
        col_g[(col >= cuts[1]) & (col < cuts[2])] = "C"
        col_g[(col >= cuts[2]) & (col < cuts[3])] = "B"
        col_g[col >= cuts[3]] = "A"
        grades[:, c] = col_g

    return scores, grades


def summarize_entity_stability(
    entity_ids: list[str],
    scores: np.ndarray,
    grades: np.ndarray,
    weight_matrix: np.ndarray,
    high_equity_threshold: float = 0.85,
) -> pd.DataFrame:
    """
    Computes mean score, volatility (SD), grade spread, no-intercept OLS driver betas,
    and transparent stability classifications for each entity.
    """
    grade_map = {"A": 5, "B": 4, "C": 3, "D": 2, "E": 1}
    num_grades = np.vectorize(grade_map.get)(grades)

    rows = []
    for i, eid in enumerate(entity_ids):
        y = scores[i, :]
        g_row = num_grades[i, :]

        # No-intercept OLS driver betas: expected score when weight_k = 100%
        betas = np.linalg.lstsq(weight_matrix, y, rcond=None)[0]

        pct_ab = float(np.mean((g_row == 5) | (g_row == 4)))
        pct_de = float(np.mean((g_row == 2) | (g_row == 1)))
        mean_s = float(np.round(np.mean(y), 2))
        std_s = float(np.round(np.std(y), 2))
        min_s = float(np.round(np.min(y), 2))
        max_s = float(np.round(np.max(y), 2))
        g_spread = int(np.max(g_row) - np.min(g_row))

        if pct_ab >= high_equity_threshold and mean_s >= 50.0:
            stability_class = "Essential Equity"
        elif pct_de >= high_equity_threshold and mean_s < 50.0:
            stability_class = "Always Low Equity"
        elif g_spread >= 3 or (max_s - min_s) >= 25.0:
            stability_class = "High Swing"
        else:
            stability_class = "Low Swing"

        row_dict = {
            "entity_id": eid,
            "stability_class": stability_class,
            "score_mean": mean_s,
            "score_std": std_s,
            "score_min": min_s,
            "score_max": max_s,
            "score_range": round(max_s - min_s, 2),
            "grade_spread": g_spread,
            "pct_high_equity": round(pct_ab * 100.0, 1),
            "pct_low_equity": round(pct_de * 100.0, 1),
        }
        for k_idx, b_val in enumerate(betas):
            row_dict[f"driver_p{k_idx + 1}"] = round(float(b_val), 2)

        rows.append(row_dict)

    return pd.DataFrame(rows)

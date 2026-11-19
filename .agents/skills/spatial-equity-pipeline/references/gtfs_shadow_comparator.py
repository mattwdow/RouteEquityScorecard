"""
gtfs_shadow_comparator.py — Reference Template for /spatial-equity-pipeline
Core mathematical primitives for non-destructive GTFS feed comparison, representative
shape selection (anti-garage-stub filtering), continuous Statistics Canada CIMD
parsing, and Phase A network normalization (95th-percentile cap -> Z-score -> Sigmoid -> Quintiles).
"""
import math
import zipfile
import xml.etree.ElementTree as ET
import numpy as np
import pandas as pd


def percentile(values: list[float], p: float) -> float:
    """Deterministic linear-interpolated percentile matching Python and TypeScript scoring hooks."""
    sorted_v = sorted(values)
    if not sorted_v:
        return 0.0
    k = (len(sorted_v) - 1) * (p / 100.0)
    f = int(k)
    c = f + 1 if f + 1 < len(sorted_v) else f
    d = k - f
    return sorted_v[f] + d * (sorted_v[c] - sorted_v[f])


def zscore_normalize(values: list[float], target_mean: float = 50.0, target_sd: float = 20.0) -> list[float]:
    """Standardizes a capped metric vector to target mean and SD, clamped to [0, 100]."""
    n = len(values)
    if n == 0:
        return []
    raw_mean = sum(values) / n
    raw_sd = math.sqrt(sum((v - raw_mean) ** 2 for v in values) / n)
    if raw_sd == 0:
        return [target_mean] * n
    return [
        round(max(0.0, min(100.0, target_mean + ((v - raw_mean) / raw_sd) * target_sd)), 2)
        for v in values
    ]


def sigmoid(x: float, midpoint: float = 50.0, steepness: float = 0.08) -> float:
    """Calibrated logistic S-curve transformation."""
    try:
        return 100.0 / (1.0 + math.exp(-steepness * (x - midpoint)))
    except OverflowError:
        return 0.0 if x < midpoint else 100.0


def select_representative_shape_id(route_trips_df: pd.DataFrame, shape_coords_map: dict, min_freq_ratio: float = 0.20) -> str:
    """
    Prevents the 'drop_duplicates(route_id)' short-turn truncation bug.
    Filters to main service shapes (>= 20% of max shape trip count for the route)
    and selects the longest qualifying shape so garage pull-outs never represent a corridor.
    """
    sh_vc = route_trips_df["shape_id"].value_counts()
    if sh_vc.empty:
        return ""
    max_sh_count = sh_vc.iloc[0]
    candidate_shapes = [sh for sh, cnt in sh_vc.items() if cnt >= max_sh_count * min_freq_ratio]
    return max(candidate_shapes, key=lambda sh: len(shape_coords_map.get(sh, [])))


def parse_xlsx_raw_sheet1(excel_path: str) -> pd.DataFrame:
    """
    Zero-dependency native XML parser for Statistics Canada CIMD .xlsx workbooks.
    Avoids openpyxl/xlrd environment issues while preserving exact floating-point factor scores.
    """
    with zipfile.ZipFile(excel_path, "r") as z:
        shared_strings = []
        if "xl/sharedStrings.xml" in z.namelist():
            ss_tree = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in ss_tree.findall("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si"):
                text = "".join(
                    [t.text or "" for t in si.findall(".//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t")]
                )
                shared_strings.append(text)

        sheet_tree = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))
        sheet_data = sheet_tree.find("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheetData")

        rows = []
        for row_elem in sheet_data.findall("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row"):
            row_vals = {}
            for cell in row_elem.findall("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c"):
                r_ref = cell.attrib.get("r", "")
                t_type = cell.attrib.get("t", "")
                v_elem = cell.find("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v")
                val = v_elem.text if v_elem is not None else None
                if t_type == "s" and val is not None:
                    val = shared_strings[int(val)] if int(val) < len(shared_strings) else val
                col_letter = "".join([c for c in r_ref if c.isalpha()])
                row_vals[col_letter] = val
            rows.append(row_vals)

        df = pd.DataFrame(rows)
        header = df.iloc[0]
        df = df[1:].copy()
        df.columns = [str(c).strip() for c in header]
        return df

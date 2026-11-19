"""
walkshed_morphology.py — Reference Template for /spatial-equity-pipeline
Transforms fragmented street-buffer or stop-buffer MultiPolygons into unified,
contiguous pedestrian walkshed envelopes using Shapely morphological closing
(dilation + unary union + erosion) in metric projected space (EPSG:32612).

Supports multi-tier demographic walkshed radii (e.g., 250m Senior/Encumbered,
400m Standard Adult, 600m Rapid Transit Walker).
"""
import glob
import json
import os
import time
import pyproj
from shapely.geometry import LineString, MultiPolygon, Point, Polygon, mapping, shape
from shapely.ops import transform

# Coordinate transformers between WGS84 (EPSG:4326) and UTM Zone 12N (EPSG:32612, metric metres)
TRANSFORM_TO_UTM = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:32612", always_xy=True).transform
TRANSFORM_TO_WGS = pyproj.Transformer.from_crs("EPSG:32612", "EPSG:4326", always_xy=True).transform


def remove_small_holes(poly: Polygon, min_hole_area: float = 15000.0) -> Polygon:
    """Removes small interior voids (median gaps, building lots) while preserving major geographic barriers."""
    if not poly.interiors:
        return poly
    kept_interiors = [
        interior for interior in poly.interiors
        if Polygon(interior).area >= min_hole_area
    ]
    return Polygon(poly.exterior, kept_interiors)


def unify_walkshed_geometry(
    geom_4326,
    closing_dist: float = 85.0,
    min_island_area: float = 5000.0,
    min_hole_area: float = 15000.0,
    simplify_tol: float = 3.0,
):
    """
    Applies morphological closing in metric space to dissolve disconnected street network
    buffers into a contiguous corridor walking envelope, cutting GeoJSON weight by ~90%.
    """
    if geom_4326.is_empty:
        return geom_4326

    geom_utm = transform(TRANSFORM_TO_UTM, geom_4326)
    dilated = geom_utm.buffer(closing_dist, quad_segs=8)
    closed = dilated.buffer(-closing_dist, quad_segs=8).simplify(simplify_tol, preserve_topology=True)

    geoms = closed.geoms if isinstance(closed, MultiPolygon) else [closed]
    cleaned_parts = [
        remove_small_holes(g, min_hole_area=min_hole_area)
        for g in geoms
        if g.area >= min_island_area
    ]

    if not cleaned_parts:
        cleaned_parts = list(geoms)

    final_utm = MultiPolygon(cleaned_parts) if len(cleaned_parts) > 1 else cleaned_parts[0]
    return transform(TRANSFORM_TO_WGS, final_utm)


def build_corridor_walkshed_from_coords(
    coords_lat_lon: list,
    walk_radius_m: float = 400.0,
    closing_dist: float = 85.0,
    simplify_tol: float = 3.0,
):
    """
    Generates a unified metric walkshed polygon directly from a list of [lat, lon] route coordinates.
    """
    geom_coords = [(lon, lat) for lat, lon in coords_lat_lon]
    raw_geom_4326 = LineString(geom_coords) if len(geom_coords) >= 2 else Point(geom_coords[0])
    geom_utm = transform(TRANSFORM_TO_UTM, raw_geom_4326)
    buffered_utm = geom_utm.buffer(walk_radius_m, quad_segs=8)
    buffered_4326 = transform(TRANSFORM_TO_WGS, buffered_utm)
    return unify_walkshed_geometry(
        buffered_4326,
        closing_dist=closing_dist,
        simplify_tol=simplify_tol,
    )

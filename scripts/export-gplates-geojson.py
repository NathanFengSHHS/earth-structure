#!/usr/bin/env python3
"""
Export reconstructed GPlates GeoJSON from the official GPlates 2.5 GeoData bundle.

Requires:
  1. data/gplates-source/gplates_2.5.0_geodata.zip (download via scripts/download-gplates-geodata.sh)
  2. .venv-gplates with pygplates (pip install pygplates)

Outputs to public/data/gplates/{eraId}-coastlines.json, {eraId}-plates.json, and {eraId}-land.json
"""

from __future__ import annotations

import json
import os
import sys
from collections import defaultdict

import pygplates

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEODATA = os.path.join(ROOT, "data", "gplates-source", "GeoData", "FeatureCollections")
ROT_FILE = os.path.join(
    GEODATA,
    "Rotations",
    "Zahirovic_etal_2022_OptimisedMantleRef_and_NNRMantleRef.rot",
)
STATIC_FILE = os.path.join(
    GEODATA,
    "StaticPolygons",
    "Global_EarthByte_GPlates_PresentDay_StaticPlatePolygons.gpmlz",
)
COAST_FILE = os.path.join(
    GEODATA,
    "Coastlines",
    "Global_EarthByte_GPlates_PresentDay_Coastlines.gpmlz",
)
CONTINENTAL_FILE = os.path.join(
    GEODATA,
    "ContinentalPolygons",
    "Global_EarthByte_GPlates_PresentDay_ContinentalPolygons.gpmlz",
)
PALEO_DIR = os.path.join(GEODATA, "Paleogeography", "Global_Cao_etal")
PALEO_LAND_FILES = [
    os.path.join(PALEO_DIR, "i_402_2.shp"),
    os.path.join(PALEO_DIR, "m_402_2.shp"),
    os.path.join(PALEO_DIR, "lm_402_2.shp"),
]
OUT_DIR = os.path.join(ROOT, "public", "data", "gplates")

ERAS = [
    ("devonian", 410),
    ("late-devonian", 360),
    ("carboniferous", 320),
    ("permian", 280),
    ("pangaea", 250),
    ("early-breakup", 200),
    ("jurassic", 170),
    ("cretaceous", 100),
    ("paleocene", 60),
    ("eocene", 40),
    ("present", 0),
]

PLATE_COLORS = {
    "Africa": "#d4a574",
    "North America": "#6b9e6b",
    "South America": "#8fbc6b",
    "Eurasia": "#7eb8da",
    "Australia": "#c98b6b",
    "Antarctica": "#a8c8e8",
    "Pacific": "#4a7eb8",
    "India": "#e8a87c",
    "Nazca": "#5a8ea8",
    "Cocos": "#6a9e88",
    "Caribbean": "#9eb87a",
    "Philippine Sea": "#7a9ec8",
    "Juan de Fuca": "#8a8eb8",
    "Arabia": "#c4a060",
    "Scotia": "#88a8c0",
}

CONTINENT_COLORS = {
    "Africa": "#d4a574",
    "North America": "#6b9e6b",
    "South America": "#8fbc6b",
    "Eurasia": "#7eb8da",
    "Australia": "#c98b6b",
    "Antarctica": "#a8c8e8",
    "India": "#e8a87c",
    "Arabia": "#c4a060",
    "Other": "#5a7350",
}

MAJOR_CONTINENTS = [
    "Africa",
    "North America",
    "South America",
    "Eurasia",
    "Australia",
    "Antarctica",
    "India",
    "Arabia",
    "Other",
]


def classify_continent(name: str) -> str:
    """Map GPlates continental polygon names to major continents."""
    n = name.lower()
    if not name:
        return "Other"

    if "antarct" in n or "marie byrd" in n:
        return "Antarctica"
    if "africa" in n or "madagascar" in n or "somalia" in n or "congo" in n or "kalahari" in n:
        return "Africa"
    if (
        "south america" in n
        or "parana" in n
        or "amazonia" in n
        or "andes" in n
        or "patagonian" in n
    ):
        return "South America"
    if (
        "north america" in n
        or "greenland" in n
        or "avalon" in n
        or "laurentia" in n
        or "baffin" in n
        or "acadia" in n
        or "mexico" in n
        or "yucatan" in n
        or "central america" in n
        or "florida" in n
        or "bering" in n
        or "caribbean" in n
        or "bahamas" in n
        or "cuba" in n
    ):
        return "North America"
    if (
        "australia" in n
        or "new zealand" in n
        or "zealandia" in n
        or "papua" in n
        or "lord howe" in n
    ):
        return "Australia"
    if name == "India" or n.startswith("india "):
        return "India"
    if "arabia" in n or "lut (iran)" in n:
        return "Arabia"
    if any(
        k in n
        for k in [
            "eurasia",
            "baltica",
            "siberia",
            "china",
            "europe",
            "scandinavia",
            "tibet",
            "japan",
            "honshu",
            "hokkaido",
            "indochina",
            "kazakh",
            "mongol",
            "appalachian",
            "urals",
            "caucasus",
            "anatolia",
            "apennine",
            "alps",
            "iberia",
            "britain",
            "england",
            "scotland",
            "armorica",
            "korea",
            "taiwan",
            "borneo",
            "sumatra",
            "java",
            "philippine",
            "sunda",
            "laurussia",
            "tarim",
            "ala shan",
            "kara block",
            "adria",
            "apulia",
            "alboran",
            "balkans",
        ]
    ):
        return "Eurasia"
    return "Other"


def color_for_continent(name: str) -> str:
    if name in CONTINENT_COLORS:
        return CONTINENT_COLORS[name]
    h = abs(hash(name)) % 360
    return f"hsl({h}, 45%, 52%)"

LAND_SIMPLIFY_MAX_POINTS = 64


def color_for_plate(name: str) -> str:
    if name in PLATE_COLORS:
        return PLATE_COLORS[name]
    h = abs(hash(name)) % 360
    return f"hsl({h}, 45%, 52%)"


def simplify_ring(coords: list[list[float]], max_points: int = 36) -> list[list[float]]:
    """Decimate [lon, lat] ring vertices for lighter web payloads."""
    if len(coords) <= max_points:
        return coords
    step = max(1, len(coords) // max_points)
    simplified = coords[::step]
    if simplified[0] != simplified[-1]:
        simplified.append(simplified[0])
    return simplified


def polygon_to_coords(poly: pygplates.PolygonOnSphere, max_points: int = 36) -> list[list[float]]:
    latlons = poly.to_lat_lon_list()
    ring = [[lon, lat] for lat, lon in latlons]
    if ring and ring[0] != ring[-1]:
        ring.append(ring[0])
    return simplify_ring(ring, max_points)


def geometry_to_geojson(geom, max_points: int = 36) -> dict | None:
    if isinstance(geom, pygplates.PolygonOnSphere):
        ring = polygon_to_coords(geom, max_points)
        return {"type": "Polygon", "coordinates": [ring]}
    return None


def reconstruct_collection(
    features: pygplates.FeatureCollection | list,
    rotation_model: pygplates.RotationModel,
    age_ma: float,
) -> list:
    reconstructed: list = []
    pygplates.reconstruct(features, rotation_model, reconstructed, age_ma)
    return reconstructed


def reconstructed_to_features(
    reconstructed: list,
    feature_id_key: str = "featureId",
) -> list[dict]:
    features = []
    for index, item in enumerate(reconstructed):
        geom = geometry_to_geojson(item.get_reconstructed_geometry())
        if not geom:
            continue

        source_feature = item.get_feature()
        feature_id = str(source_feature.get_feature_id())
        attrs = source_feature.get_shapefile_attributes()
        if attrs and "FEATURE_ID" in attrs:
            feature_id = str(attrs["FEATURE_ID"])

        features.append(
            {
                "type": "Feature",
                "geometry": geom,
                "properties": {
                    feature_id_key: feature_id or f"land-{index}",
                },
            }
        )
    return features


def export_coastlines(
    coastlines: pygplates.FeatureCollection,
    rotation_model: pygplates.RotationModel,
    age_ma: float,
) -> dict:
    reconstructed = reconstruct_collection(coastlines, rotation_model, age_ma)
    return {
        "type": "FeatureCollection",
        "features": reconstructed_to_features(reconstructed),
    }


def export_continental_land(
    continental_polygons: pygplates.FeatureCollection,
    rotation_model: pygplates.RotationModel,
    age_ma: float,
) -> dict:
    """Continental polygons with stable feature IDs for smooth morphing between eras."""
    reconstructed = reconstruct_collection(continental_polygons, rotation_model, age_ma)
    features = []
    for index, item in enumerate(reconstructed):
        geom = geometry_to_geojson(item.get_reconstructed_geometry(), LAND_SIMPLIFY_MAX_POINTS)
        if not geom:
            continue
        feature_id = str(item.get_feature().get_feature_id())
        features.append(
            {
                "type": "Feature",
                "geometry": geom,
                "properties": {
                    "featureId": feature_id or f"continental-{index}",
                    "source": "continental",
                },
            }
        )
    return {"type": "FeatureCollection", "features": features}


def export_land_paleogeography(
    paleo_layers: list[pygplates.FeatureCollection],
    continental_polygons: pygplates.FeatureCollection,
    rotation_model: pygplates.RotationModel,
    age_ma: float,
) -> dict:
    """
    Export emergent land using Cao et al. (2017) paleogeography where available,
    falling back to Zahirovic et al. (2022) continental polygons.
    """
    valid_features = []
    for layer in paleo_layers:
        valid_features.extend(f for f in layer if f.is_valid_at_time(age_ma))

    if valid_features:
        reconstructed = reconstruct_collection(valid_features, rotation_model, age_ma)
        features = []
        for index, item in enumerate(reconstructed):
            geom = geometry_to_geojson(item.get_reconstructed_geometry(), LAND_SIMPLIFY_MAX_POINTS)
            if not geom:
                continue
            source_feature = item.get_feature()
            attrs = source_feature.get_shapefile_attributes()
            feature_id = str(attrs.get("FEATURE_ID", source_feature.get_feature_id()))
            features.append(
                {
                    "type": "Feature",
                    "geometry": geom,
                    "properties": {
                        "featureId": feature_id or f"paleo-land-{index}",
                        "source": "Cao2017",
                    },
                }
            )
        return {"type": "FeatureCollection", "features": features}

    reconstructed = reconstruct_collection(continental_polygons, rotation_model, age_ma)
    features = []
    for index, item in enumerate(reconstructed):
        geom = geometry_to_geojson(item.get_reconstructed_geometry(), LAND_SIMPLIFY_MAX_POINTS)
        if not geom:
            continue
        feature_id = str(item.get_feature().get_feature_id())
        features.append(
            {
                "type": "Feature",
                "geometry": geom,
                "properties": {
                    "featureId": feature_id or f"continental-{index}",
                    "source": "continental",
                },
            }
        )
    return {"type": "FeatureCollection", "features": features}


def export_continents(
    continental_polygons: pygplates.FeatureCollection,
    rotation_model: pygplates.RotationModel,
    age_ma: float,
) -> dict:
    """Group continental polygons into major continents with stable names for morphing."""
    reconstructed = reconstruct_collection(continental_polygons, rotation_model, age_ma)
    grouped: dict[str, list] = defaultdict(list)
    areas: dict[str, float] = defaultdict(float)

    for item in reconstructed:
        region_name = (item.get_feature().get_name() or "").strip()
        continent = classify_continent(region_name)
        geom = item.get_reconstructed_geometry()
        if not isinstance(geom, pygplates.PolygonOnSphere):
            continue
        ring = polygon_to_coords(geom)
        area = geom.get_area()
        grouped[continent].append(ring)
        areas[continent] += area

    features = []
    for continent in MAJOR_CONTINENTS:
        rings = grouped.get(continent)
        if not rings:
            continue
        if len(rings) == 1:
            geometry = {"type": "Polygon", "coordinates": [rings[0]]}
        else:
            geometry = {"type": "MultiPolygon", "coordinates": [[r] for r in rings]}
        features.append(
            {
                "type": "Feature",
                "geometry": geometry,
                "properties": {
                    "name": continent,
                    "color": color_for_continent(continent),
                },
            }
        )

    return {"type": "FeatureCollection", "features": features}


def export_plates(
    static_polygons: pygplates.FeatureCollection,
    rotation_model: pygplates.RotationModel,
    age_ma: float,
    min_area: float = 8e12,
    max_plates: int = 24,
) -> dict:
    reconstructed = reconstruct_collection(static_polygons, rotation_model, age_ma)
    grouped: dict[str, list] = defaultdict(list)
    areas: dict[str, float] = defaultdict(float)

    for item in reconstructed:
        name = (item.get_feature().get_name() or "").strip()
        if not name or name == "0":
            continue
        geom = item.get_reconstructed_geometry()
        if not isinstance(geom, pygplates.PolygonOnSphere):
            continue
        ring = polygon_to_coords(geom)
        area = geom.get_area()
        grouped[name].append(ring)
        areas[name] += area

    ranked = sorted(areas.items(), key=lambda x: x[1], reverse=True)
    selected = {name for name, area in ranked if area >= min_area}
    if len(selected) < 6:
        selected = {name for name, _ in ranked[:max_plates]}
    else:
        selected = set(list(selected)[:max_plates])

    features = []
    for name in sorted(selected):
        rings = grouped[name]
        if len(rings) == 1:
            geometry = {"type": "Polygon", "coordinates": [rings[0]]}
        else:
            geometry = {"type": "MultiPolygon", "coordinates": [[r] for r in rings]}
        features.append(
            {
                "type": "Feature",
                "geometry": geometry,
                "properties": {"name": name, "color": color_for_plate(name)},
            }
        )

    return {"type": "FeatureCollection", "features": features}


def main() -> int:
    if not os.path.isfile(ROT_FILE):
        print("Missing GPlates GeoData. Run: ./scripts/download-gplates-geodata.sh", file=sys.stderr)
        return 1

    for path in PALEO_LAND_FILES:
        if not os.path.isfile(path):
            print(f"Missing paleogeography file: {path}", file=sys.stderr)
            print("Re-run: ./scripts/download-gplates-geodata.sh", file=sys.stderr)
            return 1

    os.makedirs(OUT_DIR, exist_ok=True)

    print("Loading GPlates rotation model and feature collections…")
    rotation_model = pygplates.RotationModel(ROT_FILE)
    static_polygons = pygplates.FeatureCollection(STATIC_FILE)
    coastlines = pygplates.FeatureCollection(COAST_FILE)
    continental_polygons = pygplates.FeatureCollection(CONTINENTAL_FILE)
    paleo_layers = [pygplates.FeatureCollection(path) for path in PALEO_LAND_FILES]

    manifest = {
        "model": "Zahirovic et al. (2022)",
        "source": "GPlates 2.5 GeoData (EarthByte, CC BY 3.0)",
        "landModel": "Cao et al. (2017) paleogeography at era keyframes; continental polygons for motion",
        "maxAgeMa": ERAS[0][1],
        "eras": [],
    }

    for era_id, age_ma in ERAS:
        print(f"Reconstructing {era_id} ({age_ma} Ma)…")
        coast_geojson = export_coastlines(coastlines, rotation_model, age_ma)
        land_geojson = export_continental_land(continental_polygons, rotation_model, age_ma)
        paleo_geojson = export_land_paleogeography(
            paleo_layers, continental_polygons, rotation_model, age_ma
        )
        plate_geojson = export_plates(static_polygons, rotation_model, age_ma)
        continent_geojson = export_continents(continental_polygons, rotation_model, age_ma)

        coast_path = os.path.join(OUT_DIR, f"{era_id}-coastlines.json")
        land_path = os.path.join(OUT_DIR, f"{era_id}-land.json")
        paleo_path = os.path.join(OUT_DIR, f"{era_id}-paleo.json")
        continent_path = os.path.join(OUT_DIR, f"{era_id}-continents.json")
        plate_path = os.path.join(OUT_DIR, f"{era_id}-plates.json")

        with open(coast_path, "w", encoding="utf-8") as f:
            json.dump(coast_geojson, f, separators=(",", ":"))
        with open(land_path, "w", encoding="utf-8") as f:
            json.dump(land_geojson, f, separators=(",", ":"))
        with open(paleo_path, "w", encoding="utf-8") as f:
            json.dump(paleo_geojson, f, separators=(",", ":"))
        with open(continent_path, "w", encoding="utf-8") as f:
            json.dump(continent_geojson, f, separators=(",", ":"))
        with open(plate_path, "w", encoding="utf-8") as f:
            json.dump(plate_geojson, f, separators=(",", ":"))

        paleo_source = (
            paleo_geojson["features"][0]["properties"]["source"]
            if paleo_geojson["features"]
            else "none"
        )
        coast_size = os.path.getsize(coast_path) / 1024
        land_size = os.path.getsize(land_path) / 1024
        paleo_size = os.path.getsize(paleo_path) / 1024
        continent_size = os.path.getsize(continent_path) / 1024
        plate_size = os.path.getsize(plate_path) / 1024
        print(
            f"  coastlines: {len(coast_geojson['features'])} features ({coast_size:.0f} KB)"
        )
        print(
            f"  land (continental): {len(land_geojson['features'])} features ({land_size:.0f} KB)"
        )
        print(
            f"  paleo ({paleo_source}): {len(paleo_geojson['features'])} features ({paleo_size:.0f} KB)"
        )
        print(
            f"  continents: {len(continent_geojson['features'])} features ({continent_size:.0f} KB)"
        )
        print(f"  plates: {len(plate_geojson['features'])} features ({plate_size:.0f} KB)")

        manifest["eras"].append(
            {
                "id": era_id,
                "ageMa": age_ma,
                "coastlines": f"{era_id}-coastlines.json",
                "land": f"{era_id}-land.json",
                "paleo": f"{era_id}-paleo.json",
                "continents": f"{era_id}-continents.json",
                "plates": f"{era_id}-plates.json",
            }
        )

    manifest_path = os.path.join(OUT_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
        f.write("\n")

    print(f"Done. Wrote manifest to {manifest_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

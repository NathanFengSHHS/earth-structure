#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/data/gplates-source"
ZIP="$DEST/gplates_2.5.0_geodata.zip"
URL="https://zenodo.org/records/14194897/files/gplates_2.5.0_geodata.zip?download=1"

mkdir -p "$DEST"

if [[ -f "$ZIP" ]]; then
  echo "GeoData zip already present: $ZIP"
else
  echo "Downloading GPlates 2.5 GeoData (~195 MB)…"
  curl -L --progress-bar -o "$ZIP" "$URL"
fi

echo "Extracting rotation, polygons, coastlines, and paleogeography files…"
unzip -o "$ZIP" \
  "GeoData/FeatureCollections/Rotations/Zahirovic_etal_2022_OptimisedMantleRef_and_NNRMantleRef.rot" \
  "GeoData/FeatureCollections/StaticPolygons/Global_EarthByte_GPlates_PresentDay_StaticPlatePolygons.gpmlz" \
  "GeoData/FeatureCollections/Coastlines/Global_EarthByte_GPlates_PresentDay_Coastlines.gpmlz" \
  "GeoData/FeatureCollections/ContinentalPolygons/Global_EarthByte_GPlates_PresentDay_ContinentalPolygons.gpmlz" \
  "GeoData/FeatureCollections/Paleogeography/Global_Cao_etal/lm_402_2.*" \
  "GeoData/FeatureCollections/Paleogeography/Global_Cao_etal/m_402_2.*" \
  "GeoData/FeatureCollections/Paleogeography/Global_Cao_etal/i_402_2.*" \
  -d "$DEST"

echo "GeoData ready under $DEST/GeoData"

import type { GeoJsonFeature } from './geojsonToSphere'

/** Continents shown on the globe and in the sidebar (excludes catch-all bucket). */
export const HIDDEN_CONTINENT_NAMES = new Set(['Other'])

function nameFromFeature(feature: GeoJsonFeature, index: number): string {
  return String(feature.properties.name ?? `continent-${index}`)
}

export function continentNamesFromCollection(
  features: GeoJsonFeature[],
  options: { includeHidden?: boolean } = {},
): string[] {
  const { includeHidden = true } = options
  return features
    .map((feature, index) => nameFromFeature(feature, index))
    .filter((name, index, list) => list.indexOf(name) === index)
    .filter((name) => includeHidden || !HIDDEN_CONTINENT_NAMES.has(name))
}

export function labeledContinentNamesFromCollection(features: GeoJsonFeature[]): string[] {
  return continentNamesFromCollection(features, { includeHidden: false })
}

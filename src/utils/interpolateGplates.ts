import type {
  GeoJsonFeature,
  GeoJsonFeatureCollection,
  GeoJsonMultiPolygon,
  GeoJsonPolygon,
} from './geojsonToSphere'
import { extractOuterRings, morphPolygonGeometry } from './sphereMorph'

function isPolygonGeometry(
  geometry: GeoJsonPolygon | GeoJsonMultiPolygon,
): geometry is GeoJsonPolygon | GeoJsonMultiPolygon {
  return geometry.type === 'Polygon' || geometry.type === 'MultiPolygon'
}

function plateIdForFeature(feature: GeoJsonFeature): string {
  return String(feature.properties.plateId ?? feature.properties.name ?? '')
}

function groupFeaturesByPlate(collection: GeoJsonFeatureCollection): Map<string, GeoJsonFeature[]> {
  const groups = new Map<string, GeoJsonFeature[]>()
  for (const feature of collection.features) {
    const plateId = plateIdForFeature(feature)
    if (!plateId || !isPolygonGeometry(feature.geometry)) continue
    const existing = groups.get(plateId)
    if (existing) {
      existing.push(feature)
    } else {
      groups.set(plateId, [feature])
    }
  }
  return groups
}

function mergePlateFragments(features: GeoJsonFeature[]): GeoJsonFeature | null {
  if (features.length === 0) return null

  const rings = features.flatMap((feature) => extractOuterRings(feature.geometry))
  if (rings.length === 0) return null

  const geometry: GeoJsonPolygon | GeoJsonMultiPolygon =
    rings.length === 1
      ? { type: 'Polygon', coordinates: [rings[0]] }
      : { type: 'MultiPolygon', coordinates: rings.map((ring) => [ring]) }

  const template = features[0]
  return {
    type: 'Feature',
    geometry,
    properties: {
      ...template.properties,
      name: plateIdForFeature(template),
      plateId: plateIdForFeature(template),
    },
  }
}

function morphFeaturePair(
  fromFeature: GeoJsonFeature,
  toFeature: GeoJsonFeature,
  t: number,
  opacity: number,
): GeoJsonFeature {
  const geometry = morphPolygonGeometry(fromFeature.geometry, toFeature.geometry, t)
  return {
    type: 'Feature',
    geometry,
    properties: {
      ...fromFeature.properties,
      ...toFeature.properties,
      opacity,
    },
  }
}

function singleFeature(feature: GeoJsonFeature, opacity: number): GeoJsonFeature {
  return {
    type: 'Feature',
    geometry: feature.geometry,
    properties: { ...feature.properties, opacity },
  }
}

export function interpolatePlateCollection(
  from: GeoJsonFeatureCollection,
  to: GeoJsonFeatureCollection,
  t: number,
): GeoJsonFeatureCollection {
  const fromGroups = groupFeaturesByPlate(from)
  const toGroups = groupFeaturesByPlate(to)
  const plateIds = new Set([...fromGroups.keys(), ...toGroups.keys()])

  const features: GeoJsonFeature[] = []
  for (const plateId of plateIds) {
    const fromMerged = mergePlateFragments(fromGroups.get(plateId) ?? [])
    const toMerged = mergePlateFragments(toGroups.get(plateId) ?? [])

    if (fromMerged && toMerged) {
      features.push(morphFeaturePair(fromMerged, toMerged, t, 1))
    } else if (fromMerged) {
      features.push(singleFeature(fromMerged, 1 - t))
    } else if (toMerged) {
      features.push(singleFeature(toMerged, t))
    }
  }

  return { type: 'FeatureCollection', features }
}

export function interpolateCoastlineCollection(
  from: GeoJsonFeatureCollection,
  to: GeoJsonFeatureCollection,
  t: number,
): GeoJsonFeatureCollection {
  const fromMap = new Map(
    from.features.map((f) => [String(f.properties.featureId ?? ''), f]),
  )
  const toMap = new Map(
    to.features.map((f) => [String(f.properties.featureId ?? ''), f]),
  )
  const ids = new Set([...fromMap.keys(), ...toMap.keys()])

  const features: GeoJsonFeature[] = []
  for (const id of ids) {
    if (!id) continue
    const fromFeature = fromMap.get(id)
    const toFeature = toMap.get(id)

    if (fromFeature && toFeature) {
      if (!isPolygonGeometry(fromFeature.geometry) || !isPolygonGeometry(toFeature.geometry)) {
        continue
      }
      features.push(morphFeaturePair(fromFeature, toFeature, t, 1))
    } else if (fromFeature) {
      features.push(singleFeature(fromFeature, 1 - t))
    } else if (toFeature) {
      features.push(singleFeature(toFeature, t))
    }
  }

  return { type: 'FeatureCollection', features }
}

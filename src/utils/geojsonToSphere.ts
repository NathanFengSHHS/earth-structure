import { BufferGeometry } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { createSpherePolygonGeometry } from './spherePolygon'

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJsonFeature[]
}

export interface GeoJsonFeature {
  type: 'Feature'
  geometry: GeoJsonPolygon | GeoJsonMultiPolygon
  properties: Record<string, string | number | undefined>
}

export interface GeoJsonPolygon {
  type: 'Polygon'
  coordinates: [number, number][][]
}

export interface GeoJsonMultiPolygon {
  type: 'MultiPolygon'
  coordinates: [number, number][][][]
}

/** GeoJSON uses [lon, lat]; our sphere helper uses [lat, lon]. */
function ringToLatLon(ring: [number, number][]): [number, number][] {
  return ring.map(([lon, lat]) => [lat, lon])
}

export function polygonToGeometries(
  geometry: GeoJsonPolygon | GeoJsonMultiPolygon,
  radius = 1.008,
): BufferGeometry[] {
  if (geometry.type === 'Polygon') {
    const outer = geometry.coordinates[0]
    if (!outer || outer.length < 3) return []
    return [createSpherePolygonGeometry(ringToLatLon(outer), radius)]
  }

  const geometries: BufferGeometry[] = []
  for (const polygon of geometry.coordinates) {
    const outer = polygon[0]
    if (!outer || outer.length < 3) continue
    geometries.push(createSpherePolygonGeometry(ringToLatLon(outer), radius))
  }
  return geometries
}

export function polygonToMergedGeometry(
  geometry: GeoJsonPolygon | GeoJsonMultiPolygon,
  radius = 1.008,
): BufferGeometry | null {
  const parts = polygonToGeometries(geometry, radius)
  if (parts.length === 0) return null
  if (parts.length === 1) return parts[0]
  return mergeGeometries(parts)
}

export function featureCollectionToGeometries(
  collection: GeoJsonFeatureCollection,
  radius = 1.008,
): BufferGeometry[] {
  return collection.features.flatMap((feature) =>
    polygonToGeometries(feature.geometry, radius),
  )
}

export function featureCollectionToMergedGeometry(
  collection: GeoJsonFeatureCollection,
  radius = 1.008,
  opacityCutoff = 0.03,
): BufferGeometry | null {
  const parts: BufferGeometry[] = []

  for (const feature of collection.features) {
    const opacity = Number(feature.properties.opacity ?? 1)
    if (opacity < opacityCutoff) continue

    const geometries = polygonToGeometries(feature.geometry, radius)
    parts.push(...geometries)
  }

  if (parts.length === 0) return null
  if (parts.length === 1) return parts[0]
  return mergeGeometries(parts)
}

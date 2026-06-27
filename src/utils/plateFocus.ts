import { Euler, Vector3 } from 'three'
import { getEraBlend } from '../data/plateTimeline'
import { getCachedEraData } from '../hooks/useGplatesEraData'
import type { GeoJsonFeature, GeoJsonMultiPolygon, GeoJsonPolygon } from './geojsonToSphere'
import { getPlateQuaternion } from './plateRotations'
import { reconstructionPlateIdForFeature } from './rigidPlateGroups'
import { latLonToVector3 } from './spherePolygon'

export const PLATE_GLOBE_ROTATION: [number, number, number] = [0.15, -0.35, 0]

const globeEuler = new Euler(...PLATE_GLOBE_ROTATION)

function outerRings(
  geometry: GeoJsonPolygon | GeoJsonMultiPolygon,
): [number, number][][] {
  if (geometry.type === 'Polygon') {
    const ring = geometry.coordinates[0]
    return ring ? [ring] : []
  }
  return geometry.coordinates
    .map((polygon) => polygon[0])
    .filter((ring): ring is [number, number][] => Boolean(ring))
}

/** Unit direction from globe center toward a plate's geographic centroid (local space). */
export function plateFeatureToDirection(feature: GeoJsonFeature): Vector3 {
  const sum = new Vector3()
  let count = 0

  for (const ring of outerRings(feature.geometry)) {
    const open = ring[0][0] === ring[ring.length - 1][0] ? ring.slice(0, -1) : ring
    for (const [lon, lat] of open) {
      sum.add(latLonToVector3(lat, lon))
      count++
    }
  }

  if (count === 0) return new Vector3(0, 0, 1)
  return sum.divideScalar(count).normalize()
}

export function directionToWorld(localDirection: Vector3): Vector3 {
  return localDirection.clone().applyEuler(globeEuler)
}

function plateNameMatches(feature: GeoJsonFeature, plateName: string): boolean {
  const name = String(feature.properties.name ?? feature.properties.plateId ?? '')
  return name === plateName
}

export function getPlateWorldDirection(plateName: string, ageMa: number): Vector3 | null {
  const present = getCachedEraData('present')
  if (!present) return null

  const fragments = present.plates.features.filter((feature) =>
    plateNameMatches(feature, plateName),
  )
  if (fragments.length === 0) return null

  const sum = new Vector3()
  for (const feature of fragments) {
    const direction = plateFeatureToDirection(feature)
    const plateId = reconstructionPlateIdForFeature(feature)
    direction.applyQuaternion(getPlateQuaternion(plateId, ageMa))
    sum.add(direction)
  }

  if (sum.lengthSq() < 1e-12) return new Vector3(0, 0, 1)
  return directionToWorld(sum.normalize())
}

export function getContinentWorldDirection(
  continentName: string,
  ageMa: number,
): Vector3 | null {
  const { from, to, t } = getEraBlend(ageMa)
  const eraId = t < 0.5 ? from.id : to.id
  const data = getCachedEraData(eraId)
  if (!data) return null

  const feature =
    data.continents.features.find(
      (entry) => String(entry.properties.name ?? '') === continentName,
    ) ?? null
  if (!feature) return null
  return directionToWorld(plateFeatureToDirection(feature))
}

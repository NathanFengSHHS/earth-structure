import { Euler, Vector3 } from 'three'
import { getEraBlend } from '../data/plateTimeline'
import { getCachedEraData } from '../hooks/useGplatesEraData'
import { interpolatePlateCollection } from './interpolateGplates'
import type { GeoJsonFeature, GeoJsonMultiPolygon, GeoJsonPolygon } from './geojsonToSphere'
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

export function getMorphedPlateFeature(plateName: string, ageMa: number): GeoJsonFeature | null {
  const { from, to, t } = getEraBlend(ageMa)
  const fromData = getCachedEraData(from.id)
  const toData = getCachedEraData(to.id)
  if (!fromData || !toData) return null

  const blendT = from.id === to.id ? 0 : t
  const morphed = interpolatePlateCollection(fromData.plates, toData.plates, blendT)
  return (
    morphed.features.find((feature) => String(feature.properties.name ?? '') === plateName) ??
    null
  )
}

export function getPlateWorldDirection(plateName: string, ageMa: number): Vector3 | null {
  const feature = getMorphedPlateFeature(plateName, ageMa)
  if (!feature) return null
  return directionToWorld(plateFeatureToDirection(feature))
}

export function getMorphedContinentFeature(
  continentName: string,
  ageMa: number,
): GeoJsonFeature | null {
  const { from, to, t } = getEraBlend(ageMa)
  const fromData = getCachedEraData(from.id)
  const toData = getCachedEraData(to.id)
  if (!fromData || !toData) return null

  const blendT = from.id === to.id ? 0 : t
  const morphed = interpolatePlateCollection(fromData.continents, toData.continents, blendT)
  return (
    morphed.features.find((feature) => String(feature.properties.name ?? '') === continentName) ??
    null
  )
}

export function getContinentWorldDirection(
  continentName: string,
  ageMa: number,
): Vector3 | null {
  const feature = getMorphedContinentFeature(continentName, ageMa)
  if (!feature) return null
  return directionToWorld(plateFeatureToDirection(feature))
}

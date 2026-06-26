import { Vector3 } from 'three'
import { latLonToVector3 } from './spherePolygon'
import type { GeoJsonMultiPolygon, GeoJsonPolygon } from './geojsonToSphere'

type LonLatRing = [number, number][]

/** Evenly resample a closed [lon, lat] ring to a fixed point count. */
export function resampleRing(ring: LonLatRing, pointCount: number): LonLatRing {
  if (ring.length < 3 || pointCount < 3) return ring

  const closed =
    ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
      ? ring.slice(0, -1)
      : ring.slice()

  const cumulative: number[] = [0]
  for (let i = 0; i < closed.length; i++) {
    const a = latLonToVector3(closed[i][1], closed[i][0])
    const b = latLonToVector3(closed[(i + 1) % closed.length][1], closed[(i + 1) % closed.length][0])
    cumulative.push(cumulative[cumulative.length - 1] + a.angleTo(b))
  }

  const total = cumulative[cumulative.length - 1]
  if (total === 0) return ring

  const result: LonLatRing = []
  for (let i = 0; i < pointCount; i++) {
    const target = (total * i) / pointCount
    let seg = 0
    while (seg < closed.length - 1 && cumulative[seg + 1] < target) {
      seg++
    }
    const segStart = cumulative[seg]
    const segEnd = cumulative[seg + 1]
    const frac = segEnd === segStart ? 0 : (target - segStart) / (segEnd - segStart)
    const a = latLonToVector3(closed[seg][1], closed[seg][0])
    const b = latLonToVector3(closed[(seg + 1) % closed.length][1], closed[(seg + 1) % closed.length][0])
    const v = a.clone().lerp(b, frac).normalize()
    result.push(vector3ToLonLat(v))
  }

  result.push(result[0])
  return result
}

function vector3ToLonLat(v: Vector3): [number, number] {
  const lat = Math.asin(Math.max(-1, Math.min(1, v.y))) * (180 / Math.PI)
  const lon = Math.atan2(-v.z, v.x) * (180 / Math.PI)
  return [lon, lat]
}

/** Lerp two rings on the sphere surface after resampling to a common count. */
export function lerpRingOnSphere(
  fromRing: LonLatRing,
  toRing: LonLatRing,
  t: number,
  pointCount = 32,
): LonLatRing {
  const from = resampleRing(fromRing, pointCount)
  const to = resampleRing(toRing, pointCount)
  const closedFrom = from[0][0] === from[from.length - 1][0] ? from.slice(0, -1) : from
  const closedTo = to[0][0] === to[to.length - 1][0] ? to.slice(0, -1) : to
  const count = Math.min(closedFrom.length, closedTo.length)

  const result: LonLatRing = []
  for (let i = 0; i < count; i++) {
    const a = latLonToVector3(closedFrom[i][1], closedFrom[i][0])
    const b = latLonToVector3(closedTo[i][1], closedTo[i][0])
    const v = a.clone().lerp(b, t).normalize()
    result.push(vector3ToLonLat(v))
  }
  if (result.length > 0) {
    result.push(result[0])
  }
  return result
}

/** Shoelace area in lon/lat for sorting polygon parts. */
export function ringArea(ring: LonLatRing): number {
  const open = ring[0][0] === ring[ring.length - 1][0] ? ring.slice(0, -1) : ring
  let area = 0
  for (let i = 0; i < open.length; i++) {
    const [x1, y1] = open[i]
    const [x2, y2] = open[(i + 1) % open.length]
    area += x1 * y2 - x2 * y1
  }
  return Math.abs(area)
}

export function extractOuterRings(
  geometry: GeoJsonPolygon | GeoJsonMultiPolygon,
): LonLatRing[] {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates[0] ? [geometry.coordinates[0]] : []
  }
  return geometry.coordinates
    .map((polygon) => polygon[0])
    .filter((ring): ring is LonLatRing => Boolean(ring && ring.length >= 3))
}

function sortRingsByArea(rings: LonLatRing[]): LonLatRing[] {
  return [...rings].sort((a, b) => ringArea(b) - ringArea(a))
}

export function morphPolygonGeometry(
  fromGeometry: GeoJsonPolygon | GeoJsonMultiPolygon,
  toGeometry: GeoJsonPolygon | GeoJsonMultiPolygon,
  t: number,
  pointCount = 32,
): GeoJsonPolygon | GeoJsonMultiPolygon {
  const fromRings = sortRingsByArea(extractOuterRings(fromGeometry))
  const toRings = sortRingsByArea(extractOuterRings(toGeometry))
  const pairCount = Math.max(fromRings.length, toRings.length)

  const morphedRings: LonLatRing[] = []
  for (let i = 0; i < pairCount; i++) {
    const fromRing = fromRings[i] ?? fromRings[fromRings.length - 1] ?? toRings[i]
    const toRing = toRings[i] ?? toRings[toRings.length - 1] ?? fromRings[i]
    if (!fromRing || !toRing) continue
    morphedRings.push(lerpRingOnSphere(fromRing, toRing, t, pointCount))
  }

  if (morphedRings.length === 0) {
    return fromGeometry
  }
  if (morphedRings.length === 1) {
    return { type: 'Polygon', coordinates: [morphedRings[0]] }
  }
  return {
    type: 'MultiPolygon',
    coordinates: morphedRings.map((ring) => [ring]),
  }
}

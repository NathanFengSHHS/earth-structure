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

/** Lerp two rings on the sphere after resampling and aligning start vertices. */
export function lerpRingOnSphere(
  fromRing: LonLatRing,
  toRing: LonLatRing,
  t: number,
  pointCount = 32,
): LonLatRing {
  const from = resampleRing(fromRing, pointCount)
  const to = resampleRing(toRing, pointCount)
  const closedFrom =
    from[0][0] === from[from.length - 1][0] ? from.slice(0, -1) : from.slice()
  let closedTo = to[0][0] === to[to.length - 1][0] ? to.slice(0, -1) : to.slice()
  const count = Math.min(closedFrom.length, closedTo.length)
  if (count === 0) return fromRing

  if (closedTo.length > 0) {
    const fromStart = latLonToVector3(closedFrom[0][1], closedFrom[0][0])
    let bestOffset = 0
    let bestAngle = Number.POSITIVE_INFINITY
    for (let offset = 0; offset < closedTo.length; offset++) {
      const angle = fromStart.angleTo(
        latLonToVector3(closedTo[offset][1], closedTo[offset][0]),
      )
      if (angle < bestAngle) {
        bestAngle = angle
        bestOffset = offset
      }
    }
    if (bestOffset > 0) {
      closedTo = [...closedTo.slice(bestOffset), ...closedTo.slice(0, bestOffset)]
    }
  }

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

function ringCentroid(ring: LonLatRing): Vector3 {
  const open =
    ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] ? ring.slice(0, -1) : ring
  const sum = new Vector3()
  for (const [lon, lat] of open) {
    sum.add(latLonToVector3(lat, lon))
  }
  if (sum.lengthSq() < 1e-12) return new Vector3(0, 0, 1)
  return sum.normalize()
}

function pairRingsByProximity(
  fromRings: LonLatRing[],
  toRings: LonLatRing[],
): Array<{ from: LonLatRing; to: LonLatRing }> {
  const usedTo = new Set<number>()
  const pairs: Array<{ from: LonLatRing; to: LonLatRing }> = []

  for (const fromRing of fromRings) {
    const fromCenter = ringCentroid(fromRing)
    let bestIndex = -1
    let bestAngle = Number.POSITIVE_INFINITY

    for (let index = 0; index < toRings.length; index++) {
      if (usedTo.has(index)) continue
      const angle = fromCenter.angleTo(ringCentroid(toRings[index]))
      if (angle < bestAngle) {
        bestAngle = angle
        bestIndex = index
      }
    }

    if (bestIndex >= 0) {
      usedTo.add(bestIndex)
      pairs.push({ from: fromRing, to: toRings[bestIndex] })
    }
  }

  for (let index = 0; index < toRings.length; index++) {
    if (usedTo.has(index)) continue
    const toRing = toRings[index]
    const toCenter = ringCentroid(toRing)
    let bestFrom = fromRings[fromRings.length - 1] ?? toRing
    let bestAngle = Number.POSITIVE_INFINITY

    for (const fromRing of fromRings) {
      const angle = toCenter.angleTo(ringCentroid(fromRing))
      if (angle < bestAngle) {
        bestAngle = angle
        bestFrom = fromRing
      }
    }

    pairs.push({ from: bestFrom, to: toRing })
  }

  return pairs
}

export function morphPolygonGeometry(
  fromGeometry: GeoJsonPolygon | GeoJsonMultiPolygon,
  toGeometry: GeoJsonPolygon | GeoJsonMultiPolygon,
  t: number,
  pointCount = 32,
): GeoJsonPolygon | GeoJsonMultiPolygon {
  const fromRings = extractOuterRings(fromGeometry)
  const toRings = extractOuterRings(toGeometry)
  const pairs = pairRingsByProximity(fromRings, toRings)

  const morphedRings: LonLatRing[] = []
  for (const { from, to } of pairs) {
    morphedRings.push(lerpRingOnSphere(from, to, t, pointCount))
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

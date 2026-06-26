import {
  BufferGeometry,
  Float32BufferAttribute,
  ShapeUtils,
  Vector2,
  Vector3,
} from 'three'

/** Geographic [lat, lon] in degrees → unit-sphere position (Y up). */
export function latLonToVector3(lat: number, lon: number, radius = 1): Vector3 {
  const latRad = (lat * Math.PI) / 180
  const lonRad = (lon * Math.PI) / 180
  return new Vector3(
    radius * Math.cos(latRad) * Math.cos(lonRad),
    radius * Math.sin(latRad),
    -radius * Math.cos(latRad) * Math.sin(lonRad),
  )
}

const BOUNDARY_MAX_SEGMENT_RAD = (5 * Math.PI) / 180
const TRIANGLE_MAX_EDGE_RAD = (6 * Math.PI) / 180

function ringNormal(positions: Vector3[]): Vector3 {
  const sum = new Vector3()
  for (const p of positions) {
    sum.add(p)
  }
  if (sum.lengthSq() < 1e-12) {
    return new Vector3(0, 1, 0)
  }
  return sum.normalize()
}

function projectToTangentPlane(positions: Vector3[], normal: Vector3): Vector2[] {
  const up = Math.abs(normal.y) < 0.9 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0)
  const tangent = new Vector3().crossVectors(up, normal).normalize()
  const bitangent = new Vector3().crossVectors(normal, tangent).normalize()
  return positions.map((p) => new Vector2(p.dot(tangent), p.dot(bitangent)))
}

function signedArea2D(points: Vector2[]): number {
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    area += points[i].x * points[j].y - points[j].x * points[i].y
  }
  return area * 0.5
}

function densifyRingOnSphere(positions: Vector3[]): Vector3[] {
  if (positions.length < 2) return positions

  const radius = positions[0].length()
  const densified: Vector3[] = []

  for (let i = 0; i < positions.length; i++) {
    const a = positions[i]
    const b = positions[(i + 1) % positions.length]
    densified.push(a)

    const angle = a.clone().normalize().angleTo(b.clone().normalize())
    if (angle <= BOUNDARY_MAX_SEGMENT_RAD) continue

    const steps = Math.ceil(angle / BOUNDARY_MAX_SEGMENT_RAD)
    for (let step = 1; step < steps; step++) {
      const t = step / steps
      densified.push(a.clone().lerp(b, t).normalize().multiplyScalar(radius))
    }
  }

  return densified
}

function maxEdgeAngle(a: Vector3, b: Vector3, c: Vector3): number {
  const ua = a.clone().normalize()
  const ub = b.clone().normalize()
  const uc = c.clone().normalize()
  return Math.max(ua.angleTo(ub), ub.angleTo(uc), uc.angleTo(ua))
}

function midpointOnSphere(a: Vector3, b: Vector3, radius: number): Vector3 {
  return a.clone().lerp(b, 0.5).normalize().multiplyScalar(radius)
}

function subdivideTriangleOnSphere(
  a: Vector3,
  b: Vector3,
  c: Vector3,
  radius: number,
  out: number[],
): void {
  if (maxEdgeAngle(a, b, c) <= TRIANGLE_MAX_EDGE_RAD) {
    out.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z)
    return
  }

  const ab = midpointOnSphere(a, b, radius)
  const bc = midpointOnSphere(b, c, radius)
  const ca = midpointOnSphere(c, a, radius)

  subdivideTriangleOnSphere(a, ab, ca, radius, out)
  subdivideTriangleOnSphere(ab, b, bc, radius, out)
  subdivideTriangleOnSphere(ca, bc, c, radius, out)
  subdivideTriangleOnSphere(ab, bc, ca, radius, out)
}

function fanTriangulate(positions: Vector3[]): number[] {
  const vertices: number[] = []
  const radius = positions[0].length()
  const centroid = ringNormal(positions).multiplyScalar(radius)

  for (let i = 0; i < positions.length; i++) {
    subdivideTriangleOnSphere(
      centroid,
      positions[i],
      positions[(i + 1) % positions.length],
      radius,
      vertices,
    )
  }
  return vertices
}

function positionsToVertices(positions: Vector3[], triangles: number[][]): number[] {
  const radius = positions[0]?.length() ?? 1
  const vertices: number[] = []
  for (const [a, b, c] of triangles) {
    subdivideTriangleOnSphere(positions[a], positions[b], positions[c], radius, vertices)
  }
  return vertices
}

/** Ear-cut triangulation of a closed lat/lon polygon, subdivided along the sphere. */
export function createSpherePolygonGeometry(
  boundary: [number, number][],
  radius = 1.008,
): BufferGeometry {
  if (boundary.length < 3) {
    return new BufferGeometry()
  }

  const open =
    boundary.length > 1 &&
    boundary[0][0] === boundary[boundary.length - 1][0] &&
    boundary[0][1] === boundary[boundary.length - 1][1]
      ? boundary.slice(0, -1)
      : boundary

  if (open.length < 3) {
    return new BufferGeometry()
  }

  const positions = densifyRingOnSphere(
    open.map(([lat, lon]) => latLonToVector3(lat, lon, radius)),
  )
  const normal = ringNormal(positions)
  let projected = projectToTangentPlane(positions, normal)

  if (signedArea2D(projected) < 0) {
    projected.reverse()
    positions.reverse()
  }

  let vertices: number[]
  try {
    const triangles = ShapeUtils.triangulateShape(projected, [])
    if (triangles.length === 0) {
      vertices = fanTriangulate(positions)
    } else {
      vertices = positionsToVertices(positions, triangles)
    }
  } catch {
    vertices = fanTriangulate(positions)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
  geometry.computeVertexNormals()
  return geometry
}

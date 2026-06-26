import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { SphereGeometry } from 'three'

interface ShellParams {
  innerRadius: number
  outerRadius: number
  widthSegments?: number
  heightSegments?: number
  phiStart?: number
  phiLength?: number
  thetaStart?: number
  thetaLength?: number
}

/** Spherical shell between inner and outer radii, optionally as a wedge sector. */
export function createShellGeometry({
  innerRadius,
  outerRadius,
  widthSegments = 48,
  heightSegments = 48,
  phiStart = 0,
  phiLength = Math.PI * 2,
  thetaStart = 0,
  thetaLength = Math.PI,
}: ShellParams) {
  if (innerRadius <= 0) {
    return new SphereGeometry(
      outerRadius,
      widthSegments,
      heightSegments,
      phiStart,
      phiLength,
      thetaStart,
      thetaLength
    )
  }

  const outer = new SphereGeometry(
    outerRadius,
    widthSegments,
    heightSegments,
    phiStart,
    phiLength,
    thetaStart,
    thetaLength
  )

  const inner = new SphereGeometry(
    innerRadius,
    widthSegments,
    heightSegments,
    phiStart,
    phiLength,
    thetaStart,
    thetaLength
  )
  inner.scale(-1, -1, -1)

  return mergeGeometries([outer, inner]) ?? outer
}

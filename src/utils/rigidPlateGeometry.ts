import { BufferAttribute, BufferGeometry, Quaternion, Vector3 } from 'three'

const scratchVector = new Vector3()

export function captureReferencePositions(geometry: BufferGeometry): Float32Array {
  const position = geometry.getAttribute('position')
  if (!position) return new Float32Array()
  return new Float32Array(position.array)
}

/** Reset vertices from present-day reference, apply absolute sphere rotation, clamp to radius. */
export function applyAbsoluteSphereRotation(
  geometry: BufferGeometry,
  referencePositions: Float32Array,
  quaternion: Quaternion,
  radius: number,
): void {
  const position = geometry.getAttribute('position') as BufferAttribute | undefined
  if (!position || referencePositions.length === 0) return

  for (let index = 0; index < referencePositions.length; index += 3) {
    scratchVector.set(
      referencePositions[index],
      referencePositions[index + 1],
      referencePositions[index + 2],
    )
    scratchVector.applyQuaternion(quaternion)
    if (scratchVector.lengthSq() > 1e-12) {
      scratchVector.setLength(radius)
    }
    position.setXYZ(index / 3, scratchVector.x, scratchVector.y, scratchVector.z)
  }

  position.needsUpdate = true
  geometry.computeVertexNormals()
}

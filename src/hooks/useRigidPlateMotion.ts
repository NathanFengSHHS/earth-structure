import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { getPlateQuaternion } from '../utils/plateRotations'
import { applyAbsoluteSphereRotation } from '../utils/rigidPlateGeometry'
import type { RigidPlateGroup } from '../utils/rigidPlateGroups'

/** Apply absolute plate rotations every frame from present-day reference geometry. */
export function useRigidPlateMotion(
  layers: RigidPlateGroup[],
  ageMa: number,
): void {
  const layersRef = useRef(layers)
  const ageRef = useRef(ageMa)

  layersRef.current = layers
  ageRef.current = ageMa

  useFrame(() => {
    const age = ageRef.current
    for (const layer of layersRef.current) {
      const quaternion = getPlateQuaternion(layer.reconstructionPlateId, age)
      applyAbsoluteSphereRotation(
        layer.geometry,
        layer.referencePositions,
        quaternion,
        layer.radius,
      )
    }
  })
}

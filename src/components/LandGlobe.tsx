import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, Mesh } from 'three'
import { getEraBlend } from '../data/plateTimeline'
import { getCachedEraData, useGplatesEraData } from '../hooks/useGplatesEraData'
import { interpolateCoastlineCollection } from '../utils/interpolateGplates'
import { featureCollectionToMergedGeometry } from '../utils/geojsonToSphere'
import { PLATE_GLOBE_ROTATION } from '../utils/plateFocus'
import {
  GLOBE_LAND_COLOR,
  GLOBE_LAND_RADIUS,
  GLOBE_OCEAN_COLOR,
  GLOBE_OCEAN_RADIUS,
} from '../constants/globe'

interface LandGlobeProps {
  ageMa: number
}

function assignGeometry(mesh: Mesh | null, nextGeometry: ReturnType<typeof featureCollectionToMergedGeometry>) {
  if (!mesh || !nextGeometry) return
  const previous = mesh.geometry
  if (previous === nextGeometry) return
  mesh.geometry = nextGeometry
  if (previous && previous !== nextGeometry) {
    previous.dispose()
  }
}

export function LandGlobe({ ageMa }: LandGlobeProps) {
  const ageRef = useRef(ageMa)
  ageRef.current = ageMa

  const { from, to } = getEraBlend(ageMa)
  const fromData = useGplatesEraData(from.id)
  const toData = useGplatesEraData(to.id)

  const landMeshRef = useRef<Mesh>(null)

  useFrame(() => {
    const { from: fromEra, to: toEra, t } = getEraBlend(ageRef.current)
    const fromCached = getCachedEraData(fromEra.id)
    const toCached = getCachedEraData(toEra.id)
    if (!fromCached || !toCached) return

    const blendT = fromEra.id === toEra.id ? 0 : t
    const morphedLand = interpolateCoastlineCollection(fromCached.land, toCached.land, blendT)
    assignGeometry(
      landMeshRef.current,
      featureCollectionToMergedGeometry(morphedLand, GLOBE_LAND_RADIUS),
    )
  })

  if (fromData.error || toData.error) {
    return null
  }

  return (
    <group rotation={PLATE_GLOBE_ROTATION}>
      <mesh>
        <sphereGeometry args={[GLOBE_OCEAN_RADIUS, 64, 64]} />
        <meshStandardMaterial color={GLOBE_OCEAN_COLOR} roughness={0.85} metalness={0.02} />
      </mesh>

      <mesh ref={landMeshRef} renderOrder={1}>
        <meshBasicMaterial color={GLOBE_LAND_COLOR} side={DoubleSide} />
      </mesh>
    </group>
  )
}

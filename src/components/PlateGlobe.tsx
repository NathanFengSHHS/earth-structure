import { useEffect, useMemo, useState } from 'react'
import { useGplatesEraData } from '../hooks/useGplatesEraData'
import { useRigidPlateMotion } from '../hooks/useRigidPlateMotion'
import { coloredPatchMaterialProps } from '../utils/globePatches'
import { PLATE_GLOBE_ROTATION } from '../utils/plateFocus'
import { getCachedPlateRotations, loadPlateRotations } from '../utils/plateRotations'
import { applyCatalogNames, buildRigidPlateGroups } from '../utils/rigidPlateGroups'
import { GLOBE_OCEAN_COLOR, GLOBE_OCEAN_RADIUS, GLOBE_PATCH_RADIUS } from '../constants/globe'

interface PlateGlobeProps {
  ageMa: number
  highlightedPlateName?: string | null
}

const DEFAULT_PLATE_COLOR = '#8fa8c4'

export function PlateGlobe({ ageMa, highlightedPlateName }: PlateGlobeProps) {
  const presentData = useGplatesEraData('present')
  const [rotationsReady, setRotationsReady] = useState(() => Boolean(getCachedPlateRotations()))

  useEffect(() => {
    let cancelled = false
    loadPlateRotations()
      .then(() => {
        if (!cancelled) setRotationsReady(true)
      })
      .catch(() => {
        if (!cancelled) setRotationsReady(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const plateLayers = useMemo(() => {
    if (!presentData.data || !rotationsReady) return []
    const layers = buildRigidPlateGroups(
      presentData.data.plates,
      'reconstructionId',
      DEFAULT_PLATE_COLOR,
      GLOBE_PATCH_RADIUS,
    )
    const catalog = getCachedPlateRotations()?.plates ?? []
    return applyCatalogNames(layers, catalog)
  }, [presentData.data, rotationsReady])

  useRigidPlateMotion(plateLayers, ageMa)

  if (presentData.error) {
    return null
  }

  return (
    <group rotation={PLATE_GLOBE_ROTATION}>
      <mesh>
        <sphereGeometry args={[GLOBE_OCEAN_RADIUS, 64, 64]} />
        <meshStandardMaterial color={GLOBE_OCEAN_COLOR} roughness={0.85} metalness={0.02} />
      </mesh>

      {plateLayers.map((plate) => {
        const patch = {
          name: plate.majorPlateName,
          color: plate.color,
          opacity: 1,
        }
        const { material, renderOrder } = coloredPatchMaterialProps(patch, highlightedPlateName)
        return (
          <mesh key={plate.groupKey} geometry={plate.geometry} renderOrder={renderOrder}>
            <meshBasicMaterial {...material} />
          </mesh>
        )
      })}
    </group>
  )
}

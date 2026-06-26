import { useMemo } from 'react'
import { getEraBlend } from '../data/plateTimeline'
import { useGplatesEraData } from '../hooks/useGplatesEraData'
import { interpolatePlateCollection } from '../utils/interpolateGplates'
import { PLATE_GLOBE_ROTATION } from '../utils/plateFocus'
import {
  buildColoredPatchMeshes,
  coloredPatchMaterialProps,
} from '../utils/globePatches'
import { GLOBE_OCEAN_COLOR, GLOBE_OCEAN_RADIUS } from '../constants/globe'

interface PlateGlobeProps {
  ageMa: number
  highlightedPlateName?: string | null
}

const DEFAULT_PLATE_COLOR = '#8fa8c4'

export function PlateGlobe({ ageMa, highlightedPlateName }: PlateGlobeProps) {
  const { from, to, t } = getEraBlend(ageMa)
  const fromData = useGplatesEraData(from.id)
  const toData = useGplatesEraData(to.id)

  const morphedPlates = useMemo(() => {
    if (!fromData.data || !toData.data) return null
    const blendT = from.id === to.id ? 0 : t
    return interpolatePlateCollection(fromData.data.plates, toData.data.plates, blendT)
  }, [fromData.data, toData.data, from.id, to.id, t])

  const plateMeshes = useMemo(
    () => (morphedPlates ? buildColoredPatchMeshes(morphedPlates, DEFAULT_PLATE_COLOR) : []),
    [morphedPlates],
  )

  if (fromData.error || toData.error) {
    return null
  }

  return (
    <group rotation={PLATE_GLOBE_ROTATION}>
      <mesh>
        <sphereGeometry args={[GLOBE_OCEAN_RADIUS, 64, 64]} />
        <meshStandardMaterial color={GLOBE_OCEAN_COLOR} roughness={0.85} metalness={0.02} />
      </mesh>

      {plateMeshes.map((plate) => {
        const { material, renderOrder } = coloredPatchMaterialProps(plate, highlightedPlateName)
        return (
          <mesh key={plate.id} geometry={plate.geometry} renderOrder={renderOrder}>
            <meshBasicMaterial {...material} />
          </mesh>
        )
      })}
    </group>
  )
}

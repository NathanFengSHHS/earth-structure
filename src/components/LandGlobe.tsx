import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { getEraBlend } from '../data/plateTimeline'
import { getCachedEraData, useGplatesEraData } from '../hooks/useGplatesEraData'
import { interpolatePlateCollection } from '../utils/interpolateGplates'
import { polygonToMergedGeometry } from '../utils/geojsonToSphere'
import { PLATE_GLOBE_ROTATION } from '../utils/plateFocus'
import { coloredPatchMaterialProps } from '../utils/globePatches'
import {
  GLOBE_LAND_RADIUS,
  GLOBE_OCEAN_COLOR,
  GLOBE_OCEAN_RADIUS,
} from '../constants/globe'

interface LandGlobeProps {
  ageMa: number
}

const DEFAULT_CONTINENT_COLOR = '#8fa8c4'

function assignGeometry(mesh: Mesh | null, nextGeometry: ReturnType<typeof polygonToMergedGeometry>) {
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

  const continentMeshRefs = useRef<Map<string, Mesh>>(new Map())

  const continentDefs = useMemo(() => {
    if (!fromData.data) return []
    return fromData.data.continents.features.map((feature, index) => ({
      name: String(feature.properties.name ?? `continent-${index}`),
      color: String(feature.properties.color ?? DEFAULT_CONTINENT_COLOR),
      opacity: Number(feature.properties.opacity ?? 1),
    }))
  }, [fromData.data])

  useFrame(() => {
    const { from: fromEra, to: toEra, t } = getEraBlend(ageRef.current)
    const fromCached = getCachedEraData(fromEra.id)
    const toCached = getCachedEraData(toEra.id)
    if (!fromCached || !toCached) return

    const blendT = fromEra.id === toEra.id ? 0 : t
    const morphedContinents = interpolatePlateCollection(
      fromCached.continents,
      toCached.continents,
      blendT,
    )
    for (const feature of morphedContinents.features) {
      const name = String(feature.properties.name ?? '')
      const mesh = continentMeshRefs.current.get(name)
      if (!mesh) continue
      assignGeometry(mesh, polygonToMergedGeometry(feature.geometry, GLOBE_LAND_RADIUS))
    }
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

      {continentDefs.map(({ name, color, opacity }) => {
        const { material, renderOrder } = coloredPatchMaterialProps({ name, color, opacity }, null)
        return (
          <mesh
            key={name}
            ref={(mesh) => {
              if (mesh) continentMeshRefs.current.set(name, mesh)
              else continentMeshRefs.current.delete(name)
            }}
            renderOrder={renderOrder}
          >
            <meshBasicMaterial {...material} />
          </mesh>
        )
      })}
    </group>
  )
}

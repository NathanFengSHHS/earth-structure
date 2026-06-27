import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import { DoubleSide, Group, Mesh } from 'three'
import { getEraBlend } from '../data/plateTimeline'
import { getCachedEraData, useGplatesEraData } from '../hooks/useGplatesEraData'
import { interpolatePlateCollection } from '../utils/interpolateGplates'
import { polygonToMergedGeometry } from '../utils/geojsonToSphere'
import {
  continentNamesFromCollection,
  HIDDEN_CONTINENT_NAMES,
  labeledContinentNamesFromCollection,
} from '../utils/globeLandOverlays'
import { plateFeatureToDirection, PLATE_GLOBE_ROTATION } from '../utils/plateFocus'
import {
  GLOBE_LAND_COLOR,
  GLOBE_LAND_LABEL_RADIUS,
  GLOBE_LAND_RADIUS,
  GLOBE_OCEAN_COLOR,
  GLOBE_OCEAN_RADIUS,
  GLOBE_PATCH_OPACITY_CUTOFF,
} from '../constants/globe'

interface LandGlobeProps {
  ageMa: number
}

function assignGeometry(mesh: Mesh | null, nextGeometry: ReturnType<typeof polygonToMergedGeometry>) {
  if (!mesh || !nextGeometry) return
  const previous = mesh.geometry
  if (previous === nextGeometry) return
  mesh.geometry = nextGeometry
  if (previous && previous !== nextGeometry) {
    previous.dispose()
  }
}

function ContinentLabel({ name }: { name: string }) {
  return (
    <Billboard follow>
      <Text
        fontSize={0.048}
        color="#f4f8f0"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#1a331a"
        maxWidth={0.4}
      >
        {name}
      </Text>
    </Billboard>
  )
}

export function LandGlobe({ ageMa }: LandGlobeProps) {
  const ageRef = useRef(ageMa)
  ageRef.current = ageMa

  const presentData = useGplatesEraData('present')

  const landNames = useMemo(
    () =>
      presentData.data
        ? continentNamesFromCollection(presentData.data.continents.features)
        : [],
    [presentData.data],
  )

  const labelNames = useMemo(
    () =>
      presentData.data
        ? labeledContinentNamesFromCollection(presentData.data.continents.features)
        : [],
    [presentData.data],
  )

  const fillRefs = useRef<Map<string, Mesh>>(new Map())
  const labelRefs = useRef<Map<string, Group>>(new Map())

  useFrame(() => {
    const { from: fromEra, to: toEra, t } = getEraBlend(ageRef.current)
    const fromCached = getCachedEraData(fromEra.id)
    const toCached = getCachedEraData(toEra.id)
    if (!fromCached || !toCached) return

    const blendT = fromEra.id === toEra.id ? 0 : t
    const morphed = interpolatePlateCollection(
      fromCached.continents,
      toCached.continents,
      blendT,
    )

    for (const feature of morphed.features) {
      const name = String(feature.properties.name ?? '')
      if (!name) continue

      const opacity = Number(feature.properties.opacity ?? 1)
      if (opacity < GLOBE_PATCH_OPACITY_CUTOFF) continue

      assignGeometry(
        fillRefs.current.get(name) ?? null,
        polygonToMergedGeometry(feature.geometry, GLOBE_LAND_RADIUS),
      )

      const labelGroup = labelRefs.current.get(name)
      if (labelGroup && !HIDDEN_CONTINENT_NAMES.has(name)) {
        labelGroup.position
          .copy(plateFeatureToDirection(feature))
          .multiplyScalar(GLOBE_LAND_LABEL_RADIUS)
        labelGroup.visible = true
      }
    }
  })

  if (presentData.error) {
    return null
  }

  return (
    <group rotation={PLATE_GLOBE_ROTATION}>
      <mesh>
        <sphereGeometry args={[GLOBE_OCEAN_RADIUS, 64, 64]} />
        <meshStandardMaterial color={GLOBE_OCEAN_COLOR} roughness={0.85} metalness={0.02} />
      </mesh>

      {landNames.map((name) => (
        <mesh
          key={name}
          ref={(mesh) => {
            if (mesh) fillRefs.current.set(name, mesh)
            else fillRefs.current.delete(name)
          }}
          renderOrder={1}
        >
          <meshBasicMaterial color={GLOBE_LAND_COLOR} side={DoubleSide} />
        </mesh>
      ))}

      {labelNames.map((name) => (
        <group
          key={name}
          ref={(group) => {
            if (group) labelRefs.current.set(name, group)
            else labelRefs.current.delete(name)
          }}
          renderOrder={2}
        >
          <ContinentLabel name={name} />
        </group>
      ))}
    </group>
  )
}

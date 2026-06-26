import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { SphereGeometry } from 'three'
import type { Group, Mesh } from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { getInteriorPreviewLayers, isInteriorPreviewLayer } from '../data/interiorPreview'
import type { InteriorPreviewLayer } from '../data/interiorPreview'
import type { LayerId } from '../data/layers'
import { WEDGE } from '../utils/earthGeometry'
import { CrustBallMaterial } from './CrustBallMaterial'
import { InnerCoreMaterial } from './InnerCoreMaterial'
import { TEXTURED_BALL_LAYERS, TexturedLayerMaterial } from './texturedLayerMaterials'

function PreviewLayerMaterial({
  layerId,
  emissiveIntensity,
  layer,
}: {
  layerId: LayerId
  emissiveIntensity: number
  layer: InteriorPreviewLayer
}) {
  if (layerId === 'crust') {
    return <CrustBallMaterial emissiveIntensity={emissiveIntensity} />
  }

  if (layerId === 'inner-core') {
    return <InnerCoreMaterial emissiveIntensity={emissiveIntensity} />
  }

  if (TEXTURED_BALL_LAYERS.has(layerId)) {
    return (
      <TexturedLayerMaterial
        layerId={layerId}
        emissiveIntensity={emissiveIntensity}
      />
    )
  }

  return (
    <meshStandardMaterial
      color={layer.color}
      emissive={layer.emissive}
      emissiveIntensity={emissiveIntensity}
      roughness={layer.roughness}
      metalness={layer.metalness}
    />
  )
}

function labelPosition(layer: InteriorPreviewLayer): [number, number, number] {
  const radius = layer.outerRadius * 1.08
  const phi = WEDGE.phiStart + WEDGE.phiLength * 0.68
  const theta = WEDGE.thetaStart + WEDGE.thetaLength * 0.42

  return [
    radius * Math.sin(theta) * Math.cos(phi),
    radius * Math.cos(theta),
    radius * Math.sin(theta) * Math.sin(phi),
  ]
}

interface InteriorPreviewModelProps {
  selectedLayerId: LayerId | null
  onSelect: (id: LayerId) => void
  autoRotate?: boolean
}

export function InteriorPreviewModel({
  selectedLayerId,
  onSelect,
  autoRotate = true,
}: InteriorPreviewModelProps) {
  const groupRef = useRef<Group>(null)
  const layers = useMemo(() => getInteriorPreviewLayers(), [])
  const activeLayer = isInteriorPreviewLayer(selectedLayerId)
    ? layers.find((layer) => layer.id === selectedLayerId)
    : null

  useFrame((_, delta) => {
    if (!autoRotate || !groupRef.current) return
    groupRef.current.rotation.y += delta * 0.22
  })

  return (
    <group ref={groupRef} rotation={[0.12, -0.45, 0]}>
      {activeLayer && (
        <>
          <PreviewLayerShell
            layer={activeLayer}
            onSelect={onSelect}
          />
          <LayerNumberLabel
            layer={activeLayer}
            onSelect={onSelect}
          />
        </>
      )}
    </group>
  )
}

function PreviewLayerShell({
  layer,
  onSelect,
}: {
  layer: InteriorPreviewLayer
  onSelect: (id: LayerId) => void
}) {
  const meshRef = useRef<Mesh>(null)
  const geometry = useMemo(
    () => new SphereGeometry(layer.outerRadius, 64, 64),
    [layer.outerRadius]
  )

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    onSelect(layer.id)
  }

  const emissiveIntensity = layer.emissiveIntensity * 1.35

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      renderOrder={layer.outerRadius}
      onClick={handleClick}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default'
      }}
    >
      <PreviewLayerMaterial
        layerId={layer.id}
        emissiveIntensity={emissiveIntensity}
        layer={layer}
      />
    </mesh>
  )
}

function LayerNumberLabel({
  layer,
  onSelect,
}: {
  layer: InteriorPreviewLayer
  onSelect: (id: LayerId) => void
}) {
  const position = useMemo(() => labelPosition(layer), [layer])

  return (
    <Html
      position={position}
      center
      distanceFactor={1.35}
      style={{ pointerEvents: 'none' }}
    >
      <button
        type="button"
        className="preview-layer-key preview-layer-key--active"
        title={`${layer.name} (key ${layer.shortcutKey})`}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(layer.id)
        }}
        style={{ pointerEvents: 'auto' }}
      >
        {layer.shortcutKey}
      </button>
    </Html>
  )
}

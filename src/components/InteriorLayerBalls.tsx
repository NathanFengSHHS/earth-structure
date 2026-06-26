import type { ThreeEvent } from '@react-three/fiber'
import { interiorBallRadius } from '../data/crossSectionDiagram'
import { getLayerById, INTERIOR_LAYER_IDS } from '../data/layers'
import type { LayerId } from '../data/layers'
import { CrustBallMaterial } from './CrustBallMaterial'
import { InnerCoreMaterial } from './InnerCoreMaterial'
import { TexturedLayerMaterial } from './texturedLayerMaterials'

function LayerBallMaterial({
  layerId,
  hovered,
}: {
  layerId: LayerId
  hovered: boolean
}) {
  if (layerId === 'crust') {
    return (
      <CrustBallMaterial emissiveIntensity={hovered ? 0.14 : 0.1} />
    )
  }

  if (layerId === 'inner-core') {
    return (
      <InnerCoreMaterial emissiveIntensity={hovered ? 1.05 : 0.95} />
    )
  }

  if (
    layerId === 'upper-mantle' ||
    layerId === 'lower-mantle' ||
    layerId === 'outer-core'
  ) {
    return <TexturedLayerMaterial layerId={layerId} hovered={hovered} />
  }

  return null
}

interface InteriorLayerBallsProps {
  selectedLayerId: LayerId | null
  hoveredLayerId: LayerId | null
  onSelect: (id: LayerId) => void
  onHover: (id: LayerId | null) => void
}

export function InteriorLayerBalls({
  selectedLayerId,
  hoveredLayerId,
  onSelect,
  onHover,
}: InteriorLayerBallsProps) {
  return (
    <>
      {INTERIOR_LAYER_IDS.map((id) => {
        const layer = getLayerById(id)
        const visible = selectedLayerId === id
        const hovered = hoveredLayerId === id

        const handleClick = (event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation()
          onSelect(id)
        }

        const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation()
          onHover(id)
          document.body.style.cursor = 'pointer'
        }

        const handlePointerOut = () => {
          onHover(null)
          document.body.style.cursor = 'default'
        }

        const radius = interiorBallRadius(id)

        return (
          <mesh
            key={id}
            visible={visible}
            renderOrder={layer.displayRadius}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <sphereGeometry args={[radius, 64, 64]} />
            <LayerBallMaterial layerId={id} hovered={hovered} />
          </mesh>
        )
      })}
    </>
  )
}

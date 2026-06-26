import { useMemo, useRef } from 'react'
import { Outlines } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { EarthLayer, LayerId } from '../data/layers'
import { WEDGE, CRUST } from '../utils/earthGeometry'

interface WedgeLayerShellProps {
  layer: EarthLayer
  selected: boolean
  hovered: boolean
  onSelect: (id: LayerId) => void
  onHover: (id: LayerId | null) => void
}

export function WedgeLayerShell({
  layer,
  selected,
  hovered,
  onSelect,
  onHover,
}: WedgeLayerShellProps) {
  const meshRef = useRef<Mesh>(null)

  const emissiveIntensity = useMemo(() => {
    if (selected) return 0.25
    if (hovered) return 0.15
    return layer.id === 'inner-core' ? 0.12 : 0.04
  }, [selected, hovered, layer.id])

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    onSelect(layer.id)
  }

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    onHover(layer.id)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    onHover(null)
    document.body.style.cursor = 'default'
  }

  const wedge = layer.id === 'crust' ? CRUST : WEDGE

  const sphereArgs = [
    layer.displayRadius,
    64,
    64,
    wedge.phiStart,
    wedge.phiLength,
    wedge.thetaStart,
    wedge.thetaLength,
  ] as const

  return (
    <mesh
      ref={meshRef}
      renderOrder={layer.displayRadius}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[...sphereArgs]} />
      <meshStandardMaterial
        color={layer.color}
        emissive={layer.emissive ?? layer.color}
        emissiveIntensity={emissiveIntensity}
        metalness={layer.metalness}
        roughness={layer.roughness}
      />
      {selected && <Outlines thickness={0.02} color="#212121" angle={0} />}
    </mesh>
  )
}

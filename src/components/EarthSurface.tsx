import type { ThreeEvent } from '@react-three/fiber'
import type { LayerId } from '../data/layers'
import { useEarthTextures } from '../hooks/useEarthTextures'
import { CRUST } from '../utils/earthGeometry'

interface EarthSurfaceProps {
  selectedLayerId: LayerId | null
  onSelect: (id: LayerId) => void
  onHover: (id: LayerId | null) => void
}

/** NASA Blue Marble — 3/4 shell with 90° wedge gap (all layer views). */
export function EarthSurface({
  selectedLayerId: _selectedLayerId,
  onSelect,
  onHover,
}: EarthSurfaceProps) {
  const { colorMap, bumpMap } = useEarthTextures()

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    onSelect('crust')
  }

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    onHover('crust')
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    onHover(null)
    document.body.style.cursor = 'default'
  }

  const sphereArgs = [
    1.004,
    64,
    64,
    CRUST.phiStart,
    CRUST.phiLength,
    CRUST.thetaStart,
    CRUST.thetaLength,
  ] as const

  return (
    <mesh
      renderOrder={10}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[...sphereArgs]} />
      <meshStandardMaterial
        map={colorMap}
        bumpMap={bumpMap}
        bumpScale={0.01}
        roughness={0.55}
        metalness={0.01}
        emissive="#ffffff"
        emissiveIntensity={0.32}
        emissiveMap={colorMap}
      />
    </mesh>
  )
}

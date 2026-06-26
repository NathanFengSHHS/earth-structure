import { useTexture } from '@react-three/drei'
import { FrontSide, SRGBColorSpace } from 'three'
import type { Side } from 'three'

export function useOuterCoreTexture() {
  const map = useTexture('/textures/outer-core-lava.png')
  map.colorSpace = SRGBColorSpace
  return map
}

interface OuterCoreMaterialProps {
  emissiveIntensity?: number
  side?: Side
}

/** Molten metal plasma material for the outer core (key 4). */
export function OuterCoreMaterial({
  emissiveIntensity = 0.66,
  side = FrontSide,
}: OuterCoreMaterialProps) {
  const map = useOuterCoreTexture()

  return (
    <meshStandardMaterial
      map={map}
      emissiveMap={map}
      emissive="#ffcc44"
      emissiveIntensity={emissiveIntensity}
      roughness={0.88}
      metalness={0.08}
      side={side}
    />
  )
}

import { useTexture } from '@react-three/drei'
import { FrontSide, SRGBColorSpace } from 'three'
import type { Side } from 'three'

export function useUpperMantleTexture() {
  const map = useTexture('/textures/upper-mantle-lava.png')
  map.colorSpace = SRGBColorSpace
  return map
}

interface UpperMantleMaterialProps {
  emissiveIntensity?: number
  side?: Side
}

/** Fiery lava-style material for the upper mantle (key 2). */
export function UpperMantleMaterial({
  emissiveIntensity = 0.58,
  side = FrontSide,
}: UpperMantleMaterialProps) {
  const map = useUpperMantleTexture()

  return (
    <meshStandardMaterial
      map={map}
      emissiveMap={map}
      emissive="#ff7722"
      emissiveIntensity={emissiveIntensity}
      roughness={0.92}
      metalness={0.02}
      side={side}
    />
  )
}

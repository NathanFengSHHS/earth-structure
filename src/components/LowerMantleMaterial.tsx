import { useTexture } from '@react-three/drei'
import { FrontSide, SRGBColorSpace } from 'three'
import type { Side } from 'three'

import { assetUrl } from '../utils/assetUrl'

export function useLowerMantleTexture() {
  const map = useTexture(assetUrl('textures/lower-mantle-lava.png'))
  map.colorSpace = SRGBColorSpace
  return map
}

interface LowerMantleMaterialProps {
  emissiveIntensity?: number
  side?: Side
}

/** Fiery plasma-style material for the lower mantle (key 3). */
export function LowerMantleMaterial({
  emissiveIntensity = 0.62,
  side = FrontSide,
}: LowerMantleMaterialProps) {
  const map = useLowerMantleTexture()

  return (
    <meshStandardMaterial
      map={map}
      emissiveMap={map}
      emissive="#ffaa22"
      emissiveIntensity={emissiveIntensity}
      roughness={0.9}
      metalness={0.02}
      side={side}
    />
  )
}

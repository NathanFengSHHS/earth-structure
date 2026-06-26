import { useTexture } from '@react-three/drei'
import { FrontSide, SRGBColorSpace } from 'three'
import type { Side } from 'three'

/** CC0 seamless soil — OpenGameArt "Dirt Ground Seamless Free" (ForKotLow) */
export function useCrustDirtTexture() {
  const map = useTexture('/textures/crust-dirt.jpg')
  map.colorSpace = SRGBColorSpace
  return map
}

interface CrustMaterialProps {
  emissiveIntensity?: number
  side?: Side
  depthWrite?: boolean
  polygonOffset?: boolean
  polygonOffsetFactor?: number
}

/** Matte dirt material for the crust ball and cross-section ring. */
export function CrustMaterial({
  emissiveIntensity = 0.09,
  side = FrontSide,
  depthWrite = true,
  polygonOffset = false,
  polygonOffsetFactor = 0,
}: CrustMaterialProps) {
  const map = useCrustDirtTexture()

  return (
    <meshStandardMaterial
      map={map}
      color="#c4b09a"
      emissive="#8d6e63"
      emissiveIntensity={emissiveIntensity}
      roughness={0.94}
      metalness={0.01}
      side={side}
      depthWrite={depthWrite}
      polygonOffset={polygonOffset}
      polygonOffsetFactor={polygonOffsetFactor}
    />
  )
}

/** Brown dirt ball for interior views (key 1). */
export function CrustBallMaterial({
  emissiveIntensity = 0.1,
}: {
  emissiveIntensity?: number
}) {
  return <CrustMaterial emissiveIntensity={emissiveIntensity} />
}

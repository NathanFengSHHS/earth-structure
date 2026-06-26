import { FrontSide } from 'three'
import type { Side } from 'three'

interface InnerCoreMaterialProps {
  emissiveIntensity?: number
  side?: Side
}

/** White-hot emissive material for the inner core (key 5). */
export function InnerCoreMaterial({
  emissiveIntensity = 0.95,
  side = FrontSide,
}: InnerCoreMaterialProps) {
  return (
    <meshStandardMaterial
      color="#FFFDE7"
      emissive="#FFEB3B"
      emissiveIntensity={emissiveIntensity}
      roughness={0.28}
      metalness={0.18}
      side={side}
    />
  )
}

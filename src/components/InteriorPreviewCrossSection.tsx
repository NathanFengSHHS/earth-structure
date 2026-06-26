import { DoubleSide } from 'three'
import type { InteriorPreviewLayer } from '../data/interiorPreview'
import { crossSectionRotation } from '../utils/earthGeometry'

const SCENE_BG = '#040810'

/** Cross-section face for a single visible shell. */
export function InteriorPreviewCrossSection({
  layer,
}: {
  layer: InteriorPreviewLayer
}) {
  return (
    <group rotation={crossSectionRotation()}>
      <mesh position={[0, 0, 0.001]}>
        <circleGeometry args={[layer.outerRadius, 64]} />
        <meshStandardMaterial
          color={layer.color}
          emissive={layer.emissive}
          emissiveIntensity={layer.emissiveIntensity * 0.85}
          roughness={layer.roughness}
          metalness={layer.metalness}
          side={DoubleSide}
        />
      </mesh>
      {layer.innerRadius > 0 && (
        <mesh position={[0, 0, 0.002]} renderOrder={1}>
          <circleGeometry args={[layer.innerRadius, 64]} />
          <meshStandardMaterial
            color={SCENE_BG}
            roughness={1}
            metalness={0}
            side={DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}

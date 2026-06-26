import type { LayerId } from '../data/layers'
import { CROSS_SECTION_EMISSIVE } from '../data/crossSectionDiagram'
import { DoubleSide } from 'three'
import type { Side } from 'three'
import { InnerCoreMaterial } from './InnerCoreMaterial'
import { CrustMaterial } from './CrustBallMaterial'
import { LowerMantleMaterial } from './LowerMantleMaterial'
import { OuterCoreMaterial } from './OuterCoreMaterial'
import { UpperMantleMaterial } from './UpperMantleMaterial'

export const TEXTURED_BALL_LAYERS = new Set<LayerId>([
  'upper-mantle',
  'lower-mantle',
  'outer-core',
])

export const CROSS_SECTION_TEXTURED_LAYERS = new Set<LayerId>([
  'upper-mantle',
  'lower-mantle',
  'outer-core',
  'inner-core',
])

export function TexturedLayerMaterial({
  layerId,
  emissiveIntensity,
  hovered,
  side,
}: {
  layerId: LayerId
  emissiveIntensity?: number
  hovered?: boolean
  side?: Side
}) {
  if (layerId === 'upper-mantle') {
    return (
      <UpperMantleMaterial
        emissiveIntensity={
          emissiveIntensity ?? (hovered ? 0.72 : 0.58)
        }
        side={side}
      />
    )
  }

  if (layerId === 'lower-mantle') {
    return (
      <LowerMantleMaterial
        emissiveIntensity={
          emissiveIntensity ?? (hovered ? 0.78 : 0.62)
        }
        side={side}
      />
    )
  }

  if (layerId === 'outer-core') {
    return (
      <OuterCoreMaterial
        emissiveIntensity={
          emissiveIntensity ?? (hovered ? 0.82 : 0.66)
        }
        side={side}
      />
    )
  }

  if (layerId === 'inner-core') {
    return (
      <InnerCoreMaterial
        emissiveIntensity={
          emissiveIntensity ?? (hovered ? 1.05 : 0.95)
        }
        side={side}
      />
    )
  }

  return null
}

/** Material for a layer on the diagram cross-section face. */
export function CrossSectionLayerMaterial({
  layerId,
}: {
  layerId: LayerId
}) {
  const emissive = CROSS_SECTION_EMISSIVE[layerId]

  if (layerId === 'crust') {
    return (
      <CrustMaterial
        emissiveIntensity={0.1}
        side={DoubleSide}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
      />
    )
  }

  if (CROSS_SECTION_TEXTURED_LAYERS.has(layerId)) {
    return (
      <TexturedLayerMaterial
        layerId={layerId}
        emissiveIntensity={emissive}
        side={DoubleSide}
      />
    )
  }

  return null
}

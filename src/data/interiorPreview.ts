import { interiorBallRadius } from './crossSectionDiagram'
import type { LayerId } from './layers'
import { getLayerById } from './layers'

/** Sciencing-style colors for the interior layers preview (outer → inner). */
export const INTERIOR_PREVIEW_ORDER: LayerId[] = [
  'crust',
  'upper-mantle',
  'lower-mantle',
  'outer-core',
  'inner-core',
]

export interface InteriorPreviewLayer {
  id: LayerId
  name: string
  shortcutKey: string
  outerRadius: number
  innerRadius: number
  color: string
  emissive: string
  emissiveIntensity: number
  roughness: number
  metalness: number
}

export const PREVIEW_STYLE: Record<
  LayerId,
  Pick<
    InteriorPreviewLayer,
    'color' | 'emissive' | 'emissiveIntensity' | 'roughness' | 'metalness'
  >
> = {
  crust: {
    color: '#6D4C41',
    emissive: '#4E342E',
    emissiveIntensity: 0.08,
    roughness: 0.92,
    metalness: 0.02,
  },
  'upper-mantle': {
    color: '#6B2210',
    emissive: '#8B3118',
    emissiveIntensity: 0.22,
    roughness: 0.82,
    metalness: 0.04,
  },
  'lower-mantle': {
    color: '#D84315',
    emissive: '#FF5722',
    emissiveIntensity: 0.38,
    roughness: 0.72,
    metalness: 0.06,
  },
  'outer-core': {
    color: '#FF8F00',
    emissive: '#FFB300',
    emissiveIntensity: 0.62,
    roughness: 0.45,
    metalness: 0.12,
  },
  'inner-core': {
    color: '#FFFDE7',
    emissive: '#FFEB3B',
    emissiveIntensity: 0.95,
    roughness: 0.28,
    metalness: 0.18,
  },
}

export function isInteriorPreviewLayer(
  id: LayerId | null
): id is (typeof INTERIOR_PREVIEW_ORDER)[number] {
  return id !== null && INTERIOR_PREVIEW_ORDER.includes(id as (typeof INTERIOR_PREVIEW_ORDER)[number])
}

export function getInteriorPreviewLayers(): InteriorPreviewLayer[] {
  return INTERIOR_PREVIEW_ORDER.map((id) => {
    const layer = getLayerById(id)
    const style = PREVIEW_STYLE[id]

    return {
      id,
      name: layer.name,
      shortcutKey: layer.shortcutKey,
      outerRadius: interiorBallRadius(id),
      innerRadius: layer.innerRadius,
      ...style,
    }
  })
}

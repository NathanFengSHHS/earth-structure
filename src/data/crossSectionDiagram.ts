import type { LayerId } from './layers'

export interface CrossSectionLayerSpec {
  id: LayerId
  outerRadius: number
  innerRadius: number
}

/** Match EarthSurface sphere radius so cross-section edges align with the globe. */
export const EARTH_SURFACE_RADIUS = 1.004

/** @deprecated Use EARTH_SURFACE_RADIUS */
export const CROSS_SECTION_OUTER_RADIUS = EARTH_SURFACE_RADIUS

const DIAGRAM_SCALE = EARTH_SURFACE_RADIUS / 1.0

/** Crust ball sits just inside the Blue Marble shell. */
export const CRUST_BALL_RADIUS = EARTH_SURFACE_RADIUS * 0.996

/** Exaggerated radii for textbook-style tangent cross-section (outer → inner). */
export const CROSS_SECTION_LAYERS: CrossSectionLayerSpec[] = [
  { id: 'crust', outerRadius: 1.0 * DIAGRAM_SCALE, innerRadius: 0.92 * DIAGRAM_SCALE },
  { id: 'upper-mantle', outerRadius: 0.92 * DIAGRAM_SCALE, innerRadius: 0.72 * DIAGRAM_SCALE },
  { id: 'lower-mantle', outerRadius: 0.72 * DIAGRAM_SCALE, innerRadius: 0.42 * DIAGRAM_SCALE },
  { id: 'outer-core', outerRadius: 0.42 * DIAGRAM_SCALE, innerRadius: 0.2 * DIAGRAM_SCALE },
  { id: 'inner-core', outerRadius: 0.2 * DIAGRAM_SCALE, innerRadius: 0 },
]

/** Radial midpoint of a cross-section layer ring. */
export function crossSectionLayerMidRadius(layerId: LayerId): number {
  const layer = CROSS_SECTION_LAYERS.find((l) => l.id === layerId)
  if (!layer) throw new Error(`No cross-section spec for ${layerId}`)
  return (layer.outerRadius + layer.innerRadius) / 2
}

/** Outer edge of a cross-section layer ring (for aligning interior balls). */
export function crossSectionLayerOuterRadius(layerId: LayerId): number {
  const layer = CROSS_SECTION_LAYERS.find((l) => l.id === layerId)
  if (!layer) throw new Error(`No cross-section spec for ${layerId}`)
  return layer.outerRadius
}

/** Radius for interior preview / cutaway balls. */
export function interiorBallRadius(layerId: LayerId): number {
  if (layerId === 'crust') return CRUST_BALL_RADIUS
  return crossSectionLayerOuterRadius(layerId)
}

/** Emissive intensity for cross-section face (flat cut, slightly softer than 3D balls). */
export const CROSS_SECTION_EMISSIVE: Partial<Record<LayerId, number>> = {
  'upper-mantle': 0.48,
  'lower-mantle': 0.52,
  'outer-core': 0.56,
  'inner-core': 0.85,
}

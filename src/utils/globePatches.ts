import { DoubleSide } from 'three'
import { polygonToMergedGeometry } from './geojsonToSphere'
import type { GeoJsonFeatureCollection } from './geojsonToSphere'
import {
  GLOBE_PATCH_OPACITY_CUTOFF,
  GLOBE_PATCH_RADIUS,
} from '../constants/globe'

export interface ColoredPatchMesh {
  id: string
  name: string
  color: string
  opacity: number
  geometry: NonNullable<ReturnType<typeof polygonToMergedGeometry>>
}

export function buildColoredPatchMeshes(
  collection: GeoJsonFeatureCollection,
  defaultColor: string,
  radius = GLOBE_PATCH_RADIUS,
): ColoredPatchMesh[] {
  return collection.features.flatMap((feature, index) => {
    const name = String(feature.properties.name ?? `patch-${index}`)
    const opacity = Number(feature.properties.opacity ?? 1)
    if (opacity < GLOBE_PATCH_OPACITY_CUTOFF) return []

    const geometry = polygonToMergedGeometry(feature.geometry, radius)
    if (!geometry) return []

    const color = String(feature.properties.color ?? defaultColor)
    return [{ id: name, name, color, opacity, geometry }]
  })
}

export function coloredPatchMaterialProps(
  patch: Pick<ColoredPatchMesh, 'name' | 'color' | 'opacity'>,
  highlightedName: string | null | undefined,
) {
  const patchOpacity = Math.min(1, 0.95 * patch.opacity)
  const isFading = patch.opacity < 0.99
  const isHighlighted = highlightedName === patch.name

  return {
    material: {
      color: isHighlighted ? '#ffffff' : patch.color,
      transparent: isFading || isHighlighted,
      opacity: isHighlighted ? 1 : patchOpacity,
      side: DoubleSide,
      depthWrite: !isFading && !isHighlighted,
    },
    renderOrder: isHighlighted ? 3 : 2,
  }
}

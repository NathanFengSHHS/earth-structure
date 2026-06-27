import { DoubleSide } from 'three'
import { featureCollectionToMergedGeometry } from './geojsonToSphere'
import type { GeoJsonFeature, GeoJsonFeatureCollection } from './geojsonToSphere'
import {
  GLOBE_PATCH_OPACITY_CUTOFF,
  GLOBE_PATCH_RADIUS,
} from '../constants/globe'

export interface ColoredPatchMesh {
  id: string
  name: string
  color: string
  opacity: number
  geometry: NonNullable<ReturnType<typeof featureCollectionToMergedGeometry>>
}

function plateNameForFeature(feature: GeoJsonFeature, index: number): string {
  return String(feature.properties.name ?? feature.properties.plateId ?? `patch-${index}`)
}

export function buildColoredPatchMeshes(
  collection: GeoJsonFeatureCollection,
  defaultColor: string,
  radius = GLOBE_PATCH_RADIUS,
): ColoredPatchMesh[] {
  const groups = new Map<
    string,
    { features: GeoJsonFeature[]; color: string; opacity: number }
  >()

  collection.features.forEach((feature, index) => {
    const name = plateNameForFeature(feature, index)
    const opacity = Number(feature.properties.opacity ?? 1)
    if (opacity < GLOBE_PATCH_OPACITY_CUTOFF) return

    const color = String(feature.properties.color ?? defaultColor)
    const existing = groups.get(name)
    if (existing) {
      existing.features.push(feature)
      existing.opacity = Math.max(existing.opacity, opacity)
    } else {
      groups.set(name, { features: [feature], color, opacity })
    }
  })

  return Array.from(groups.entries()).flatMap(([name, group]) => {
    const geometry = featureCollectionToMergedGeometry(
      { type: 'FeatureCollection', features: group.features },
      radius,
      GLOBE_PATCH_OPACITY_CUTOFF,
    )
    if (!geometry) return []

    return [{ id: name, name, color: group.color, opacity: group.opacity, geometry }]
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

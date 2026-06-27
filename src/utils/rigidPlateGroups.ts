import { BufferGeometry } from 'three'
import { featureCollectionToMergedGeometry } from './geojsonToSphere'
import type { GeoJsonFeature, GeoJsonFeatureCollection } from './geojsonToSphere'
import { captureReferencePositions } from './rigidPlateGeometry'

export type RigidPlateGroupMode = 'reconstructionId' | 'plateId'

export interface RigidPlateGroup {
  groupKey: string
  displayName: string
  /** Major plate label from GPlates export (e.g. Pacific, Africa). */
  majorPlateName: string
  reconstructionPlateId: number
  color: string
  geometry: BufferGeometry
  /** Present-day vertex positions — reset before each absolute rotation. */
  referencePositions: Float32Array
  radius: number
}

export function reconstructionPlateIdForFeature(feature: GeoJsonFeature): number {
  const raw = feature.properties.reconstructionPlateId ?? feature.properties.plateId
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

function majorPlateNameForFeature(feature: GeoJsonFeature, index: number): string {
  return String(
    feature.properties.plateId ?? feature.properties.name ?? `plate-${index}`,
  )
}

function groupKeyForFeature(
  feature: GeoJsonFeature,
  index: number,
  mode: RigidPlateGroupMode,
): string {
  if (mode === 'reconstructionId') {
    const reconstructionPlateId = reconstructionPlateIdForFeature(feature)
    return reconstructionPlateId > 0 ? String(reconstructionPlateId) : `recon-${index}`
  }

  const plateId = String(feature.properties.plateId ?? reconstructionPlateIdForFeature(feature))
  return plateId || `plate-id-${index}`
}

export function buildRigidPlateGroups(
  collection: GeoJsonFeatureCollection,
  mode: RigidPlateGroupMode,
  defaultColor: string,
  radius: number,
): RigidPlateGroup[] {
  const groups = new Map<
    string,
    {
      features: GeoJsonFeature[]
      displayName: string
      majorPlateName: string
      reconstructionPlateId: number
      color: string
    }
  >()

  collection.features.forEach((feature, index) => {
    const groupKey = groupKeyForFeature(feature, index, mode)
    if (!groupKey) return

    const reconstructionPlateId = reconstructionPlateIdForFeature(feature)
    const majorPlateName = majorPlateNameForFeature(feature, index)
    const color = String(feature.properties.color ?? defaultColor)

    const existing = groups.get(groupKey)
    if (existing) {
      existing.features.push(feature)
    } else {
      groups.set(groupKey, {
        features: [feature],
        displayName:
          mode === 'reconstructionId'
            ? `Plate ${reconstructionPlateId}`
            : `Plate ${groupKey}`,
        majorPlateName,
        reconstructionPlateId,
        color,
      })
    }
  })

  const layers: RigidPlateGroup[] = []
  for (const [groupKey, group] of groups) {
    const geometry = featureCollectionToMergedGeometry(
      { type: 'FeatureCollection', features: group.features },
      radius,
    )
    if (!geometry) continue

    layers.push({
      groupKey,
      displayName: group.displayName,
      majorPlateName: group.majorPlateName,
      reconstructionPlateId: group.reconstructionPlateId,
      color: group.color,
      geometry,
      referencePositions: captureReferencePositions(geometry),
      radius,
    })
  }

  return layers.sort((a, b) => a.displayName.localeCompare(b.displayName))
}

export function applyCatalogNames(
  layers: RigidPlateGroup[],
  catalog: Array<{ id: number; name: string; color?: string }>,
): RigidPlateGroup[] {
  const byId = new Map(catalog.map((plate) => [plate.id, plate]))
  return layers.map((layer) => {
    const entry = byId.get(layer.reconstructionPlateId)
    if (!entry) return layer
    return {
      ...layer,
      displayName: entry.name,
    }
  })
}

/** One chip per major plate name for the timeline sidebar. */
export function listMajorPlates(
  collection: GeoJsonFeatureCollection,
  defaultColor: string,
): Array<{ id: string; name: string; color: string }> {
  const byName = new Map<string, { name: string; color: string }>()
  collection.features.forEach((feature, index) => {
    const name = majorPlateNameForFeature(feature, index)
    if (byName.has(name)) return
    byName.set(name, {
      name,
      color: String(feature.properties.color ?? defaultColor),
    })
  })
  return Array.from(byName.values())
    .map((plate) => ({ id: plate.name, ...plate }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

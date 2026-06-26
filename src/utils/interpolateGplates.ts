import type {
  GeoJsonFeature,
  GeoJsonFeatureCollection,
  GeoJsonMultiPolygon,
  GeoJsonPolygon,
} from './geojsonToSphere'
import { morphPolygonGeometry } from './sphereMorph'

function isPolygonGeometry(
  geometry: GeoJsonPolygon | GeoJsonMultiPolygon,
): geometry is GeoJsonPolygon | GeoJsonMultiPolygon {
  return geometry.type === 'Polygon' || geometry.type === 'MultiPolygon'
}

function morphFeaturePair(
  fromFeature: GeoJsonFeature,
  toFeature: GeoJsonFeature,
  t: number,
  opacity: number,
): GeoJsonFeature {
  const geometry = morphPolygonGeometry(fromFeature.geometry, toFeature.geometry, t)
  return {
    type: 'Feature',
    geometry,
    properties: {
      ...fromFeature.properties,
      ...toFeature.properties,
      opacity,
    },
  }
}

function singleFeature(feature: GeoJsonFeature, opacity: number): GeoJsonFeature {
  return {
    type: 'Feature',
    geometry: feature.geometry,
    properties: { ...feature.properties, opacity },
  }
}

export function interpolatePlateCollection(
  from: GeoJsonFeatureCollection,
  to: GeoJsonFeatureCollection,
  t: number,
): GeoJsonFeatureCollection {
  const fromMap = new Map(
    from.features.map((f) => [String(f.properties.name ?? ''), f]),
  )
  const toMap = new Map(to.features.map((f) => [String(f.properties.name ?? ''), f]))
  const names = new Set([...fromMap.keys(), ...toMap.keys()])

  const features: GeoJsonFeature[] = []
  for (const name of names) {
    if (!name) continue
    const fromFeature = fromMap.get(name)
    const toFeature = toMap.get(name)

    if (fromFeature && toFeature) {
      features.push(morphFeaturePair(fromFeature, toFeature, t, 1))
    } else if (fromFeature) {
      features.push(singleFeature(fromFeature, 1 - t))
    } else if (toFeature) {
      features.push(singleFeature(toFeature, t))
    }
  }

  return { type: 'FeatureCollection', features }
}

export function interpolateCoastlineCollection(
  from: GeoJsonFeatureCollection,
  to: GeoJsonFeatureCollection,
  t: number,
): GeoJsonFeatureCollection {
  const fromMap = new Map(
    from.features.map((f) => [String(f.properties.featureId ?? ''), f]),
  )
  const toMap = new Map(
    to.features.map((f) => [String(f.properties.featureId ?? ''), f]),
  )
  const ids = new Set([...fromMap.keys(), ...toMap.keys()])

  const features: GeoJsonFeature[] = []
  for (const id of ids) {
    if (!id) continue
    const fromFeature = fromMap.get(id)
    const toFeature = toMap.get(id)

    if (fromFeature && toFeature) {
      if (!isPolygonGeometry(fromFeature.geometry) || !isPolygonGeometry(toFeature.geometry)) {
        continue
      }
      features.push(morphFeaturePair(fromFeature, toFeature, t, 1))
    } else if (fromFeature) {
      features.push(singleFeature(fromFeature, 1 - t))
    } else if (toFeature) {
      features.push(singleFeature(toFeature, t))
    }
  }

  return { type: 'FeatureCollection', features }
}

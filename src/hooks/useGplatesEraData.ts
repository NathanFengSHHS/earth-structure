import { useEffect, useState } from 'react'
import type { GeoJsonFeatureCollection } from '../utils/geojsonToSphere'
import { loadPlateRotations } from '../utils/plateRotations'

export interface GplatesEraData {
  coastlines: GeoJsonFeatureCollection
  land: GeoJsonFeatureCollection
  paleo: GeoJsonFeatureCollection
  continents: GeoJsonFeatureCollection
  plates: GeoJsonFeatureCollection
}

interface ManifestEra {
  id: string
  ageMa: number
  coastlines: string
  land: string
  paleo: string
  continents: string
  plates: string
}

interface Manifest {
  model: string
  source: string
  eras: ManifestEra[]
}

const dataCache = new Map<string, GplatesEraData>()
let manifestPromise: Promise<Manifest> | null = null
let preloadPromise: Promise<void> | null = null

function loadManifest(): Promise<Manifest> {
  if (!manifestPromise) {
    manifestPromise = fetch(`${import.meta.env.BASE_URL}data/gplates/manifest.json`).then(
      (r) => r.json(),
    )
  }
  return manifestPromise
}

async function loadEraData(eraId: string): Promise<GplatesEraData> {
  const cached = dataCache.get(eraId)
  if (cached) return cached

  const manifest = await loadManifest()
  const era = manifest.eras.find((e) => e.id === eraId)
  if (!era) {
    throw new Error(`Unknown GPlates era: ${eraId}`)
  }

  const base = `${import.meta.env.BASE_URL}data/gplates/`
  const [coastlines, land, paleo, continents, plates] = await Promise.all([
    fetch(`${base}${era.coastlines}`).then((r) => r.json()),
    fetch(`${base}${era.land}`).then((r) => r.json()),
    fetch(`${base}${era.paleo}`).then((r) => r.json()),
    fetch(`${base}${era.continents}`).then((r) => r.json()),
    fetch(`${base}${era.plates}`).then((r) => r.json()),
  ])

  const data: GplatesEraData = { coastlines, land, paleo, continents, plates }
  dataCache.set(eraId, data)
  return data
}

export function preloadAllGplatesEras(): Promise<void> {
  if (!preloadPromise) {
    preloadPromise = loadManifest().then((manifest) =>
      Promise.all([
        ...manifest.eras.map((era) => loadEraData(era.id)),
        loadPlateRotations(),
      ]).then(() => undefined),
    )
  }
  return preloadPromise
}

export function getCachedEraData(eraId: string): GplatesEraData | null {
  return dataCache.get(eraId) ?? null
}

export function useGplatesEraData(eraId: string) {
  const [data, setData] = useState<GplatesEraData | null>(() => getCachedEraData(eraId))
  const [loading, setLoading] = useState(() => !getCachedEraData(eraId))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cached = getCachedEraData(eraId)
    if (cached) {
      setData(cached)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    loadEraData(eraId)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load GPlates data')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [eraId])

  return { data, loading, error }
}

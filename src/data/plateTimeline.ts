export interface PlateEra {
  id: string
  name: string
  ageMa: number
  color: string
  summary: string
  events: string[]
}

/** Maximum reconstructable age for Zahirovic et al. (2022) in GPlates 2.5 GeoData. */
export const GPLATES_MODEL_MAX_MA = 410

export const PLATE_ERAS: PlateEra[] = [
  {
    id: 'devonian',
    name: 'Early Devonian',
    ageMa: 410,
    color: '#8b5a2b',
    summary:
      'Gondwana and Laurussia were separate supercontinents approaching eventual Pangaean assembly. Complex Iapetus and Rheic ocean closures reshaped the Northern Hemisphere.',
    events: [
      'Acadian orogeny builds mountains along eastern North America',
      'First forests and seed plants spread on land',
      'Fish diversify; early tetrapods begin colonizing shallow waters',
      'Southern continents largely united in Gondwana',
    ],
  },
  {
    id: 'late-devonian',
    name: 'Late Devonian',
    ageMa: 360,
    color: '#a06830',
    summary:
      'Continental collisions continued as Laurussia and Gondwana moved closer. Widespread reefs and tropical seas covered many continental margins.',
    events: [
      'Late Devonian extinction disrupts marine ecosystems',
      'Amphibians become established on land',
      'Collision zones form between approaching landmasses',
      'Coal-forming forests expand in humid equatorial regions',
    ],
  },
  {
    id: 'carboniferous',
    name: 'Carboniferous',
    ageMa: 320,
    color: '#3d7a4a',
    summary:
      'Pangaea neared completion through collision of Gondwana and Laurussia. Vast coal swamps formed across equatorial Euramerica.',
    events: [
      'Hercynian-Appalachian orogeny marks Laurussia–Gondwana collision',
      'Formation of the supercontinent Pangaea underway',
      'Giant insects and early reptiles thrive in coal-swamp forests',
      'Ice caps develop on southern Gondwana (Karanga glaciation)',
    ],
  },
  {
    id: 'permian',
    name: 'Permian',
    ageMa: 280,
    color: '#b84a38',
    summary:
      'Pangaea neared its maximum extent as the last major ocean basins closed. Extreme continental interior climates developed.',
    events: [
      'Ural Mountains mark final suture of Pangaea',
      'Vast desert basins in the interior of the supercontinent',
      'Synapsids (mammal ancestors) dominate land vertebrates',
      'End-Permian extinction — largest mass extinction in Earth history — begins at period close',
    ],
  },
  {
    id: 'pangaea',
    name: 'Pangaea',
    ageMa: 250,
    color: '#7b5ea7',
    summary:
      'Nearly all continental crust was joined in the supercontinent Pangaea, surrounded by the global ocean Panthalassa.',
    events: [
      'Laurasia and Gondwana fully merged into one landmass',
      'Appalachian and Ural mountains mark the collision sutures',
      'Dry interior climate with vast desert basins',
      'Early dinosaurs and mammal ancestors diversify on land',
    ],
  },
  {
    id: 'early-breakup',
    name: 'Early Breakup',
    ageMa: 200,
    color: '#2a8a8a',
    summary:
      'Pangaea began rifting apart. The Central Atlantic opened while Gondwana started to fragment.',
    events: [
      'North America and Africa begin to separate',
      'Central Atlantic Ocean starts to form',
      'Early rifting between South America and Africa',
      'Large igneous provinces mark mantle upwelling',
    ],
  },
  {
    id: 'jurassic',
    name: 'Jurassic',
    ageMa: 170,
    color: '#5a9e4a',
    summary:
      'The Atlantic continued widening. Gondwana split into southern continents while Laurasia remained largely intact.',
    events: [
      'South America and Africa separate along the South Atlantic',
      'Antarctica, Australia, and India still joined in East Gondwana',
      'Shallow seas cover much of Europe',
      'Giant sauropod dinosaurs dominate land ecosystems',
    ],
  },
  {
    id: 'cretaceous',
    name: 'Cretaceous',
    ageMa: 100,
    color: '#c9a227',
    summary:
      'Continents approached modern positions. India broke from Antarctica and began drifting north toward Asia.',
    events: [
      'South Atlantic nearly complete between Africa and South America',
      'India separates from Madagascar and moves north',
      'High global sea levels flood continental interiors',
      'T. rex and flowering plants spread across continents',
    ],
  },
  {
    id: 'paleocene',
    name: 'Paleocene',
    ageMa: 60,
    color: '#d4845a',
    summary:
      'India collided with Asia, beginning Himalayan uplift. The Atlantic was wide and Antarctica moved toward the South Pole.',
    events: [
      'India–Asia collision starts building the Himalayas',
      'North Atlantic nearly at modern width',
      'Mammals diversify after dinosaur extinction',
      'Antarctica still connected to Australia',
    ],
  },
  {
    id: 'eocene',
    name: 'Eocene',
    ageMa: 40,
    color: '#5a8ec9',
    summary:
      'Australia separated from Antarctica. The Himalayas continued rising and the modern Mediterranean began forming.',
    events: [
      'Australia–Antarctica rift opens the Tasman Gateway',
      'Alpine orogeny builds European mountain belts',
      'Warm "greenhouse" climate with forests near the poles',
      'Early whales return to the ocean from land ancestors',
    ],
  },
  {
    id: 'present',
    name: 'Present Day',
    ageMa: 0,
    color: '#6eb5ff',
    summary:
      'Modern plate configuration with seven major plates and dozens of microplates. Continents remain widely dispersed.',
    events: [
      'Himalayas still rising ~5 mm per year from ongoing India–Asia collision',
      'East African Rift may form a new ocean in millions of years',
      'Pacific Plate subducts around the Ring of Fire',
      'Atlantic continues to widen at the Mid-Atlantic Ridge',
    ],
  },
]

export const GPLATES_ATTRIBUTION = {
  model: 'Zahirovic et al. (2022)',
  source: 'GPlates 2.5 GeoData (EarthByte, CC BY 3.0)',
  url: 'https://www.earthbyte.org/gplates-2-5-software-and-data-sets/',
  maxAgeMa: GPLATES_MODEL_MAX_MA,
}

export const LAND_ATTRIBUTION = {
  primary: 'Cao et al. (2017) global paleogeography',
  fallback: 'Zahirovic et al. (2022) continental polygons',
  rotations: 'Zahirovic et al. (2022)',
  source: 'GPlates 2.5 GeoData (EarthByte, CC BY 3.0)',
  url: 'https://doi.org/10.5194/bg-14-5425-2017',
}

export const TIMELINE_MAX_MA = GPLATES_MODEL_MAX_MA
export const TIMELINE_MIN_MA = 0

export function getEraById(id: string): PlateEra {
  return PLATE_ERAS.find((e) => e.id === id) ?? PLATE_ERAS[PLATE_ERAS.length - 1]
}

export function getEraForAge(ageMa: number): PlateEra {
  const sorted = [...PLATE_ERAS].sort((a, b) => b.ageMa - a.ageMa)
  return sorted.find((e) => ageMa >= e.ageMa) ?? sorted[sorted.length - 1]
}

export interface EraBlend {
  /** Younger era (closer to present). */
  from: PlateEra
  /** Older era (further in the past). */
  to: PlateEra
  /** 0 = fully from, 1 = fully to. */
  t: number
}

export function getEraBlend(ageMa: number): EraBlend {
  const sorted = [...PLATE_ERAS].sort((a, b) => b.ageMa - a.ageMa)
  const clamped = Math.max(0, Math.min(GPLATES_MODEL_MAX_MA, ageMa))

  if (clamped >= sorted[0].ageMa) {
    return { from: sorted[0], to: sorted[0], t: 0 }
  }

  const present = sorted[sorted.length - 1]
  if (clamped <= present.ageMa) {
    return { from: present, to: present, t: 0 }
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const older = sorted[i]
    const younger = sorted[i + 1]
    if (clamped <= older.ageMa && clamped >= younger.ageMa) {
      const span = older.ageMa - younger.ageMa
      const t = span === 0 ? 0 : (clamped - younger.ageMa) / span
      return { from: younger, to: older, t }
    }
  }

  return { from: present, to: present, t: 0 }
}

export function snapAgeToEra(ageMa: number): number {
  return getEraForAge(ageMa).ageMa
}

export function formatAgeLabel(ageMa: number): string {
  return ageMa === 0 ? 'Present' : `${ageMa} Ma`
}

function ageToTimelinePercent(ageMa: number): number {
  return ((TIMELINE_MAX_MA - ageMa) / TIMELINE_MAX_MA) * 100
}

/** CSS linear-gradient for the geological timeline track (old → present, left → right). */
export function getTimelineTrackGradient(): string {
  const sorted = [...PLATE_ERAS].sort((a, b) => b.ageMa - a.ageMa)
  const stops: string[] = []

  for (let i = 0; i < sorted.length; i++) {
    const era = sorted[i]
    const youngerAge = sorted[i + 1]?.ageMa ?? 0
    const startPct = ageToTimelinePercent(era.ageMa)
    const endPct = ageToTimelinePercent(youngerAge)
    stops.push(`${era.color} ${startPct.toFixed(1)}% ${endPct.toFixed(1)}%`)
  }

  return `linear-gradient(to right, ${stops.join(', ')})`
}

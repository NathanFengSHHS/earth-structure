export type LayerId =
  | 'inner-core'
  | 'outer-core'
  | 'lower-mantle'
  | 'upper-mantle'
  | 'crust'

export interface EarthLayer {
  id: LayerId
  name: string
  /** Depth range from Earth's surface in km [min, max] */
  depthKm: [number, number]
  /** Optional clarifier shown below depth range */
  depthNote?: string
  /** Outer radius as fraction of Earth radius (6378 km) */
  displayRadius: number
  /** Inner radius for shell rendering */
  innerRadius: number
  color: string
  emissive?: string
  metalness: number
  roughness: number
  composition: string
  compositionDetails?: string[]
  /** Element and compound breakdown */
  compositionMakeup?: {
    intro?: string
    elements: string[]
    compounds: string[]
  }
  howWeKnow?: string[]
  whyItMatters?: string[]
  state: string
  temperature: string
  facts: string[]
  shortcutKey: string
}

export const EARTH_RADIUS_KM = 6378

/** Convert depth below surface (km) to normalized radius */
export function depthToRadius(depthKm: number): number {
  return (EARTH_RADIUS_KM - depthKm) / EARTH_RADIUS_KM
}

/** Wedge sector angles for the cutaway slice */
export const WEDGE_PHI_START = Math.PI * 0.45
export const WEDGE_PHI_LENGTH = Math.PI * 0.55
export const WEDGE_THETA_START = 0
export const WEDGE_THETA_LENGTH = Math.PI

/** Crust: 3/4 ball with 90° gap (top-view quarter removed) */
export const CRUST_CUT_ANGLE = Math.PI / 2
export const CRUST_PHI_START = WEDGE_PHI_START + CRUST_CUT_ANGLE
export const CRUST_PHI_LENGTH = Math.PI * 2 - CRUST_CUT_ANGLE

/** Ordered innermost → outermost */
export const LAYERS: EarthLayer[] = [
  {
    id: 'inner-core',
    name: 'Inner Core',
    depthKm: [5150, 6371],
    depthNote: '~1,220 km radius; solid ball at the center of Earth',
    displayRadius: depthToRadius(5150),
    innerRadius: 0,
    color: '#FFF176',
    emissive: '#FFD54F',
    metalness: 0.3,
    roughness: 0.4,
    composition: 'Solid iron-nickel alloy (~85% Fe, ~10% Ni)',
    compositionDetails: [
      'Iron-nickel alloy (~85% Fe, ~5–10% Ni) with small amounts of light elements',
      'Extreme pressure (~3.6 million atm) forces iron solid despite ~5,000°C heat',
      'Crystal structure may be hexagonal close-packed (hcp) ε-iron, not pure BCC',
    ],
    compositionMakeup: {
      intro: 'Estimated bulk composition; exact light-element mix is still debated.',
      elements: [
        'Iron (Fe) — ~85–88% by weight',
        'Nickel (Ni) — ~5–10%',
        'Sulfur (S), Oxygen (O), Silicon (Si), Carbon (C) — ~2–5% combined (light elements)',
        'Trace platinum-group metals inherited from Earth\'s formation',
      ],
      compounds: [
        'Fe-Ni alloy — (Fe,Ni) solid solution; dominant inner-core material',
        'ε-iron (hcp-Fe) — high-pressure iron phase; likely main crystalline form',
        'Fe₃S — iron sulfide; possible light-element component (debated)',
        'FeO — iron(II) oxide; may be present at trace levels',
        'FeSi — iron silicide; candidate light-element alloy (debated)',
      ],
    },
    howWeKnow: [
      'P-waves travel through the inner core but arrive slightly faster along the rotation axis — revealing a solid sphere',
      'Free oscillations of Earth after large earthquakes confirm a distinct inner core',
      'Lab experiments compressing iron to megabar pressures reproduce expected wave speeds',
      'Earth\'s bulk density requires a dense iron-nickel core; meteorites (iron meteorites) provide analog samples',
    ],
    whyItMatters: [
      'Anchors the geodynamo — its rotation and coupling with the outer core shape the magnetic field',
      'Stores primordial heat and chemical signatures from Earth\'s accretion 4.5 billion years ago',
      'Growing slowly as the outer core freezes — releasing latent heat that powers core convection',
      'Super-rotation of the inner core may modulate magnetic field changes over decades',
    ],
    state: 'Solid',
    temperature: '~5,000–6,000°C',
    facts: [
      'About the size of the Moon (~1,220 km radius)',
      'Extreme pressure keeps iron solid despite intense heat',
      'Rotates slightly faster than the rest of the planet',
    ],
    shortcutKey: '5',
  },
  {
    id: 'outer-core',
    name: 'Outer Core',
    depthKm: [2890, 5150],
    depthNote: '~2,260 km thick; entirely liquid metal',
    displayRadius: depthToRadius(2890),
    innerRadius: depthToRadius(5150),
    color: '#D84315',
    emissive: '#BF360C',
    metalness: 0.15,
    roughness: 0.65,
    composition: 'Liquid iron-nickel with lighter elements (S, O, Si)',
    compositionDetails: [
      'Liquid iron-nickel alloy (~80–85% Fe, ~5–10% Ni) plus ~10% lighter elements',
      'Lighter elements (S, O, Si, C) lower the melting point so the outer core stays liquid',
      'Vigorous convection of molten iron generates Earth\'s magnetic field via the geodynamo',
    ],
    compositionMakeup: {
      intro: 'Bulk liquid-metal composition inferred from seismology, density, and lab experiments.',
      elements: [
        'Iron (Fe) — ~80–85% by weight',
        'Nickel (Ni) — ~5–10%',
        'Sulfur (S) — ~1–3% (major candidate light element)',
        'Oxygen (O), Silicon (Si), Carbon (C) — present in smaller or debated amounts',
      ],
      compounds: [
        'Liquid Fe-Ni — (Fe,Ni)l; bulk of the outer core',
        'FeS — iron sulfide; likely key light-element compound lowering the melting point',
        'FeO — iron(II) oxide; possible oxygen-bearing component',
        'Fe₂SiO₄ — iron silicate; candidate dissolved silicate (debated)',
        'Fe₃C — iron carbide; possible minor carbon-bearing phase',
      ],
    },
    howWeKnow: [
      'S-waves (shear waves) cannot pass through the outer core — proving it is liquid, not solid',
      'P-wave shadow zones and travel-time curves match a liquid shell ~2,260 km thick',
      'Earth\'s magnetic field requires a conducting, convecting fluid layer — the outer core',
      'Density and bulk Earth models require a low-viscosity metallic layer between mantle and inner core',
    ],
    whyItMatters: [
      'Generates Earth\'s magnetic field through the geodynamo — shielding life from solar wind and cosmic radiation',
      'Convection transfers heat from the inner core outward, driving mantle plumes and plate tectonics',
      'Magnetic reversals recorded in seafloor rocks trace outer-core dynamics over millions of years',
      'Without it, the atmosphere would erode faster and surface radiation levels would be far higher',
    ],
    state: 'Liquid',
    temperature: '~4,000–5,000°C',
    facts: [
      'Convection of liquid iron generates Earth\'s magnetic field',
      'About 2,260 km thick — roughly the width of the continental U.S.',
      'Seismic S-waves cannot travel through it, proving it is liquid',
    ],
    shortcutKey: '4',
  },
  {
    id: 'lower-mantle',
    name: 'Lower Mantle',
    depthKm: [660, 2890],
    depthNote: 'Largest layer by volume (~55% of Earth)',
    displayRadius: depthToRadius(660),
    innerRadius: depthToRadius(2890),
    color: '#FF6D00',
    metalness: 0.05,
    roughness: 0.85,
    composition: 'Solid silicate perovskite and post-perovskite',
    compositionDetails: [
      'Bridgmanite — (Mg,Fe)SiO₃ perovskite; the most abundant mineral on Earth',
      'Ferropericlase — (Mg,Fe)O; second major phase (~10–20% of lower mantle)',
      'Post-perovskite may dominate in the deepest ~200 km just above the core',
    ],
    compositionMakeup: {
      intro: 'Bulk silicate mantle composition; minerals change form under extreme pressure, not chemistry.',
      elements: [
        'Oxygen (O) — ~44–45% by weight',
        'Magnesium (Mg) — ~23–25%',
        'Silicon (Si) — ~21–22%',
        'Iron (Fe) — ~6–8%',
        'Aluminum (Al), Calcium (Ca) — ~2–4% combined (minor)',
      ],
      compounds: [
        'Bridgmanite — (Mg,Fe)SiO₃ (MgSiO₃ perovskite structure); ~75–80% of lower mantle',
        'Ferropericlase — (Mg,Fe)O (magnesium wüstite); ~10–20% of lower mantle',
        'Post-perovskite — (Mg,Fe)SiO₃ (high-pressure polymorph); deepest lower mantle',
        'CaSiO₃ — calcium silicate perovskite; minor phase (~1–2%)',
        'Al₂O₃ — alumina; incorporated into silicate structures at small fractions',
      ],
    },
    howWeKnow: [
      'Seismic tomography maps wave-speed variations through the lower mantle in 3D',
      'The 660 km discontinuity marks a sharp jump in wave speed — olivine transforms to denser phases',
      'Diamond-anvil lab experiments recreate megabar pressures and confirm bridgmanite properties',
      'Meteorites (chondrites) provide the baseline bulk composition expected in the mantle',
    ],
    whyItMatters: [
      'Contains most of Earth\'s mass and volume — controls the planet\'s overall heat budget and evolution',
      'Slow solid-state convection carries heat upward, driving plate tectonics and hot-spot volcanism',
      'Subducted oceanic plates sink to the lower mantle, recycling crust back into the interior',
      'Mineral physics here determines how heat escapes from the core and how continents move',
    ],
    state: 'Solid (high pressure)',
    temperature: '~1,900–3,700°C',
    facts: [
      'Makes up ~55% of Earth\'s volume',
      'Extends from ~660 km to ~2,890 km depth',
      'Heat flows upward via slow solid-state convection',
    ],
    shortcutKey: '3',
  },
  {
    id: 'upper-mantle',
    name: 'Upper Mantle',
    depthKm: [35, 660],
    depthNote: 'Includes asthenosphere (~100–660 km); lithosphere above',
    displayRadius: depthToRadius(100),
    innerRadius: depthToRadius(660),
    color: '#FF8F00',
    metalness: 0.05,
    roughness: 0.82,
    composition: 'Solid silicate rocks (olivine, pyroxene, garnet)',
    compositionDetails: [
      'Lithosphere (~35–100 km): rigid olivine-rich rock forming tectonic plates with the crust',
      'Asthenosphere (~100–660 km): solid but ductile — rock flows slowly over geologic time',
      'Transition zone (410–660 km): olivine transforms to denser polymorphs (wadsleyite, ringwoodite)',
    ],
    compositionMakeup: {
      intro: 'Typical peridotite bulk composition; mineral proportions vary with depth in the transition zone.',
      elements: [
        'Oxygen (O) — ~44–45% by weight',
        'Magnesium (Mg) — ~23–25%',
        'Silicon (Si) — ~21–22%',
        'Iron (Fe) — ~6–8%',
        'Aluminum (Al), Calcium (Ca) — ~2–4% combined',
      ],
      compounds: [
        'Olivine — (Mg,Fe)₂SiO₄ (forsterite–fayalite series); dominant upper-mantle mineral',
        'Pyroxene — (Mg,Fe)SiO₃ (enstatite–ferrosilite); major constituent of peridotite',
        'Garnet — (Mg,Fe)₃Al₂Si₃O₁₂ (pyrope–almandine); increases below ~200 km depth',
        'Ringwoodite — γ-(Mg,Fe)₂SiO₄; spinel-structure olivine at 520–660 km depth',
        'Wadsleyite — β-(Mg,Fe)₂SiO₄; transition-zone polymorph at 410–520 km depth',
        'Spinel — (Mg,Fe)Al₂O₄; minor aluminous phase in shallow upper mantle',
      ],
    },
    howWeKnow: [
      'Xenoliths — mantle rock fragments erupted in kimberlite and basalt volcanoes — provide direct samples',
      'Seismic discontinuities at 410 km and 660 km mark olivine phase transitions with depth',
      'Lab experiments on olivine at high pressure reproduce the observed wave-speed jumps',
      'Mid-ocean ridge basalt chemistry traces partial melting of upper-mantle peridotite',
    ],
    whyItMatters: [
      'Asthenosphere ductility allows tectonic plates to move on top of the upper mantle',
      'Partial melting in the upper mantle produces magma for volcanoes, island arcs, and new ocean crust',
      'Heat convecting through the upper mantle drives seafloor spreading and mountain building',
      'Water and carbon stored in subducting slabs enter the upper mantle, affecting melting and volcanism',
    ],
    state: 'Solid (partially ductile asthenosphere below ~100 km)',
    temperature: '~500–1,900°C',
    facts: [
      'Includes the asthenosphere, where rock slowly flows over geologic time',
      'Source region for most magma that reaches the surface',
      'Separated from lower mantle by the 660 km discontinuity',
    ],
    shortcutKey: '2',
  },
  {
    id: 'crust',
    name: 'Crust',
    depthKm: [0, 70],
    depthNote: 'Oceanic ~5–10 km; continental ~25–70 km',
    displayRadius: 1.0,
    innerRadius: depthToRadius(100),
    color: '#5D4037',
    metalness: 0.02,
    roughness: 0.92,
    composition: 'Silicate rocks — granite (continental) and basalt (oceanic)',
    compositionDetails: [
      'Oceanic: basalt — iron/magnesium silicates, ~5–10 km thick, denser (~3.0 g/cm³)',
      'Continental: granite — aluminum-rich silicates, ~25–70 km thick, lighter (~2.7 g/cm³)',
    ],
    compositionMakeup: {
      intro:
        'Average continental crust by weight; oceanic crust has more iron and magnesium.',
      elements: [
        'Oxygen (O) — ~46% by weight (bound in minerals, not free gas)',
        'Silicon (Si) — ~28%',
        'Aluminum (Al) — ~8% (much higher in continental crust)',
        'Iron (Fe) — ~5% (higher in oceanic basalt)',
        'Calcium (Ca), Sodium (Na), Potassium (K), Magnesium (Mg) — ~2–4% each',
      ],
      compounds: [
        'Silicates — SiO₄ tetrahedra (general formula SiO₂ in many minerals); ~95% of crust',
        'Quartz — SiO₂ (silicon dioxide); common in granite and sandstone',
        'Feldspars — KAlSi₃O₈ (K-feldspar), NaAlSi₃O₈ (albite), CaAl₂Si₂O₈ (anorthite)',
        'Pyroxene — (Mg,Fe)SiO₃; Olivine — (Mg,Fe)₂SiO₄; dominate oceanic basalt',
        'Mica — KAl₂(AlSi₃O₁₀)(OH)₂; Amphibole — (Ca,Na)₂(Mg,Fe)₅Si₈O₂₂(OH)₂',
        'Calcite — CaCO₃ (calcium carbonate); in limestone and chalk',
      ],
    },
    howWeKnow: [
      'Direct rock samples from land, drilling (~12 km max), and ocean-floor cores',
      'Seismic waves mark the Moho — the sharp boundary between crust and mantle',
      'Laboratory wave-speed tests on granite and basalt match seismic data',
    ],
    whyItMatters: [
      'Broken into tectonic plates that move — causing earthquakes, volcanoes, and mountains',
      'Weathering of crustal rocks draws CO₂ from the atmosphere, stabilizing climate over millions of years',
      'All known life, water, soil, and mineral resources exist in or on the crust',
    ],
    state: 'Solid',
    temperature: '~200–400°C near the surface (hotter with depth)',
    facts: [
      'Thinnest under oceans (~5–7 km), thickest under mountains (~70 km)',
      'Less than 1% of Earth\'s total volume',
    ],
    shortcutKey: '1',
  },
]

/** Thin asthenosphere band (visual only, between crust and upper mantle) */
export const ASTHENOSPHERE = {
  outerRadius: depthToRadius(100),
  innerRadius: depthToRadius(200),
  color: '#E65100',
}

export const DEPTH_MARKERS = [
  { depthKm: 2900, label: '2900 km' },
  { depthKm: 5100, label: '5100 km' },
  { depthKm: 6378, label: '6378 km' },
]

export const LAYER_MAP = Object.fromEntries(
  LAYERS.map((layer) => [layer.id, layer])
) as Record<LayerId, EarthLayer>

/** Interior layers shown as separate balls (shortcuts 1–5) */
export const INTERIOR_LAYER_IDS: LayerId[] = [
  'crust',
  'outer-core',
  'lower-mantle',
  'upper-mantle',
  'inner-core',
]

export function getLayerById(id: LayerId): EarthLayer {
  return LAYER_MAP[id]
}

export function formatDepthRange([min, max]: [number, number]): string {
  if (min === 0) {
    return `0 – ${max.toLocaleString()} km depth`
  }
  return `${min.toLocaleString()} – ${max.toLocaleString()} km depth`
}

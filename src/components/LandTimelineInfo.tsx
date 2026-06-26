import type { PlateEra } from '../data/plateTimeline'
import { formatAgeLabel, LAND_ATTRIBUTION } from '../data/plateTimeline'
import { useGplatesEraData } from '../hooks/useGplatesEraData'

interface LandTimelineInfoProps {
  era: PlateEra
  onContinentSelect?: (continentName: string) => void
}

export function LandTimelineInfo({ era, onContinentSelect }: LandTimelineInfoProps) {
  const { data, loading } = useGplatesEraData(era.id)

  const continentChips = data?.continents.features.map((feature, index) => ({
    id: String(feature.properties.name ?? `continent-${index}`),
    name: String(feature.properties.name ?? `Continent ${index + 1}`),
    color: String(feature.properties.color ?? '#8fa8c4'),
  }))

  return (
    <aside className="timeline-info">
      <h2>{era.name}</h2>
      <p className="timeline-info__age">{formatAgeLabel(era.ageMa)}</p>

      <div className="timeline-info__section">
        <h3>Overview</h3>
        <p className="timeline-info__text">{era.summary}</p>
      </div>

      <div className="timeline-info__section">
        <h3>Key Events</h3>
        <ul>
          {era.events.map((event) => (
            <li key={event}>{event}</li>
          ))}
        </ul>
      </div>

      <div className="timeline-info__section">
        <h3>Major Continents This Era</h3>
        {loading && (
          <p className="timeline-info__text">Loading continental reconstruction…</p>
        )}
        {continentChips && (
          <div className="timeline-info__plates">
            {continentChips.map((continent) => (
              <button
                key={continent.id}
                type="button"
                className="timeline-info__plate-chip"
                onClick={() => onContinentSelect?.(continent.name)}
              >
                <span
                  className="timeline-info__plate-dot"
                  style={{ backgroundColor: continent.color }}
                />
                {continent.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="timeline-info__note">
        Colored land = major continents; blue base = ocean.
        Reconstructed from {LAND_ATTRIBUTION.rotations} via {LAND_ATTRIBUTION.source}.
      </p>
    </aside>
  )
}

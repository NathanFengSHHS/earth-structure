import type { PlateEra } from '../data/plateTimeline'
import { GPLATES_ATTRIBUTION, formatAgeLabel } from '../data/plateTimeline'
import { useGplatesEraData } from '../hooks/useGplatesEraData'

interface TimelineInfoProps {
  era: PlateEra
  onPlateSelect?: (plateName: string) => void
}

export function TimelineInfo({ era, onPlateSelect }: TimelineInfoProps) {
  const { data, loading } = useGplatesEraData(era.id)

  const plateChips = data?.plates.features.map((feature, index) => ({
    id: String(feature.properties.name ?? `plate-${index}`),
    name: String(feature.properties.name ?? `Plate ${index + 1}`),
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
        <h3>Major Plates This Era</h3>
        {loading && (
          <p className="timeline-info__text">Loading GPlates reconstruction…</p>
        )}
        {plateChips && (
          <div className="timeline-info__plates">
            {plateChips.map((plate) => (
              <button
                key={plate.id}
                type="button"
                className="timeline-info__plate-chip"
                onClick={() => onPlateSelect?.(plate.name)}
              >
                <span
                  className="timeline-info__plate-dot"
                  style={{ backgroundColor: plate.color }}
                />
                {plate.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="timeline-info__note">
        Reconstructed plates from {GPLATES_ATTRIBUTION.model} via{' '}
        {GPLATES_ATTRIBUTION.source}. Colored patches = major tectonic plates;
        blue base = ocean.
      </p>
    </aside>
  )
}

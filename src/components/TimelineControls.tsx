import type { CSSProperties } from 'react'
import {
  PLATE_ERAS,
  TIMELINE_MAX_MA,
  formatAgeLabel,
  getEraForAge,
  getTimelineTrackGradient,
  type PlateEra,
} from '../data/plateTimeline'

const TIMELINE_TRACK_GRADIENT = getTimelineTrackGradient()

interface TimelineControlsProps {
  ageMa: number
  onAgeChange: (ageMa: number) => void
  onEraSelect: (era: PlateEra) => void
}

export function TimelineEraChips({
  ageMa,
  onEraSelect,
}: Pick<TimelineControlsProps, 'ageMa' | 'onEraSelect'>) {
  const currentEra = getEraForAge(ageMa)

  return (
    <div className="timeline-controls__chips">
      {[...PLATE_ERAS]
        .sort((a, b) => b.ageMa - a.ageMa)
        .map((era) => (
          <button
            key={era.id}
            type="button"
            className={`timeline-controls__chip${
              currentEra.id === era.id ? ' timeline-controls__chip--active' : ''
            }`}
            style={
              {
                '--era-color': era.color,
              } as CSSProperties
            }
            onClick={() => onEraSelect(era)}
          >
            <span className="timeline-controls__chip-dot" aria-hidden />
            {era.name}
          </button>
        ))}
    </div>
  )
}

export function TimelineSlider({
  ageMa,
  onAgeChange,
  isPlaying,
  onPlayToggle,
}: Pick<TimelineControlsProps, 'ageMa' | 'onAgeChange'> & {
  isPlaying: boolean
  onPlayToggle: () => void
}) {
  const currentEra = getEraForAge(ageMa)
  const atPresent = ageMa < 1

  return (
    <div className="timeline-controls">
      <div className="timeline-controls__header">
        <span className="timeline-controls__era">
          <span
            className="timeline-controls__era-dot"
            style={{ backgroundColor: currentEra.color }}
            aria-hidden
          />
          {currentEra.name}
        </span>
        <span className="timeline-controls__age">
          {formatAgeLabel(ageMa)}
        </span>
      </div>

      <div className="timeline-controls__slider-row">
        <button
          type="button"
          className={`timeline-controls__play${
            isPlaying ? ' timeline-controls__play--active' : ''
          }`}
          onClick={onPlayToggle}
          disabled={!isPlaying && atPresent}
          aria-label={isPlaying ? 'Pause timeline' : 'Play to present day'}
          title={isPlaying ? 'Pause' : 'Play to present day'}
        >
          {isPlaying ? (
            <span className="timeline-controls__play-icon" aria-hidden>
              ❚❚
            </span>
          ) : (
            <span className="timeline-controls__play-icon" aria-hidden>
              ▶
            </span>
          )}
        </button>
        <span className="timeline-controls__bound">{TIMELINE_MAX_MA} Ma</span>
        <div
          className="timeline-controls__slider-wrap"
          style={
            {
              '--thumb-color': currentEra.color,
            } as CSSProperties
          }
        >
          <div
            className="timeline-controls__slider-track"
            style={{ background: TIMELINE_TRACK_GRADIENT }}
            aria-hidden
          />
          <input
            type="range"
            className="timeline-controls__slider"
            min={0}
            max={TIMELINE_MAX_MA}
            step={1}
            value={TIMELINE_MAX_MA - ageMa}
            onChange={(e) =>
              onAgeChange(TIMELINE_MAX_MA - Number(e.target.value))
            }
            aria-label="Geological time slider"
          />
        </div>
        <span className="timeline-controls__bound">Present</span>
      </div>
    </div>
  )
}

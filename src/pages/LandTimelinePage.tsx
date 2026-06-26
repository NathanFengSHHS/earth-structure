import { useState } from 'react'
import type { GlobeFocusRequest } from '../components/PlateCameraFocus'
import { LandTimelineScene } from '../components/LandTimelineScene'
import { LandTimelineInfo } from '../components/LandTimelineInfo'
import { TimelineEraChips, TimelineSlider } from '../components/TimelineControls'
import { useTimelineAge } from '../hooks/useTimelineAge'

export function LandTimelinePage() {
  const {
    ageMa,
    era,
    isPlaying,
    handleEraSelect,
    handleAgeChange,
    handlePlayToggle,
  } = useTimelineAge()

  const [continentFocus, setContinentFocus] = useState<GlobeFocusRequest | null>(null)

  const handleContinentSelect = (continentName: string) => {
    setContinentFocus({ name: continentName, requestId: Date.now() })
  }

  return (
    <>
      <main className="app-main app-main--plates">
        <div className="canvas-container">
          <LandTimelineScene ageMa={ageMa} continentFocus={continentFocus} />
        </div>
        <LandTimelineInfo era={era} onContinentSelect={handleContinentSelect} />
        <div className="plate-era-container">
          <p className="plate-era-container__label">Geological eras</p>
          <TimelineEraChips ageMa={ageMa} onEraSelect={handleEraSelect} />
        </div>
      </main>

      <footer className="app-footer app-footer--plates">
        <TimelineSlider
          ageMa={ageMa}
          onAgeChange={handleAgeChange}
          isPlaying={isPlaying}
          onPlayToggle={handlePlayToggle}
        />
      </footer>
    </>
  )
}

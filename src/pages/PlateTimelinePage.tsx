import { useEffect, useRef, useState } from 'react'
import type { GlobeFocusRequest } from '../components/PlateCameraFocus'
import { PlateTimelineScene } from '../components/PlateTimelineScene'
import { TimelineEraChips, TimelineSlider } from '../components/TimelineControls'
import { TimelineInfo } from '../components/TimelineInfo'
import { useTimelineAge } from '../hooks/useTimelineAge'

const PLATE_HIGHLIGHT_MS = 500

export function PlateTimelinePage() {
  const {
    ageMa,
    era,
    isPlaying,
    handleEraSelect,
    handleAgeChange,
    handlePlayToggle,
  } = useTimelineAge()

  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [plateFocus, setPlateFocus] = useState<GlobeFocusRequest | null>(null)
  const [highlightedPlateName, setHighlightedPlateName] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current !== null) {
        clearTimeout(highlightTimerRef.current)
      }
    }
  }, [])

  const handlePlateSelect = (plateName: string) => {
    if (highlightTimerRef.current !== null) {
      clearTimeout(highlightTimerRef.current)
    }

    setPlateFocus({ name: plateName, requestId: Date.now() })
    setHighlightedPlateName(plateName)
    highlightTimerRef.current = setTimeout(() => {
      setHighlightedPlateName(null)
      highlightTimerRef.current = null
    }, PLATE_HIGHLIGHT_MS)
  }

  return (
    <>
      <main className="app-main app-main--plates">
        <div className="canvas-container">
          <PlateTimelineScene
            ageMa={ageMa}
            plateFocus={plateFocus}
            highlightedPlateName={highlightedPlateName}
          />
        </div>
        <TimelineInfo era={era} onPlateSelect={handlePlateSelect} />
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

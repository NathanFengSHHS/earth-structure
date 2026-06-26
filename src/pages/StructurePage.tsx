import { useEffect, useRef } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Scene } from '../components/Scene'
import { InteriorPreviewScene } from '../components/InteriorPreviewScene'
import { InteriorPreviewKeyBar } from '../components/InteriorPreviewKeyBar'
import { LayerInfo, LayerLegend } from '../components/LayerInfo'
import { LAYERS } from '../data/layers'
import { useLayerSelection } from '../hooks/useLayerSelection'

export function StructurePage() {
  const { selectedLayerId, hoveredLayerId, selectLayer, hoverLayer } =
    useLayerSelection()
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      const layer = LAYERS.find((l) => l.shortcutKey === event.key)
      if (layer) {
        selectLayer(layer.id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectLayer])

  return (
    <>
      <main className="app-main">
        <div className="canvas-container">
          <Scene
            selectedLayerId={selectedLayerId}
            hoveredLayerId={hoveredLayerId}
            onSelect={selectLayer}
            onHover={hoverLayer}
            controlsRef={controlsRef}
          />
        </div>
        <LayerInfo selectedLayerId={selectedLayerId} />
        <div className="interior-preview-container">
          <p className="interior-preview-container__label">Interior layers</p>
          <InteriorPreviewScene
            selectedLayerId={selectedLayerId}
            onSelect={selectLayer}
          />
          <InteriorPreviewKeyBar
            selectedLayerId={selectedLayerId}
            onSelect={selectLayer}
          />
        </div>
      </main>

      <footer className="app-footer">
        <LayerLegend selectedLayerId={selectedLayerId} onSelect={selectLayer} />
      </footer>
    </>
  )
}

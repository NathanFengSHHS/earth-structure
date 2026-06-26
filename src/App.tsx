import { useCallback, useEffect, useRef, useState } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Scene } from './components/Scene'
import { InteriorPreviewScene } from './components/InteriorPreviewScene'
import { InteriorPreviewKeyBar } from './components/InteriorPreviewKeyBar'
import { LayerInfo, LayerLegend } from './components/LayerInfo'
import { LAYERS } from './data/layers'
import { useLayerSelection } from './hooks/useLayerSelection'
import './App.css'

function App() {
  const { selectedLayerId, hoveredLayerId, selectLayer, hoverLayer } =
    useLayerSelection()
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const [resetToken, setResetToken] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const resetView = useCallback(() => {
    setResetToken((t) => t + 1)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 100)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      const key = event.key.toLowerCase()

      if (key === 'r') {
        resetView()
        return
      }

      const layer = LAYERS.find((l) => l.shortcutKey === event.key)
      if (layer) {
        selectLayer(layer.id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [resetView, selectLayer])

  return (
    <div className={`app${loaded ? ' app--loaded' : ''}`}>
      <header className="app-header">
        <div className="app-header__title">
          <h1>Earth Internal Structure</h1>
          <p>Interactive 3D cross-section</p>
        </div>
        <button type="button" className="reset-btn" onClick={resetView}>
          Reset View
        </button>
      </header>

      <main className="app-main">
        <div className="canvas-container">
          <Scene
            selectedLayerId={selectedLayerId}
            hoveredLayerId={hoveredLayerId}
            onSelect={selectLayer}
            onHover={hoverLayer}
            controlsRef={controlsRef}
            resetToken={resetToken}
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
    </div>
  )
}

export default App

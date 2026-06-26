import { INTERIOR_PREVIEW_ORDER, getInteriorPreviewLayers } from '../data/interiorPreview'
import type { LayerId } from '../data/layers'

interface InteriorPreviewKeyBarProps {
  selectedLayerId: LayerId | null
  onSelect: (id: LayerId) => void
}

export function InteriorPreviewKeyBar({
  selectedLayerId,
  onSelect,
}: InteriorPreviewKeyBarProps) {
  const layers = getInteriorPreviewLayers()

  return (
    <div className="interior-preview-keys">
      {INTERIOR_PREVIEW_ORDER.map((id) => {
        const layer = layers.find((l) => l.id === id)
        if (!layer) return null

        return (
          <button
            key={id}
            type="button"
            className={`interior-preview-keys__chip${
              selectedLayerId === id ? ' interior-preview-keys__chip--active' : ''
            }`}
            onClick={() => onSelect(id)}
            title={layer.name}
          >
            <kbd>{layer.shortcutKey}</kbd>
            <span>{layer.name}</span>
          </button>
        )
      })}
    </div>
  )
}

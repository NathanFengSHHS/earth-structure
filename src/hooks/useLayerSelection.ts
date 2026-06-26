import { useCallback, useState } from 'react'
import type { LayerId } from '../data/layers'

export function useLayerSelection() {
  const [selectedLayerId, setSelectedLayerId] = useState<LayerId | null>('crust')
  const [hoveredLayerId, setHoveredLayerId] = useState<LayerId | null>(null)

  const selectLayer = useCallback((id: LayerId | null) => {
    setSelectedLayerId(id)
  }, [])

  const hoverLayer = useCallback((id: LayerId | null) => {
    setHoveredLayerId(id)
  }, [])

  return {
    selectedLayerId,
    hoveredLayerId,
    selectLayer,
    hoverLayer,
  }
}

export type LayerSelection = ReturnType<typeof useLayerSelection>

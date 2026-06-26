import { LAYERS } from '../data/layers'
import type { LayerId } from '../data/layers'
import { CrossSectionFace } from './CrossSectionFace'
import { EarthSurface } from './EarthSurface'
import { InteriorLayerBalls } from './InteriorLayerBalls'
import { WedgeLayerShell } from './WedgeLayerShell'

interface EarthProps {
  selectedLayerId: LayerId | null
  hoveredLayerId: LayerId | null
  onSelect: (id: LayerId) => void
  onHover: (id: LayerId | null) => void
}

export function Earth({
  selectedLayerId,
  hoveredLayerId,
  onSelect,
  onHover,
}: EarthProps) {
  return (
    <group rotation={[0.15, -0.35, 0]}>
      <InteriorLayerBalls
        selectedLayerId={selectedLayerId}
        hoveredLayerId={hoveredLayerId}
        onSelect={onSelect}
        onHover={onHover}
      />

      {selectedLayerId !== 'crust' &&
        LAYERS.filter((layer) => layer.id === 'crust').map((layer) => (
          <WedgeLayerShell
            key={layer.id}
            layer={layer}
            selected={selectedLayerId === layer.id}
            hovered={hoveredLayerId === layer.id}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}

      <EarthSurface
        selectedLayerId={selectedLayerId}
        onSelect={onSelect}
        onHover={onHover}
      />

      <CrossSectionFace />
    </group>
  )
}

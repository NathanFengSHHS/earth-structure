import { LAYERS, formatDepthRange, getLayerById } from '../data/layers'
import type { LayerId } from '../data/layers'

interface LayerInfoProps {
  selectedLayerId: LayerId | null
}

function BulletSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="layer-info__section">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function CompositionMakeupSection({
  intro,
  elements,
  compounds,
}: {
  intro?: string
  elements: string[]
  compounds: string[]
}) {
  return (
    <div className="layer-info__section">
      <h3>Elements &amp; Compounds</h3>
      {intro && (
        <p className="layer-info__text layer-info__makeup-intro">{intro}</p>
      )}
      <h4 className="layer-info__subsection">Elements</h4>
      <ul>
        {elements.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h4 className="layer-info__subsection">Common compounds &amp; minerals</h4>
      <ul>
        {compounds.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export function LayerInfo({ selectedLayerId }: LayerInfoProps) {
  if (!selectedLayerId) {
    return (
      <aside className="layer-info layer-info--empty">
        <h2>Explore Earth's Interior</h2>
        <p>
          Click a layer in the 3D model or use the legend below to learn about
          each part of our planet.
        </p>
        <div className="layer-info__hint">
          <p><strong>Controls</strong></p>
          <ul>
            <li>Drag to rotate</li>
            <li>Scroll to zoom</li>
            <li>Press <kbd>1</kbd>–<kbd>5</kbd> to select layers</li>
            <li>Press <kbd>R</kbd> to reset view</li>
          </ul>
        </div>
        <p className="layer-info__note">
          Layer thickness is exaggerated for visibility — not to true scale.
        </p>
      </aside>
    )
  }

  const layer = getLayerById(selectedLayerId)

  return (
    <aside className="layer-info">
      <div
        className="layer-info__swatch"
        style={{ backgroundColor: layer.color }}
      />
      <h2>{layer.name}</h2>
      <p className="layer-info__depth">
        {formatDepthRange(layer.depthKm)}
        {layer.depthNote && (
          <span className="layer-info__depth-note">{layer.depthNote}</span>
        )}
      </p>

      <dl className="layer-info__details">
        <div>
          <dt>State</dt>
          <dd>{layer.state}</dd>
        </div>
        <div>
          <dt>Temperature</dt>
          <dd>{layer.temperature}</dd>
        </div>
      </dl>

      {layer.compositionDetails ? (
        <BulletSection title="Composition" items={layer.compositionDetails} />
      ) : (
        <div className="layer-info__section">
          <h3>Composition</h3>
          <p className="layer-info__text">{layer.composition}</p>
        </div>
      )}

      {layer.compositionMakeup && (
        <CompositionMakeupSection
          intro={layer.compositionMakeup.intro}
          elements={layer.compositionMakeup.elements}
          compounds={layer.compositionMakeup.compounds}
        />
      )}

      {layer.howWeKnow && layer.howWeKnow.length > 0 && (
        <BulletSection title="How We Know" items={layer.howWeKnow} />
      )}

      {layer.whyItMatters && layer.whyItMatters.length > 0 && (
        <BulletSection title="Why It Matters" items={layer.whyItMatters} />
      )}

      <div className="layer-info__facts">
        <h3>Key Facts</h3>
        <ul>
          {layer.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </div>

      <p className="layer-info__note">
        Layer thickness is exaggerated for visibility — not to true scale.
      </p>
    </aside>
  )
}

export function LayerLegend({
  selectedLayerId,
  onSelect,
}: {
  selectedLayerId: LayerId | null
  onSelect: (id: LayerId) => void
}) {
  return (
    <div className="layer-legend">
      {[...LAYERS].reverse().map((layer) => (
        <button
          key={layer.id}
          type="button"
          className={`layer-legend__chip${selectedLayerId === layer.id ? ' layer-legend__chip--active' : ''}`}
          onClick={() => onSelect(layer.id)}
          title={`Shortcut: ${layer.shortcutKey}`}
        >
          <span
            className="layer-legend__dot"
            style={{ backgroundColor: layer.color }}
          />
          {layer.name}
          <span className="layer-legend__key">{layer.shortcutKey}</span>
        </button>
      ))}
    </div>
  )
}

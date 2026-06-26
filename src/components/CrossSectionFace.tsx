import { CRUST_CUT_ANGLE, WEDGE_PHI_START } from '../data/layers'
import { CROSS_SECTION_LAYERS } from '../data/crossSectionDiagram'
import { CrossSectionLayerMaterial } from './texturedLayerMaterials'

const CROSS_SECTION_RENDER_ORDER = 30
const GAP_INSET = 0.006

function gapInwardPosition(yRotation: number): [number, number, number] {
  return [
    GAP_INSET * Math.cos(yRotation),
    0,
    -GAP_INSET * Math.sin(yRotation),
  ]
}

function CrossSectionRing({
  innerRadius,
  outerRadius,
  layerId,
}: {
  innerRadius: number
  outerRadius: number
  layerId: (typeof CROSS_SECTION_LAYERS)[number]['id']
}) {
  return (
    <mesh renderOrder={CROSS_SECTION_RENDER_ORDER}>
      <ringGeometry args={[innerRadius, outerRadius, 64]} />
      <CrossSectionLayerMaterial layerId={layerId} />
    </mesh>
  )
}

function InnerCoreDisc({ radius }: { radius: number }) {
  return (
    <mesh renderOrder={CROSS_SECTION_RENDER_ORDER}>
      <circleGeometry args={[radius, 64]} />
      <CrossSectionLayerMaterial layerId="inner-core" />
    </mesh>
  )
}

function CrossSectionDisc({ yRotation }: { yRotation: number }) {
  return (
    <group
      rotation={[0, yRotation, 0]}
      position={gapInwardPosition(yRotation)}
    >
      {CROSS_SECTION_LAYERS.map((layer) => {
        if (layer.id === 'inner-core') {
          return (
            <InnerCoreDisc
              key={layer.id}
              radius={layer.outerRadius}
            />
          )
        }

        return (
          <CrossSectionRing
            key={layer.id}
            innerRadius={layer.innerRadius}
            outerRadius={layer.outerRadius}
            layerId={layer.id}
          />
        )
      })}
    </group>
  )
}

/**
 * Two identical cross-section discs on the two faces of the 90° wedge gap,
 * exactly CRUST_CUT_ANGLE (90°) apart around Earth's Y axis.
 */
export function CrossSectionFace() {
  const secondFaceRotation = WEDGE_PHI_START + CRUST_CUT_ANGLE

  return (
    <>
      <CrossSectionDisc yRotation={WEDGE_PHI_START} />
      <CrossSectionDisc yRotation={secondFaceRotation} />
    </>
  )
}

import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { GlobeCameraFocus, type GlobeFocusRequest } from './PlateCameraFocus'
import { PlateGlobe } from './PlateGlobe'
import { getPlateWorldDirection } from '../utils/plateFocus'

const DEFAULT_CAMERA_POSITION: [number, number, number] = [0, 0.1, 2.6]
const SCENE_BG = '#143a5c'
const SCENE_CAMERA = {
  position: DEFAULT_CAMERA_POSITION,
  fov: 45,
  near: 0.1,
  far: 100,
} as const

interface PlateTimelineSceneProps {
  ageMa: number
  plateFocus: GlobeFocusRequest | null
  highlightedPlateName: string | null
}

function PlateSceneContent({
  ageMa,
  plateFocus,
  highlightedPlateName,
}: PlateTimelineSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null)

  return (
    <>
      <color attach="background" args={[SCENE_BG]} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 6, 5]} intensity={1.45} color="#ffffff" />
      <directionalLight position={[-3, 2, -2]} intensity={0.6} color="#b3d4ff" />

      <Suspense fallback={null}>
        <PlateGlobe ageMa={ageMa} highlightedPlateName={highlightedPlateName} />
      </Suspense>

      <GlobeCameraFocus
        focus={plateFocus}
        ageMa={ageMa}
        controlsRef={controlsRef}
        getWorldDirection={getPlateWorldDirection}
      />

      <OrbitControls
        ref={controlsRef}
        target={[0, 0, 0]}
        enablePan={false}
        enableDamping={false}
        minDistance={1.5}
        maxDistance={5}
        autoRotate
        autoRotateSpeed={0.35}
      />
    </>
  )
}

export function PlateTimelineScene({
  ageMa,
  plateFocus,
  highlightedPlateName,
}: PlateTimelineSceneProps) {
  return (
    <Canvas
      camera={SCENE_CAMERA}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
      className="earth-canvas"
    >
      <PlateSceneContent
        ageMa={ageMa}
        plateFocus={plateFocus}
        highlightedPlateName={highlightedPlateName}
      />
    </Canvas>
  )
}

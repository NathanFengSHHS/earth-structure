import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { GlobeCameraFocus, type GlobeFocusRequest } from './PlateCameraFocus'
import { LandGlobe } from './LandGlobe'
import { getContinentWorldDirection } from '../utils/plateFocus'

const DEFAULT_CAMERA_POSITION: [number, number, number] = [0, 0.1, 2.6]
const SCENE_BG = '#143a5c'
const SCENE_CAMERA = {
  position: DEFAULT_CAMERA_POSITION,
  fov: 45,
  near: 0.1,
  far: 100,
} as const

interface LandTimelineSceneProps {
  ageMa: number
  continentFocus: GlobeFocusRequest | null
}

function LandSceneContent({
  ageMa,
  continentFocus,
}: LandTimelineSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null)

  return (
    <>
      <color attach="background" args={[SCENE_BG]} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[4, 6, 5]} intensity={1.45} color="#ffffff" />
      <directionalLight position={[-3, 2, -2]} intensity={0.6} color="#b3d4ff" />

      <Suspense fallback={null}>
        <LandGlobe ageMa={ageMa} />
      </Suspense>

      <GlobeCameraFocus
        focus={continentFocus}
        ageMa={ageMa}
        controlsRef={controlsRef}
        getWorldDirection={getContinentWorldDirection}
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

export function LandTimelineScene({
  ageMa,
  continentFocus,
}: LandTimelineSceneProps) {
  return (
    <Canvas
      camera={SCENE_CAMERA}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
      className="earth-canvas"
    >
      <LandSceneContent ageMa={ageMa} continentFocus={continentFocus} />
    </Canvas>
  )
}

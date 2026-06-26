import { Suspense, useEffect, type Ref } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, OrbitControls, Stars, useBounds } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Earth } from './Earth'
import type { LayerId } from '../data/layers'

const DEFAULT_CAMERA_POSITION: [number, number, number] = [0.3, 0.15, 2.4]
const SCENE_BG = '#040810'

interface SceneProps {
  selectedLayerId: LayerId | null
  hoveredLayerId: LayerId | null
  onSelect: (id: LayerId) => void
  onHover: (id: LayerId | null) => void
  controlsRef: Ref<OrbitControlsImpl>
  resetToken: number
}

function BoundsRefresher({
  resetToken,
  selectedLayerId,
}: {
  resetToken: number
  selectedLayerId: LayerId | null
}) {
  const bounds = useBounds()

  useEffect(() => {
    bounds.refresh().fit()
  }, [resetToken, selectedLayerId, bounds])
  return null
}

function SceneContent({
  selectedLayerId,
  hoveredLayerId,
  onSelect,
  onHover,
  controlsRef,
  resetToken,
}: SceneProps) {
  return (
    <>
      <color attach="background" args={[SCENE_BG]} />
      <Stars
        radius={80}
        depth={60}
        count={6000}
        factor={4}
        saturation={0.15}
        fade
        speed={0.4}
      />
      <ambientLight intensity={1.05} />
      <directionalLight position={[4, 6, 5]} intensity={1.45} color="#ffffff" />
      <directionalLight position={[-3, 2, -2]} intensity={0.6} color="#b3d4ff" />

      <Bounds fit observe margin={1.15}>
        <BoundsRefresher resetToken={resetToken} selectedLayerId={selectedLayerId} />
        <Suspense fallback={null}>
          <Earth
            selectedLayerId={selectedLayerId}
            hoveredLayerId={hoveredLayerId}
            onSelect={onSelect}
            onHover={onHover}
          />
        </Suspense>
      </Bounds>

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={1.4}
        maxDistance={5}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.75}
      />
    </>
  )
}

export function Scene(props: SceneProps) {
  return (
    <Canvas
      camera={{ position: DEFAULT_CAMERA_POSITION, fov: 45, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
      className="earth-canvas"
    >
      <SceneContent {...props} />
    </Canvas>
  )
}

export { DEFAULT_CAMERA_POSITION }

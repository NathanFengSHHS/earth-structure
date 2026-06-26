import { OrbitControls, Stars } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { LayerId } from '../data/layers'
import { InteriorPreviewModel } from './InteriorPreviewModel'

const SCENE_BG = '#040810'

interface InteriorPreviewSceneProps {
  selectedLayerId: LayerId | null
  onSelect: (id: LayerId) => void
}

export function InteriorPreviewScene({
  selectedLayerId,
  onSelect,
}: InteriorPreviewSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.15, 2.65], fov: 42, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
      className="interior-preview-canvas"
    >
      <color attach="background" args={[SCENE_BG]} />
      <Stars
        radius={60}
        depth={40}
        count={3000}
        factor={3}
        saturation={0.1}
        fade
        speed={0.25}
      />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} color="#ffffff" />
      <directionalLight position={[-2, 1, -3]} intensity={0.35} color="#ffb74d" />
      <pointLight position={[0, 0, 0.5]} intensity={0.4} color="#fff8e1" distance={3} />

      <InteriorPreviewModel
        selectedLayerId={selectedLayerId}
        onSelect={onSelect}
      />

      <OrbitControls
        enablePan={false}
        minDistance={1.6}
        maxDistance={4.2}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.72}
      />
    </Canvas>
  )
}

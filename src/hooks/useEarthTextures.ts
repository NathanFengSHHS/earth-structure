import { useTexture } from '@react-three/drei'
import { LinearSRGBColorSpace, SRGBColorSpace } from 'three'

export function useEarthTextures() {
  const [colorMap, bumpMap] = useTexture([
    '/textures/earth-blue-marble.jpg',
    '/textures/earth-topology.png',
  ])

  colorMap.colorSpace = SRGBColorSpace
  bumpMap.colorSpace = LinearSRGBColorSpace

  return { colorMap, bumpMap }
}

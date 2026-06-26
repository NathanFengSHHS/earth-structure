import { useTexture } from '@react-three/drei'
import { LinearSRGBColorSpace, SRGBColorSpace } from 'three'
import { assetUrl } from '../utils/assetUrl'

export function useEarthTextures() {
  const [colorMap, bumpMap] = useTexture([
    assetUrl('textures/earth-blue-marble.jpg'),
    assetUrl('textures/earth-topology.png'),
  ])

  colorMap.colorSpace = SRGBColorSpace
  bumpMap.colorSpace = LinearSRGBColorSpace

  return { colorMap, bumpMap }
}

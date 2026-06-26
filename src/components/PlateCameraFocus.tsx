import { useEffect, useRef, type RefObject } from 'react'
import { useThree } from '@react-three/fiber'
import type { Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export interface GlobeFocusRequest {
  name: string
  requestId: number
}

/** @deprecated Use GlobeFocusRequest */
export type PlateFocusRequest = GlobeFocusRequest

const FOCUS_DURATION_MS = 700

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

interface GlobeCameraFocusProps {
  focus: GlobeFocusRequest | null
  ageMa: number
  controlsRef: RefObject<OrbitControlsImpl | null>
  getWorldDirection: (name: string, ageMa: number) => Vector3 | null
}

export function GlobeCameraFocus({
  focus,
  ageMa,
  controlsRef,
  getWorldDirection,
}: GlobeCameraFocusProps) {
  const { camera } = useThree()
  const ageMaRef = useRef(ageMa)
  ageMaRef.current = ageMa

  useEffect(() => {
    if (!focus || !controlsRef.current) return

    const direction = getWorldDirection(focus.name, ageMaRef.current)
    if (!direction) return

    const controls = controlsRef.current
    const wasAutoRotate = controls.autoRotate
    controls.autoRotate = false

    const startPos = camera.position.clone()
    const distance = startPos.length()
    const endPos = direction.clone().multiplyScalar(distance)
    const startTime = performance.now()

    let raf = 0
    let resumeTimer: ReturnType<typeof setTimeout> | null = null

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / FOCUS_DURATION_MS, 1)
      camera.position.lerpVectors(startPos, endPos, easeOutCubic(progress))
      controls.target.set(0, 0, 0)
      controls.update()

      if (progress < 1) {
        raf = requestAnimationFrame(animate)
      } else if (wasAutoRotate) {
        resumeTimer = setTimeout(() => {
          if (controlsRef.current) {
            controlsRef.current.autoRotate = true
          }
        }, 2000)
      }
    }

    raf = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(raf)
      if (resumeTimer) clearTimeout(resumeTimer)
    }
  }, [focus?.requestId, camera, controlsRef, getWorldDirection])

  return null
}

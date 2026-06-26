import { useEffect, useRef, useState } from 'react'
import { getEraForAge, TIMELINE_MAX_MA, type PlateEra } from '../data/plateTimeline'
import { preloadAllGplatesEras } from './useGplatesEraData'

const CHIP_ANIMATION_MS = 2500
const PLAY_TO_PRESENT_FULL_MS = 60000
const PLAY_TO_PRESENT_MIN_MS = 1500

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

export function useTimelineAge() {
  const [ageMa, setAgeMa] = useState(0)
  const era = getEraForAge(ageMa)
  const animationRef = useRef<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const ageMaRef = useRef(ageMa)

  useEffect(() => {
    ageMaRef.current = ageMa
  }, [ageMa])

  const cancelAgeAnimation = () => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }

  const animateAgeTo = (targetAge: number, durationMs: number, onComplete?: () => void) => {
    cancelAgeAnimation()

    const startAge = ageMaRef.current
    if (Math.abs(startAge - targetAge) < 0.5) {
      setAgeMa(targetAge)
      onComplete?.()
      return
    }

    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const eased = easeOutCubic(progress)
      setAgeMa(startAge + (targetAge - startAge) * eased)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick)
      } else {
        animationRef.current = null
        onComplete?.()
      }
    }

    animationRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    void preloadAllGplatesEras()
  }, [])

  useEffect(() => {
    return () => cancelAgeAnimation()
  }, [])

  const handleEraSelect = (selected: PlateEra) => {
    setIsPlaying(false)
    animateAgeTo(selected.ageMa, CHIP_ANIMATION_MS)
  }

  const handleAgeChange = (nextAgeMa: number) => {
    setIsPlaying(false)
    cancelAgeAnimation()
    setAgeMa(nextAgeMa)
  }

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false)
      cancelAgeAnimation()
      return
    }

    if (ageMaRef.current < 1) return

    setIsPlaying(true)
    const duration =
      Math.max(PLAY_TO_PRESENT_MIN_MS, (ageMaRef.current / TIMELINE_MAX_MA) * PLAY_TO_PRESENT_FULL_MS)
    animateAgeTo(0, duration, () => setIsPlaying(false))
  }

  return {
    ageMa,
    era,
    isPlaying,
    handleEraSelect,
    handleAgeChange,
    handlePlayToggle,
  }
}

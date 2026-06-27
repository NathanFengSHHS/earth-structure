import { Quaternion } from 'three'
import { TIMELINE_MAX_MA } from '../data/plateTimeline'

export interface PlateRotationQuaternion {
  x: number
  y: number
  z: number
  w: number
}

export interface PlateRotationCatalogEntry {
  id: number
  name: string
  color?: string
}

export interface PlateRotationsData {
  plates: PlateRotationCatalogEntry[]
  keyframes: Array<{
    ageMa: number
    rotations: Record<string, PlateRotationQuaternion>
  }>
}

let rotationsPromise: Promise<PlateRotationsData> | null = null
let cachedRotations: PlateRotationsData | null = null

const IDENTITY_QUATERNION: PlateRotationQuaternion = { x: 0, y: 0, z: 0, w: 1 }

const scratchFrom = new Quaternion()
const scratchTo = new Quaternion()

function quaternionFromData(
  data: PlateRotationQuaternion,
  target = new Quaternion(),
): Quaternion {
  return target.set(data.x, data.y, data.z, data.w).normalize()
}

export function loadPlateRotations(): Promise<PlateRotationsData> {
  if (cachedRotations) return Promise.resolve(cachedRotations)
  if (!rotationsPromise) {
    rotationsPromise = fetch(
      `${import.meta.env.BASE_URL}data/gplates/plate-rotations.json`,
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load plate rotations')
        }
        return response.json() as Promise<PlateRotationsData>
      })
      .then((data) => {
        cachedRotations = data
        return data
      })
  }
  return rotationsPromise
}

export function getCachedPlateRotations(): PlateRotationsData | null {
  return cachedRotations
}

function rotationAtAge(
  data: PlateRotationsData,
  reconstructionPlateId: number,
  ageMa: number,
): PlateRotationQuaternion {
  const key = String(reconstructionPlateId)
  const keyframe = data.keyframes.find((entry) => entry.ageMa === ageMa)
  return keyframe?.rotations[key] ?? IDENTITY_QUATERNION
}

function interpolatePlateQuaternion(
  data: PlateRotationsData,
  reconstructionPlateId: number,
  ageMa: number,
): Quaternion {
  const clamped = Math.max(0, Math.min(TIMELINE_MAX_MA, ageMa))
  const keyframes = data.keyframes

  if (keyframes.length === 0) {
    return new Quaternion()
  }

  const oldest = keyframes[0]
  if (clamped >= oldest.ageMa) {
    return quaternionFromData(
      rotationAtAge(data, reconstructionPlateId, oldest.ageMa),
    ).clone()
  }

  const youngest = keyframes[keyframes.length - 1]
  if (clamped <= youngest.ageMa) {
    return quaternionFromData(
      rotationAtAge(data, reconstructionPlateId, youngest.ageMa),
    ).clone()
  }

  for (let index = 0; index < keyframes.length - 1; index++) {
    const older = keyframes[index]
    const younger = keyframes[index + 1]
    if (clamped > older.ageMa || clamped < younger.ageMa) continue

    const span = older.ageMa - younger.ageMa
    const t = span === 0 ? 0 : (clamped - younger.ageMa) / span
    const fromRotation = rotationAtAge(data, reconstructionPlateId, younger.ageMa)
    const toRotation = rotationAtAge(data, reconstructionPlateId, older.ageMa)

    if (t <= 0) {
      return quaternionFromData(fromRotation).clone()
    }
    if (t >= 1) {
      return quaternionFromData(toRotation).clone()
    }

    quaternionFromData(fromRotation, scratchFrom)
    quaternionFromData(toRotation, scratchTo)
    return scratchFrom.clone().slerp(scratchTo, t)
  }

  return quaternionFromData(
    rotationAtAge(data, reconstructionPlateId, youngest.ageMa),
  ).clone()
}

export function getPlateQuaternion(
  reconstructionPlateId: number,
  ageMa: number,
): Quaternion {
  const data = cachedRotations
  if (!data) {
    return new Quaternion()
  }

  return interpolatePlateQuaternion(data, reconstructionPlateId, ageMa)
}

export function getPlateCatalogEntry(
  reconstructionPlateId: number,
): PlateRotationCatalogEntry | undefined {
  return cachedRotations?.plates.find((plate) => plate.id === reconstructionPlateId)
}

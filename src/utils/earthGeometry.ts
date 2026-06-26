import {
  CRUST_CUT_ANGLE,
  CRUST_PHI_LENGTH,
  CRUST_PHI_START,
  WEDGE_PHI_LENGTH,
  WEDGE_PHI_START,
  WEDGE_THETA_LENGTH,
  WEDGE_THETA_START,
} from '../data/layers'

export const WEDGE = {
  phiStart: WEDGE_PHI_START,
  phiLength: WEDGE_PHI_LENGTH,
  thetaStart: WEDGE_THETA_START,
  thetaLength: WEDGE_THETA_LENGTH,
}

/** Crust shell covers 270° around Y axis (3/4 ball) */
export const CRUST = {
  phiStart: CRUST_PHI_START,
  phiLength: CRUST_PHI_LENGTH,
  thetaStart: WEDGE_THETA_START,
  thetaLength: WEDGE_THETA_LENGTH,
}

/** Missing 90° wedge restored when crust is selected (key 1) */
export const CRUST_GAP = {
  phiStart: WEDGE_PHI_START,
  phiLength: CRUST_CUT_ANGLE,
  thetaStart: WEDGE_THETA_START,
  thetaLength: WEDGE_THETA_LENGTH,
}

/** Cross-section plane sits at the phi=start boundary of the wedge */
export function crossSectionRotation(): [number, number, number] {
  return [0, WEDGE_PHI_START + Math.PI / 2, 0]
}

export function crossSectionPosition(radius: number): [number, number, number] {
  const angle = WEDGE_PHI_START
  return [Math.cos(angle) * radius * 0.001, 0, Math.sin(angle) * radius * 0.001]
}

import { Vector2 } from 'three'

/**
 * Every object in the 3D scenes is generated here — there are no model files
 * to download, so the canvases start instantly and work offline.
 *
 * A lathe profile is a polyline in (radius, height) that gets revolved around
 * the Y axis. Reading one top to bottom traces the wall of the vessel: up the
 * outside, over the rim, and back down the inside.
 */

/** A tapered ceramic cup, 0.9 units tall. */
export const cupProfile: Vector2[] = [
  new Vector2(0.0, 0.0),
  new Vector2(0.34, 0.0),
  new Vector2(0.38, 0.015),
  new Vector2(0.4, 0.1),
  new Vector2(0.47, 0.32),
  new Vector2(0.54, 0.6),
  new Vector2(0.6, 0.86),
  new Vector2(0.62, 0.9), // rim
  new Vector2(0.575, 0.885),
  new Vector2(0.515, 0.6),
  new Vector2(0.44, 0.32),
  new Vector2(0.36, 0.1),
  new Vector2(0.32, 0.07),
  new Vector2(0.0, 0.07), // inner floor
]

/** A straight-sided tall glass for the iced drinks, 1.25 units tall. */
export const glassProfile: Vector2[] = [
  new Vector2(0.0, 0.0),
  new Vector2(0.42, 0.0),
  new Vector2(0.44, 0.03),
  new Vector2(0.46, 0.6),
  new Vector2(0.48, 1.25), // rim
  new Vector2(0.445, 1.25),
  new Vector2(0.425, 0.6),
  new Vector2(0.405, 0.06),
  new Vector2(0.0, 0.06),
]

/** The saucer under a hot cup. */
export const saucerProfile: Vector2[] = [
  new Vector2(0.0, 0.0),
  new Vector2(0.82, 0.0),
  new Vector2(0.86, 0.035),
  new Vector2(0.84, 0.05),
  new Vector2(0.5, 0.03),
  new Vector2(0.46, 0.05),
  new Vector2(0.0, 0.05),
]

/**
 * The liquid inside a cup, as stacked tapered sections. Radii follow the
 * inner wall so the drink meets the ceramic instead of floating inside it.
 */
export interface Layer {
  /** Height of the top and bottom faces, in local units. */
  from: number
  to: number
  radiusBottom: number
  radiusTop: number
}

export const cupLayers = {
  // Radii trace the inner wall of cupProfile, a hair inside it so the two
  // surfaces do not fight for the same pixels.
  base: { from: 0.075, to: 0.4, radiusBottom: 0.318, radiusTop: 0.457 } satisfies Layer,
  body: { from: 0.4, to: 0.74, radiusBottom: 0.457, radiusTop: 0.54 } satisfies Layer,
  head: { from: 0.74, to: 0.84, radiusBottom: 0.54, radiusTop: 0.561 } satisfies Layer,
}

export const glassLayers = {
  base: { from: 0.065, to: 0.48, radiusBottom: 0.4, radiusTop: 0.415 } satisfies Layer,
  body: { from: 0.48, to: 1.04, radiusBottom: 0.415, radiusTop: 0.437 } satisfies Layer,
  head: { from: 1.04, to: 1.16, radiusBottom: 0.437, radiusTop: 0.442 } satisfies Layer,
}

/** Cylinder args for a layer: [rTop, rBottom, height, segments]. */
export function layerArgs(layer: Layer, segments = 48): [number, number, number, number] {
  return [layer.radiusTop, layer.radiusBottom, layer.to - layer.from, segments]
}

export function layerCentre(layer: Layer): number {
  return (layer.from + layer.to) / 2
}

/**
 * Ice, scattered but deterministic — a fixed set beats Math.random(), which
 * would reshuffle the glass on every re-render.
 */
export const iceCubes: { position: [number, number, number]; rotation: [number, number, number]; scale: number }[] = [
  // Sitting at and just above the surface, where ice actually floats — buried
  // in an opaque drink they would simply not be there.
  { position: [0.14, 1.03, 0.08], rotation: [0.5, 0.9, 0.2], scale: 1 },
  { position: [-0.16, 0.96, -0.06], rotation: [1.1, 0.3, 0.8], scale: 0.9 },
  { position: [0.02, 1.08, -0.13], rotation: [0.2, 1.4, 0.6], scale: 0.84 },
  { position: [-0.06, 0.88, 0.16], rotation: [0.9, 0.6, 1.2], scale: 0.8 },
]

/** Roasted beans, for the small marks beside a product name. */
export const beanScale: [number, number, number] = [1, 0.74, 0.6]

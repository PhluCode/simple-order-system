import type { Brew } from '@/lib/categories'

/**
 * The only warm colours in the whole product live in this file.
 *
 * The interface is deliberately cold — mist grey-green, ink, one cherry red —
 * so that the drink inside the canvas is the single warm object on the page.
 * Do not import these into a component; if a warm colour turns up in the UI
 * chrome the idea stops working.
 */

// Celadon: the pale green glazed stoneware Northern Thailand has been firing
// for six hundred years, and the one glaze that belongs in a Chiang Rai
// coffee house. It is also cool enough to keep the drink the warmest thing on
// screen, and dark enough not to dissolve into the mist background.
export const ceramic = '#9FB4A4'
export const ceramicCut = '#7C9084' // the sliced edge, shaded like poché on a drawing
export const saucer = '#91A896'
export const glassTint = '#DCE4E2'
export const iceTint = '#E8F0F1'

interface BrewMaterial {
  /** The body of the drink. */
  liquid: string
  /** Crema, foam, or icing — whatever sits on top. */
  head: string
  /** How much light passes through, 0–1. Espresso is opaque, tea is not. */
  translucency: number
  roughness: number
}

const BREWS: Record<Brew, BrewMaterial> = {
  espresso: { liquid: '#2B1608', head: '#C08347', translucency: 0.0, roughness: 0.22 },
  americano: { liquid: '#3A1E0D', head: '#A9713C', translucency: 0.06, roughness: 0.24 },
  'milk-coffee': { liquid: '#B4855A', head: '#F1E5D4', translucency: 0.0, roughness: 0.38 },
  caramel: { liquid: '#A97140', head: '#D89A4E', translucency: 0.04, roughness: 0.3 },
  matcha: { liquid: '#6C8E3D', head: '#CBDCA6', translucency: 0.12, roughness: 0.34 },
  chocolate: { liquid: '#4B2B1D', head: '#C9A183', translucency: 0.0, roughness: 0.3 },
  baked: { liquid: '#C08A4A', head: '#E7CB96', translucency: 0.0, roughness: 0.62 },
}

export function brewMaterial(brew: Brew): BrewMaterial {
  return BREWS[brew]
}

/** Crust and crumb for the bakery items. */
export const pastry = {
  crust: '#C08A4A',
  crustDark: '#B27E42',
  crumb: '#E7CB96',
  chocolate: '#3E2318',
  ganache: '#59301F',
}

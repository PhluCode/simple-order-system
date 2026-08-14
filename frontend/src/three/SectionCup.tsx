import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, type Group } from 'three'
import { cupLayers, cupProfile, layerArgs, layerCentre } from './geometry'
import { brewMaterial, ceramic, ceramicCut } from './materials'
import { Stage } from './Stage'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * The hero: a latte drawn as an architectural section.
 *
 * The cup is a half revolution rather than a whole one — the lathe sweeps 180°
 * and the missing half faces the camera, so you look straight through the wall
 * at the drink, which is left whole. The two sliced edges are shaded darker,
 * the way a section drawing pochés cut material.
 *
 * This is the page's one loud object. Everything around it stays quiet.
 */

// Sweep the solid half away from the camera so the open section faces it.
const HALF_START = Math.PI / 2
const HALF = Math.PI

function CupSection() {
  const group = useRef<Group>(null)
  const reduced = useReducedMotion()
  const espresso = brewMaterial('espresso')
  const latte = brewMaterial('milk-coffee')

  useFrame((state) => {
    if (!group.current || reduced) return
    const t = state.clock.elapsedTime
    // A slow breath, not a spin: the section has to stay readable.
    group.current.rotation.y = Math.sin(t * 0.32) * 0.07
    group.current.position.y = -0.42 * 1 + Math.sin(t * 0.5) * 0.012
  })

  return (
    <group ref={group} position={[0, -0.42, 0]} scale={1.1}>
      {/* Only the far half of the ceramic is there. The near half has been
          taken away, which is what makes this a cutaway rather than a cup. */}
      <mesh castShadow>
        <latheGeometry args={[cupProfile, 96, HALF_START, HALF]} />
        <meshStandardMaterial color={ceramic} roughness={0.62} metalness={0} side={DoubleSide} />
      </mesh>

      {/* The two sliced edges, shaded darker — the poché of a section drawing.
          A thin sweep of the same profile, so the cut follows the wall exactly. */}
      <mesh>
        <latheGeometry args={[cupProfile, 4, HALF_START - 0.05, 0.05]} />
        <meshStandardMaterial color={ceramicCut} roughness={0.7} side={DoubleSide} />
      </mesh>
      <mesh>
        <latheGeometry args={[cupProfile, 4, HALF_START + HALF, 0.05]} />
        <meshStandardMaterial color={ceramicCut} roughness={0.7} side={DoubleSide} />
      </mesh>

      {/* Handle, sitting in the cut plane so it reads in full profile. */}
      <mesh position={[-0.55, 0.5, 0]} rotation={[0, Math.PI, 0]} castShadow>
        <torusGeometry args={[0.2, 0.045, 20, 48, Math.PI * 1.25]} />
        <meshStandardMaterial color={ceramic} roughness={0.62} />
      </mesh>

      {/* The drink is left whole: three pours stacked, standing free where the
          wall used to be. Solid, so the bands read as strata. */}
      <mesh position={[0, layerCentre(cupLayers.base), 0]}>
        <cylinderGeometry args={layerArgs(cupLayers.base)} />
        <meshStandardMaterial color={espresso.liquid} roughness={espresso.roughness} />
      </mesh>

      <mesh position={[0, layerCentre(cupLayers.body), 0]}>
        <cylinderGeometry args={layerArgs(cupLayers.body)} />
        <meshStandardMaterial color={latte.liquid} roughness={latte.roughness} />
      </mesh>

      <mesh position={[0, layerCentre(cupLayers.head), 0]}>
        <cylinderGeometry args={layerArgs(cupLayers.head)} />
        <meshStandardMaterial color={latte.head} roughness={0.78} />
      </mesh>
    </group>
  )
}

/** Where each label points, as a percentage of the canvas box. */
const ANNOTATIONS = [
  { top: '15%', label: 'foam', value: '10 mm', anchor: '58%' },
  { top: '36%', label: 'steamed milk', value: '120 ml', anchor: '58%' },
  { top: '62%', label: 'espresso', value: '30 ml', anchor: '56%' },
]

export function SectionCupHero({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Stage camera={[0, 0.55, 3.05]} fov={32} shadow className="h-full w-full">
        <CupSection />
      </Stage>

      {/* Annotation is HTML, not WebGL: it stays selectable, scales with the
          page type, and needs no font loaded into the GPU. */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden="true">
        {ANNOTATIONS.map((a) => (
          <div
            key={a.label}
            className="absolute flex items-center gap-3"
            style={{ top: a.top, left: a.anchor, right: '2%' }}
          >
            <span className="h-px flex-1 bg-line" />
            <span className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="font-mono text-micro uppercase tracking-[0.14em] text-moss">{a.label}</span>
              <span className="font-mono text-micro tabular-nums text-ink">{a.value}</span>
            </span>
          </div>
        ))}
      </div>

      <p className="sr-only">
        A cutaway drawing of a latte: 30 millilitres of espresso, 120 millilitres of steamed milk, and a
        10 millimetre cap of foam.
      </p>
    </div>
  )
}

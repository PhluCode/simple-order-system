import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { CatmullRomCurve3, DoubleSide, Shape, Vector3, type Group, type Mesh } from 'three'
import {
  beanScale,
  cupLayers,
  cupProfile,
  glassLayers,
  glassProfile,
  iceCubes,
  layerArgs,
  layerCentre,
  saucerProfile,
} from './geometry'
import { brewMaterial, ceramic, glassTint, iceTint, pastry, saucer as saucerColour } from './materials'
import { Stage } from './Stage'
import { brewFor, vesselFor, type Brew } from '@/lib/categories'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { ProductDTO } from '@/lib/types'

/* ---------------------------------------------------------------- steam -- */

function Steam() {
  const group = useRef<Group>(null)
  const reduced = useReducedMotion()

  const curves = useMemo(
    () =>
      [0, 1, 2].map((i) => {
        const x = (i - 1) * 0.16
        return new CatmullRomCurve3([
          new Vector3(x, 0, 0),
          new Vector3(x + 0.09 * (i % 2 ? 1 : -1), 0.22, 0.02),
          new Vector3(x - 0.06 * (i % 2 ? 1 : -1), 0.46, -0.02),
          new Vector3(x + 0.05, 0.7, 0),
        ])
      }),
    [],
  )

  useFrame((state) => {
    if (!group.current || reduced) return
    const t = state.clock.elapsedTime
    group.current.children.forEach((child, i) => {
      child.position.y = ((t * 0.16 + i * 0.33) % 1) * 0.34
      const material = (child as Mesh).material as { opacity: number }
      material.opacity = 0.16 * Math.sin(((t * 0.16 + i * 0.33) % 1) * Math.PI)
    })
  })

  return (
    <group ref={group} position={[0, 0.86, 0]}>
      {curves.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 24, 0.012, 8, false]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.14} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ cup -- */

function HotCup({ brew }: { brew: Brew }) {
  const mix = brewMaterial(brew)

  return (
    <group position={[0, -0.5, 0]}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[saucerProfile, 64]} />
        <meshPhysicalMaterial color={saucerColour} roughness={0.45} clearcoat={0.4} side={DoubleSide} />
      </mesh>

      <group position={[0, 0.05, 0]}>
        <mesh castShadow>
          <latheGeometry args={[cupProfile, 96]} />
          <meshPhysicalMaterial color={ceramic} roughness={0.4} clearcoat={0.55} clearcoatRoughness={0.3} side={DoubleSide} />
        </mesh>

        <mesh position={[0.62, 0.48, 0]} rotation={[0, 0, -0.35]} castShadow>
          <torusGeometry args={[0.21, 0.046, 20, 56, Math.PI * 1.3]} />
          <meshPhysicalMaterial color={ceramic} roughness={0.4} clearcoat={0.55} />
        </mesh>

        <mesh position={[0, layerCentre(cupLayers.base), 0]}>
          <cylinderGeometry args={layerArgs(cupLayers.base)} />
          <meshStandardMaterial color={mix.liquid} roughness={mix.roughness} />
        </mesh>
        <mesh position={[0, layerCentre(cupLayers.body), 0]}>
          <cylinderGeometry args={layerArgs(cupLayers.body)} />
          <meshStandardMaterial color={mix.liquid} roughness={mix.roughness} />
        </mesh>
        <mesh position={[0, cupLayers.head.to, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[cupLayers.head.radiusTop, 64]} />
          <meshStandardMaterial color={mix.head} roughness={0.8} side={DoubleSide} />
        </mesh>

        <Steam />
      </group>
    </group>
  )
}

/* ---------------------------------------------------------------- glass -- */

function IcedGlass({ brew }: { brew: Brew }) {
  const mix = brewMaterial(brew)

  return (
    <group position={[0, -0.6, 0]}>
      {/* Milk sits at the bottom of an iced drink and the shot is poured over
          it, so the dark layer is on top until someone stirs. */}
      <mesh position={[0, layerCentre(glassLayers.base), 0]}>
        <cylinderGeometry args={layerArgs(glassLayers.base)} />
        <meshStandardMaterial color={mix.head} roughness={0.5} />
      </mesh>
      <mesh position={[0, layerCentre(glassLayers.body), 0]}>
        <cylinderGeometry args={layerArgs(glassLayers.body)} />
        <meshStandardMaterial color={mix.liquid} roughness={mix.roughness} />
      </mesh>

      {iceCubes.map((cube, i) => (
        <mesh key={i} position={cube.position} rotation={cube.rotation} scale={cube.scale * 0.21}>
          <boxGeometry args={[1, 1, 1]} />
          <meshPhysicalMaterial
            color={iceTint}
            roughness={0.08}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.04}
            transparent
            opacity={0.62}
          />
        </mesh>
      ))}

      {/* The straw is the one place the interface's cherry red appears inside
          a canvas — a thread between the page and the object on it. */}
      <mesh position={[0.12, 0.72, -0.04]} rotation={[0.04, 0, -0.2]} castShadow>
        <cylinderGeometry args={[0.028, 0.028, 1.32, 20]} />
        <meshStandardMaterial color="#C2371C" roughness={0.45} />
      </mesh>

      {/*
        Plain transparency rather than `transmission`. Real refraction needs
        something behind the glass to refract, and these canvases are drawn on
        a transparent background — the transmission pass samples nothing and
        the glass comes out a flat grey slab. Opacity plus a clearcoat
        highlight reads as glass on every machine.
      */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[glassProfile, 96]} />
        <meshPhysicalMaterial
          color={glassTint}
          roughness={0.05}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.04}
          transparent
          opacity={0.3}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
    </group>
  )
}

/* --------------------------------------------------------------- pastry -- */

/**
 * A croissant is a rolled crescent, and the roll is the thing that makes it
 * read as one: a chain of swelling segments along an arc, fattest in the
 * middle, tapering into the two horns.
 */
const CROISSANT_SEGMENTS = [-1, -0.82, -0.64, -0.46, -0.28, -0.1, 0.1, 0.28, 0.46, 0.64, 0.82, 1]

function Croissant({ almond }: { almond: boolean }) {
  const arc = 1.16 // half-sweep in radians
  const radius = 0.5

  return (
    <group position={[0, 0.18, 0]} rotation={[0.14, 0, 0]} scale={1.3}>
      {CROISSANT_SEGMENTS.map((t, i) => {
        const angle = -Math.PI / 2 + t * arc
        // Fat in the belly, thin at the horns.
        const swell = 0.095 + 0.105 * (1 - t * t)
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
            // Turn each segment so its long axis follows the curve; radial
            // ellipsoids would read as a spiral shell instead of a roll.
            rotation={[0, 0, angle + Math.PI / 2]}
            scale={[swell * 1.3, swell * 0.94, swell]}
            castShadow
            receiveShadow
          >
            <sphereGeometry args={[1, 20, 16]} />
            <meshStandardMaterial color={i % 2 ? pastry.crust : pastry.crustDark} roughness={0.72} />
          </mesh>
        )
      })}

      {almond
        ? [-0.45, 0, 0.45].map((t, i) => {
            const angle = -Math.PI / 2 + t * arc
            return (
              <mesh
                key={`flake-${i}`}
                position={[Math.cos(angle) * (radius - 0.16), Math.sin(angle) * (radius - 0.16), 0.03]}
                rotation={[1.35, 0, angle]}
                scale={[0.09, 0.026, 0.055]}
                castShadow
              >
                <sphereGeometry args={[1, 14, 10]} />
                <meshStandardMaterial color={pastry.crumb} roughness={0.55} />
              </mesh>
            )
          })
        : null}
    </group>
  )
}

/**
 * The slice is extruded from its plan view — two straight cuts and an arc —
 * so every face is closed. A cylinder sector would leave the two cut sides
 * open and the layers would read as loose sheets of paper.
 */
function CakeSlice() {
  const wedge = Math.PI / 2.4
  const radius = 0.66

  const plan = useMemo(() => {
    const shape = new Shape()
    shape.moveTo(0, 0)
    shape.lineTo(radius, 0)
    shape.absarc(0, 0, radius, 0, wedge, false)
    shape.lineTo(0, 0)
    return shape
  }, [wedge])

  const layer = (y: number, height: number, colour: string, key: string) => (
    <mesh key={key} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <extrudeGeometry args={[plan, { depth: height, bevelEnabled: false, curveSegments: 32 }]} />
      <meshStandardMaterial color={colour} roughness={0.68} />
    </mesh>
  )

  return (
    <group position={[0, -0.42, 0]} rotation={[0, -wedge / 2 - 0.4, 0]}>
      {layer(0, 0.19, pastry.chocolate, 'a')}
      {layer(0.19, 0.11, pastry.crumb, 'b')}
      {layer(0.3, 0.19, pastry.chocolate, 'c')}
      {layer(0.49, 0.11, pastry.crumb, 'd')}
      {layer(0.6, 0.15, pastry.ganache, 'e')}
    </group>
  )
}

/* ----------------------------------------------------------------- bean -- */

export function Bean({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh scale={beanScale} castShadow>
        <sphereGeometry args={[0.2, 20, 16]} />
        <meshStandardMaterial color="#4A2A15" roughness={0.55} />
      </mesh>
      <mesh scale={[0.02, 0.16, 0.13]} position={[0, 0.13, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#28150A" roughness={0.7} />
      </mesh>
    </group>
  )
}

/* ---------------------------------------------------------------- scene -- */

function Turntable({ children, spin }: { children: React.ReactNode; spin: boolean }) {
  const group = useRef<Group>(null)
  useFrame((_, delta) => {
    if (group.current && spin) group.current.rotation.y += delta * 0.22
  })
  return <group ref={group}>{children}</group>
}

export function ProductViewer({ product, className = '' }: { product: ProductDTO; className?: string }) {
  const reduced = useReducedMotion()
  const vessel = vesselFor(product)
  const brew = brewFor(product)
  const isCake = /cake|fudge/i.test(product.name)
  const isAlmond = /almond/i.test(product.name)

  return (
    <Stage
      className={className}
      camera={vessel === 'pastry' ? [0, 0.7, 2.7] : vessel === 'glass' ? [0, 0.8, 3.25] : [0, 0.75, 2.9]}
      fov={vessel === 'glass' ? 32 : 30}
      shadow
    >
      <Turntable spin={!reduced}>
        {vessel === 'cup' ? <HotCup brew={brew} /> : null}
        {vessel === 'glass' ? <IcedGlass brew={brew} /> : null}
        {vessel === 'pastry' ? isCake ? <CakeSlice /> : <Croissant almond={isAlmond} /> : null}
      </Turntable>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={1.8}
        maxDistance={4.6}
        minPolarAngle={0.5}
        maxPolarAngle={Math.PI / 2 + 0.12}
      />
    </Stage>
  )
}

import { Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * Reflections without downloading an HDR map: three ships a small procedural
 * room, and PMREM turns it into an environment map at runtime. Ceramic and
 * glass need it — without one, transmission materials render as flat grey.
 */
function StudioEnvironment() {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)

  useEffect(() => {
    const pmrem = new PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const target = pmrem.fromScene(room, 0.04)
    scene.environment = target.texture
    // The room is a bright white box. At full strength it washes every
    // surface out to white; dialled down it just gives shape to the highlights.
    scene.environmentIntensity = 0.5
    return () => {
      scene.environment = null
      target.dispose()
      room.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])

  return null
}

/** True when the browser can actually give us a WebGL context. */
function useWebGLSupport(): boolean {
  return useMemo(() => {
    if (typeof document === 'undefined') return false
    try {
      const canvas = document.createElement('canvas')
      return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
    } catch {
      return false
    }
  }, [])
}

interface StageProps {
  children: ReactNode
  /** Camera position. */
  camera?: [number, number, number]
  fov?: number
  /** Ground shadow. Off for the section drawing, on for the product viewer. */
  shadow?: boolean
  className?: string
  fallback?: ReactNode
}

export function Stage({
  children,
  camera = [0, 0.7, 3.1],
  fov = 34,
  shadow = true,
  className,
  fallback,
}: StageProps) {
  const supported = useWebGLSupport()
  const [failed, setFailed] = useState(false)

  if (!supported || failed) {
    return (
      <div className={className} role="img" aria-label="3D preview unavailable">
        {fallback ?? <FlatFallback />}
      </div>
    )
  }

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: camera, fov }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        onCreated={({ gl }) => {
          gl.setClearAlpha(0)
        }}
        onError={() => setFailed(true)}
      >
        <StudioEnvironment />
        {/* Cold key from the upper left, matching the page's fog light. */}
        <ambientLight intensity={0.32} />
        <directionalLight position={[-3, 4.5, 3]} intensity={1.35} color="#FFFFFF" />
        <directionalLight position={[3, 1.5, -2]} intensity={0.45} color="#CBD6CE" />
        <Suspense fallback={null}>{children}</Suspense>
        {shadow ? (
          <ContactShadows position={[0, -0.001, 0]} opacity={0.3} scale={6} blur={2.6} far={2.4} resolution={512} />
        ) : null}
      </Canvas>
    </div>
  )
}

/** Shown when WebGL is unavailable. Still says "coffee", still on brand. */
export function FlatFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 120 120" className="h-2/3 w-2/3 max-h-48 max-w-48" aria-hidden="true">
        <path
          d="M28 38h52v34a22 22 0 0 1-22 22h-8a22 22 0 0 1-22-22z"
          fill="none"
          stroke="#131E18"
          strokeWidth="2"
        />
        <path d="M80 46h8a12 12 0 0 1 0 24h-8" fill="none" stroke="#131E18" strokeWidth="2" />
        <path d="M28 58h52" stroke="#C2371C" strokeWidth="2" />
        <path d="M46 20c0 6-6 6-6 12M60 16c0 7-7 7-7 14M74 22c0 5-5 5-5 10" stroke="#55665B" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

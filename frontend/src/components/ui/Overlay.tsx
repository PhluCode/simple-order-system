import { useEffect, useId, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * One overlay behaviour for both the product dialog and the cart drawer:
 * Escape closes, the panel takes focus on open, focus returns to whatever
 * opened it, and the page behind stops scrolling.
 */

interface OverlayProps {
  open: boolean
  onClose: () => void
  title: string
  /** 'centre' for dialogs, 'right' for the cart drawer. */
  placement?: 'centre' | 'right'
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}

export function Overlay({ open, onClose, title, placement = 'centre', children, footer, wide }: OverlayProps) {
  const panel = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement as HTMLElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    const frame = window.requestAnimationFrame(() => panel.current?.focus())

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      window.cancelAnimationFrame(frame)
      returnFocus.current?.focus?.()
    }
  }, [open, onClose])

  const fromRight = placement === 'right'

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex" role="presentation">
          <motion.button
            type="button"
            aria-label={`Close ${title}`}
            className="absolute inset-0 h-full w-full cursor-default bg-ink/25 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={fromRight ? { x: '100%' } : { opacity: 0, y: 16 }}
            animate={fromRight ? { x: 0 } : { opacity: 1, y: 0 }}
            exit={fromRight ? { x: '100%' } : { opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className={
              fromRight
                ? 'relative ml-auto flex h-full w-full max-w-md flex-col border-l border-line bg-paper shadow-2xl outline-none'
                : `relative m-auto flex max-h-[92vh] w-[min(100%-1.5rem,${wide ? '64rem' : '34rem'})] flex-col border border-line bg-paper shadow-2xl outline-none`
            }
            style={fromRight ? undefined : { width: `min(100% - 1.5rem, ${wide ? '64rem' : '34rem'})` }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <h2 id={titleId} className="font-display text-xl font-extrabold tracking-tight text-ink">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="-m-1 rounded-card p-1 text-moss transition-colors hover:text-cherry"
                aria-label={`Close ${title}`}
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

            {footer ? <div className="border-t border-line bg-mist/60 px-5 py-4">{footer}</div> : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

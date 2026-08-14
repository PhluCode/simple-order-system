import { Minus, Plus, RefreshCw, ServerCrash } from 'lucide-react'
import type { ReactNode } from 'react'

/** The load-balancer proof, promoted from a log line to a piece of the design. */
export function PortTag({ port, className = '' }: { port: number; className?: string }) {
  if (!port) return null
  return (
    <span
      className={`font-mono text-micro tabular-nums text-moss ${className}`}
      title={`Answered by the product-service copy on port ${port}`}
    >
      :{port}
    </span>
  )
}

/** How much is left, as a line rather than a number you have to read. */
export function StockBar({ stock, ceiling = 60 }: { stock: number; ceiling?: number }) {
  const ratio = Math.max(0, Math.min(1, stock / ceiling))
  const low = stock <= 10
  return (
    <span className="flex items-center gap-2" title={`${stock} in stock`}>
      <span className="h-px w-10 bg-line">
        <span
          className={`block h-px ${low ? 'bg-cherry' : 'bg-moss'}`}
          style={{ width: `${Math.max(6, ratio * 100)}%` }}
        />
      </span>
      <span data-value className={`text-micro ${low ? 'text-cherry' : 'text-moss'}`}>
        {stock} left
      </span>
    </span>
  )
}

export function Stepper({
  value,
  min = 1,
  max = 99,
  onChange,
  label,
}: {
  value: number
  min?: number
  max?: number
  onChange: (next: number) => void
  label: string
}) {
  return (
    <span className="inline-flex items-center border border-line bg-paper">
      <button
        type="button"
        className="px-2.5 py-1.5 text-moss transition-colors hover:text-cherry disabled:opacity-30"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Remove one ${label}`}
      >
        <Minus size={14} strokeWidth={2} />
      </button>
      <span data-value className="min-w-8 text-center text-data" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="px-2.5 py-1.5 text-moss transition-colors hover:text-cherry disabled:opacity-30"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Add one ${label}`}
      >
        <Plus size={14} strokeWidth={2} />
      </button>
    </span>
  )
}

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  placeholder,
  hint,
  min,
  step,
  suffix,
  invalid,
}: {
  label: string
  value: string
  onChange: (next: string) => void
  type?: string
  autoComplete?: string
  placeholder?: string
  hint?: string
  min?: number
  step?: number
  /** A unit shown inside the field, e.g. ฿ or "in stock". */
  suffix?: string
  invalid?: boolean
}) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <span className="relative mt-1.5 block">
        <input
          type={type}
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          min={min}
          step={step}
          aria-invalid={invalid || undefined}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full border bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-moss/60 focus:border-ink ${
            invalid ? 'border-cherry' : 'border-line'
          } ${suffix ? 'pr-16' : ''} ${type === 'number' ? 'font-mono tabular-nums' : ''}`}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-micro uppercase tracking-[0.1em] text-moss">
            {suffix}
          </span>
        ) : null}
      </span>
      {hint ? <span className="mt-1.5 block text-micro leading-relaxed text-moss">{hint}</span> : null}
    </label>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  children,
  hint,
}: {
  label: string
  value: string
  onChange: (next: string) => void
  children: ReactNode
  hint?: ReactNode
}) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full border border-line bg-paper px-3 py-2.5 text-sm text-ink focus:border-ink"
      >
        {children}
      </select>
      {hint ? <span className="mt-1.5 block text-micro leading-relaxed text-moss">{hint}</span> : null}
    </label>
  )
}

export function CardSkeleton() {
  return (
    <div className="surface flex flex-col gap-4 p-4">
      <div className="skeleton h-28 w-full" />
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton h-3 w-1/3" />
    </div>
  )
}

/**
 * Failures explain what happened and what to do, in the interface's voice.
 * They do not apologise and they are never vague.
 */
export function ErrorState({
  message,
  onRetry,
  compact,
}: {
  message: string
  onRetry?: () => void
  compact?: boolean
}) {
  return (
    <div
      role="alert"
      className={`surface flex items-start gap-3 border-cherry/40 bg-cherry/[0.04] ${compact ? 'p-3' : 'p-5'}`}
    >
      <ServerCrash size={18} strokeWidth={1.6} className="mt-0.5 shrink-0 text-cherry" />
      <div className="flex-1">
        <p className="text-sm leading-relaxed text-ink">{message}</p>
        {onRetry ? (
          <button type="button" className="btn btn-quiet btn-sm mt-3" onClick={onRetry}>
            <RefreshCw size={13} strokeWidth={1.8} />
            Try again
          </button>
        ) : null}
      </div>
    </div>
  )
}

/** An empty screen is an invitation to act, not a shrug. */
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2 border border-dashed border-line px-5 py-8">
      <p className="font-display text-lg font-bold tracking-tight text-ink">{title}</p>
      {children ? <div className="text-sm leading-relaxed text-moss">{children}</div> : null}
    </div>
  )
}

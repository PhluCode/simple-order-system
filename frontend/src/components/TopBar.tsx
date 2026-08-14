import { Bell, ShoppingBag, UserRound } from 'lucide-react'
import { formatBahtShort } from '@/lib/format'
import { useCart } from '@/store/cart'
import { useSession } from '@/store/session'

interface TopBarProps {
  notificationCount: number
  hasFreshNotification: boolean
  onOpenCart: () => void
  onOpenActivity: () => void
  onOpenAccount: () => void
}

export function TopBar({
  notificationCount,
  hasFreshNotification,
  onOpenCart,
  onOpenActivity,
  onOpenAccount,
}: TopBarProps) {
  const { itemCount, total } = useCart()
  const { user } = useSession()

  return (
    <header className="border-b border-line bg-mist/85 backdrop-blur">
      <div className="mx-auto flex max-w-[100rem] items-center gap-4 px-4 py-3 sm:px-8">
        <a href="#menu" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl font-extrabold leading-none tracking-[-0.04em] text-ink">
            DOI
          </span>
          <span lang="th" className="text-lg leading-none text-moss">
            ดอย
          </span>
          <span className="eyebrow ml-1 hidden leading-none sm:inline">highland coffee · mfu</span>
        </a>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onOpenActivity}
            className="relative flex items-center gap-2 border border-transparent px-2.5 py-2 text-moss transition-colors hover:border-line hover:text-ink"
            aria-label={`Order activity, ${notificationCount} so far`}
          >
            <Bell size={17} strokeWidth={1.7} />
            <span data-value className="hidden text-data sm:inline">
              {notificationCount}
            </span>
            {hasFreshNotification ? (
              <span className="absolute right-1.5 top-1.5 block h-1.5 w-1.5 rounded-full bg-cherry">
                <span className="absolute inset-0 animate-pulse-ring rounded-full bg-cherry" />
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={onOpenAccount}
            className="flex items-center gap-2 border border-transparent px-2.5 py-2 text-moss transition-colors hover:border-line hover:text-ink"
          >
            <UserRound size={17} strokeWidth={1.7} />
            <span className="hidden max-w-28 truncate font-mono text-micro uppercase tracking-[0.08em] sm:inline">
              {user ? (user.displayName ?? user.username) : 'Sign in'}
            </span>
          </button>

          <button type="button" onClick={onOpenCart} className="btn btn-secondary gap-2.5">
            <ShoppingBag size={15} strokeWidth={1.8} />
            <span className="hidden sm:inline">Cart</span>
            <span data-value className="text-micro">
              {itemCount}
            </span>
            {itemCount > 0 ? (
              <span data-value className="border-l border-current/30 pl-2.5 text-micro">
                {formatBahtShort(total)}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  )
}

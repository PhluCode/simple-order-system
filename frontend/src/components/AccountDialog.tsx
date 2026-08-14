import { useState } from 'react'
import { LogIn, LogOut } from 'lucide-react'
import { login } from '@/api/users'
import { describeError } from '@/lib/http'
import { useUsers } from '@/hooks/useUsers'
import { useSession } from '@/store/session'
import { Overlay } from '@/components/ui/Overlay'
import { ErrorState, Field } from '@/components/ui/bits'

/**
 * user-service has both `POST /users/login` and a plain `GET /users`, so there
 * are two honest ways in: sign in properly, or pick an account the way the lab
 * demo does. Both end up setting the userId that order-service stores.
 */
export function AccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, signIn, signOut } = useSession()
  const users = useUsers()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      signIn(await login(username, password))
      setPassword('')
      onClose()
    } catch (failure) {
      setError(describeError(failure))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Overlay open={open} onClose={onClose} title={user ? 'Your account' : 'Sign in'}>
      <div className="space-y-6 p-5">
        {user ? (
          <div className="space-y-4">
            <dl className="divide-y divide-line border-y border-line">
              <div className="flex items-center justify-between py-2.5">
                <dt className="eyebrow">Signed in as</dt>
                <dd className="text-sm text-ink">{user.displayName ?? user.username}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="eyebrow">User id</dt>
                <dd data-value className="text-sm text-ink">
                  {user.id}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="eyebrow">Role</dt>
                <dd className="font-mono text-micro uppercase tracking-[0.1em] text-moss">{user.role}</dd>
              </div>
            </dl>
            <button type="button" className="btn btn-quiet w-full" onClick={signOut}>
              <LogOut size={15} strokeWidth={1.8} />
              Sign out
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={submit} className="space-y-3">
              <Field label="Username" value={username} onChange={setUsername} autoComplete="username" />
              <Field
                label="Password"
                value={password}
                onChange={setPassword}
                type="password"
                autoComplete="current-password"
              />
              {error ? <ErrorState compact message={error} /> : null}
              <button type="submit" className="btn btn-primary w-full" disabled={busy || !username || !password}>
                <LogIn size={15} strokeWidth={1.8} />
                {busy ? 'Checking…' : 'Sign in'}
              </button>
            </form>

            {users.data && users.data.length > 0 ? (
              <div className="space-y-2 border-t border-line pt-5">
                <p className="eyebrow">or continue as</p>
                <ul className="grid gap-1.5">
                  {users.data.map((candidate) => (
                    <li key={candidate.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between border border-line bg-paper px-3 py-2.5 text-left transition-colors hover:border-ink"
                        onClick={() => {
                          signIn(candidate)
                          onClose()
                        }}
                      >
                        <span className="text-sm text-ink">{candidate.displayName ?? candidate.username}</span>
                        <span className="flex items-baseline gap-2">
                          <span className="font-mono text-micro uppercase tracking-[0.1em] text-moss">
                            {candidate.role}
                          </span>
                          <span data-value className="text-micro text-moss">
                            #{candidate.id}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </div>
    </Overlay>
  )
}

import { useMockData, userApi } from '@/lib/http'
import { mockUsers } from '@/lib/mock'
import type { SafeUser } from '@/lib/types'

/**
 * `GET /users` — UserController strips password before answering, so this is
 * already the safe shape. There is no `GET /users/{id}`; pick from the list.
 */
export async function fetchUsers(): Promise<SafeUser[]> {
  if (useMockData) return mockUsers
  const { data } = await userApi.get<SafeUser[]>('')
  return data
}

/** `POST /users/login` — 200 with the safe user, or 401 with a plain string. */
export async function login(username: string, password: string): Promise<SafeUser> {
  if (useMockData) {
    const found = mockUsers.find((u) => u.username === username)
    if (!found) throw new Error('Invalid username or password')
    return found
  }
  const { data } = await userApi.post<SafeUser>('/login', { username, password })
  return data
}

/**
 * `POST /users/register` — answers with a plain string, not the new user.
 * The service forces role to USER whatever you send.
 */
export async function register(input: {
  username: string
  password: string
  displayName: string
}): Promise<string> {
  if (useMockData) return `User created with ID: ${mockUsers.length + 1}`
  const { data } = await userApi.post<string>('/register', input, { responseType: 'text' })
  return typeof data === 'string' ? data : String(data)
}

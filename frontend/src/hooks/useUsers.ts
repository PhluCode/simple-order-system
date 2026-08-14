import { useQuery } from '@tanstack/react-query'
import { fetchUsers } from '@/api/users'

/** user-service returns everyone with passwords already stripped. */
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 60_000,
  })
}

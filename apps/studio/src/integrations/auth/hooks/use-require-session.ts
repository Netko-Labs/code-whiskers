import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSession } from '../client'

export type SessionGuard = 'pending' | 'authenticated' | 'unauthenticated'

/**
 * Better-auth keeps the session client-side, so the guard can only run after hydration.
 * Callers must not render protected content (or fire its queries) until `authenticated`.
 */
export function useRequireSession(): SessionGuard {
  const { data: session, isPending } = useSession()
  const navigate = useNavigate()
  const signedIn = Boolean(session?.user)

  useEffect(() => {
    if (!isPending && !signedIn) navigate({ to: '/sign-in' })
  }, [isPending, signedIn, navigate])

  if (isPending) return 'pending'
  return signedIn ? 'authenticated' : 'unauthenticated'
}

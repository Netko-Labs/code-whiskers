import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSession } from '../client'

/** Better-auth keeps the session client-side, so the guard runs after hydration. */
export function useRequireSession() {
  const { data: session, isPending } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isPending && !session?.user) navigate({ to: '/sign-in' })
  }, [isPending, session, navigate])

  return session
}

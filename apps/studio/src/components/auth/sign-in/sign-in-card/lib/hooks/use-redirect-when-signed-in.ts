import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useSession } from '@/integrations/auth'
import { SIGN_IN_REDIRECT_TO } from '../values'

export function useRedirectWhenSignedIn() {
  const { data: session } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (session?.user) navigate({ to: SIGN_IN_REDIRECT_TO })
  }, [session, navigate])
}

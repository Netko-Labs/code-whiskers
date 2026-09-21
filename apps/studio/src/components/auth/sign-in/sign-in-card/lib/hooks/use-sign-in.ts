import { useState } from 'react'
import { signIn } from '@/integrations/auth'
import type { SignInMessage } from '../types'
import { SIGN_IN_GITHUB_FAILED, SIGN_IN_REDIRECT_TO } from '../values'

export function useSignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<SignInMessage | null>(null)

  const continueWithGithub = async () => {
    setIsLoading(true)
    setMessage(null)
    try {
      const result = await signIn.social({ provider: 'github', callbackURL: SIGN_IN_REDIRECT_TO })
      if (result.error) {
        setMessage({ type: 'error', text: result.error.message || SIGN_IN_GITHUB_FAILED })
      }
    } catch {
      setMessage({ type: 'error', text: SIGN_IN_GITHUB_FAILED })
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, message, continueWithGithub }
}

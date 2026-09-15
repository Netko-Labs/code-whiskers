import { type FormEvent, useState } from 'react'
import { signIn } from '@/integrations/auth'
import type { SignInMessage } from '../types'
import {
  SIGN_IN_EMAIL_FAILED,
  SIGN_IN_EMAIL_SENT,
  SIGN_IN_GITHUB_FAILED,
  SIGN_IN_REDIRECT_TO,
} from '../values'

export function useSignIn() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<SignInMessage | null>(null)

  const submitEmail = async (event: FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage(null)
    try {
      const result = await signIn.magicLink({ email, callbackURL: SIGN_IN_REDIRECT_TO })
      if (result.error) {
        setMessage({ type: 'error', text: result.error.message || SIGN_IN_EMAIL_FAILED })
        return
      }
      setMessage({ type: 'success', text: SIGN_IN_EMAIL_SENT })
      setEmail('')
    } catch {
      setMessage({ type: 'error', text: SIGN_IN_EMAIL_FAILED })
    } finally {
      setIsLoading(false)
    }
  }

  const continueWithGithub = async () => {
    setIsLoading(true)
    setMessage(null)
    try {
      const result = await signIn.social({ provider: 'github', callbackURL: SIGN_IN_REDIRECT_TO })
      if (result.error) {
        setMessage({ type: 'error', text: result.error.message || SIGN_IN_GITHUB_FAILED })
        setIsLoading(false)
      }
    } catch {
      setMessage({ type: 'error', text: SIGN_IN_GITHUB_FAILED })
      setIsLoading(false)
    }
  }

  return { email, setEmail, isLoading, message, submitEmail, continueWithGithub }
}

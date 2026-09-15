import type { FormEvent } from 'react'

export interface SignInMessage {
  type: 'success' | 'error'
  text: string
}

export interface SignInEmailFormProps {
  email: string
  isLoading: boolean
  message: SignInMessage | null
  onEmailChange: (email: string) => void
  onSubmit: (event: FormEvent) => void
}

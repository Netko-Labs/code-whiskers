import { createFileRoute } from '@tanstack/react-router'
import { SignInPage } from '@/components/auth/sign-in'

export const Route = createFileRoute('/sign-in')({
  head: () => ({ meta: [{ title: 'Sign in · Code Whiskers' }] }),
  component: SignInPage,
})

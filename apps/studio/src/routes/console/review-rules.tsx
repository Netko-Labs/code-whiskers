import { createFileRoute } from '@tanstack/react-router'
import { ReviewRulesPage } from '@/components/console/code-review'

export const Route = createFileRoute('/console/review-rules')({
  component: ReviewRulesPage,
})

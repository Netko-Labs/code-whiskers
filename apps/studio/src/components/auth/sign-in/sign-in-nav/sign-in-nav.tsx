import { CatMark } from '@code-whiskers/ui/brand'
import { Link } from '@tanstack/react-router'
import { BRAND_NAME, NAV_LINKS } from '../lib'

export function SignInNav() {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-10 md:py-5">
      <Link to="/" className="flex items-center gap-2.5">
        <CatMark cut="favicon" tone="dark" background={false} size={24} className="rounded-md" />
        <span className="text-sm font-semibold tracking-tight text-ink-text">{BRAND_NAME}</span>
      </Link>
      <div className="hidden gap-6 text-[13px] md:flex">
        {NAV_LINKS.map((link) => {
          const className = link.emphasis ? 'font-medium text-ink-text' : 'text-ink-muted'
          return link.href.startsWith('/') ? (
            <Link key={link.label} to={link.href} className={className}>
              {link.label}
            </Link>
          ) : (
            <a key={link.label} href={link.href} className={className}>
              {link.label}
            </a>
          )
        })}
      </div>
    </nav>
  )
}

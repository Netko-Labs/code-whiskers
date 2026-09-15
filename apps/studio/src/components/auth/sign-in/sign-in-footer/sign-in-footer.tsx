import { FOOTER_LINKS, SIGN_IN_COPYRIGHT } from '../lib'

export function SignInFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-center gap-4 px-4 py-4 text-xs text-ash md:justify-between md:px-10 md:py-[18px]">
      <span className="hidden md:inline">{SIGN_IN_COPYRIGHT}</span>
      <div className="flex gap-5">
        {FOOTER_LINKS.map((link) => (
          <a key={link.label} href={link.href} className="text-ash">
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  )
}

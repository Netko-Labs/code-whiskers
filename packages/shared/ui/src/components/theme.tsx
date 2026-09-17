'use client'

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" enableColorScheme enableSystem {...props}>
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider, useTheme }

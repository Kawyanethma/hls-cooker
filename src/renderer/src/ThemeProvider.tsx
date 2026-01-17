// @renderer/ThemeProvider.tsx
import { Theme } from '@radix-ui/themes'
import { useState, useEffect, createContext, useContext } from 'react'

const ThemeContext = createContext({
  theme: 'dark',
  // eslint-disable-next-line
  setTheme: (_t: 'light' | 'dark') => {}
})
// eslint-disable-next-line
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('app-theme') as 'light' | 'dark') || 'dark'
  )

  useEffect(() => {
    localStorage.setItem('app-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Theme appearance={theme} accentColor="orange">
        {children}
      </Theme>
    </ThemeContext.Provider>
  )
}
//eslint-disable-next-line
export const useAppTheme = () => useContext(ThemeContext)

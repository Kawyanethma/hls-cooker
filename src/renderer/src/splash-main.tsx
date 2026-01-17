import '@renderer/assets/main.css'
import { Theme } from '@radix-ui/themes'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SplashApp } from '@renderer/SplashApp'

createRoot(document.getElementById('splash-root')!).render(
  <StrictMode>
    <Theme appearance="dark" accentColor="orange">
      <SplashApp />
    </Theme>
  </StrictMode>
)

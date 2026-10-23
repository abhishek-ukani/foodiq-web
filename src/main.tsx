import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/app'
import '@/index.css'

// Enforce light mode and remove any legacy dark mode state
if (typeof document !== 'undefined') {
  document.documentElement.classList.remove('dark')
  try {
    localStorage.removeItem('thakar-rasoi-theme')
    localStorage.removeItem('foodiq-theme')
  } catch {
    // ignore local storage errors if sandboxed
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

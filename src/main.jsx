import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { ToastProvider } from './components/Toast.jsx'

// Register Service Worker for PWA offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      await registration.update()

      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: 'SKIP_WAITING' })
          }
        })
      })

      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return
        refreshing = true
        window.location.reload()
      })
    } catch {
      // Service worker registration/update failed - app still works online
    }
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
        <Analytics />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)

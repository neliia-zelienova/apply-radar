import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/global.css'
import App from './App.tsx'
import { ApplicationsProvider } from './context/applications-context.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApplicationsProvider>
      <App />
    </ApplicationsProvider>
  </StrictMode>,
)

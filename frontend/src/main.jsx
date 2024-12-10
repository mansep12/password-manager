import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { KeyProvider} from './keyContext'
import './index.css'
import AppRouter from './routes/AppRouter'

createRoot(document.getElementById('root')).render(
  <KeyProvider>
    <StrictMode>
      <AppRouter />
    </StrictMode>,
  </KeyProvider>
)

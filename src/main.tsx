import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { KindeProvider } from "@kinde-oss/kinde-auth-react";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KindeProvider
      clientId="246b9d948b704148996c5d6c85cadf7c"
      domain="https://auth.lengert.ca"
      redirectUri="https://mindpuke.lengert.ca"
      logoutUri="https://mindpuke.lengert.ca"
    >
      <App />
    </KindeProvider>
  </StrictMode>,
)

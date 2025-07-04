import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

// Flow Configuration
import { config } from '@onflow/fcl'

// Configure Flow for testnet
config()
  .put('accessNode.api', 'https://rest-testnet.onflow.org')
  .put('discovery.wallet', 'https://fcl-discovery.onflow.org/testnet/authn')
  .put('0xClandestineNetwork', '0x2444e6b4d9327f09')
  .put('0xSkillRegistry', '0x2444e6b4d9327f09')
  .put('0xGifts', '0x2444e6b4d9327f09')
  .put('0xNonFungibleToken', '0x1d7e57aa55817448')
  .put('0xMetadataViews', '0x1d7e57aa55817448')
  .put('0xViewResolver', '0x1d7e57aa55817448')
  .put('0xFungibleToken', '0x9a0766d93b6608b7')
  .put('0xFlowToken', '0x7e60df042a9c0868')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0a0a0a',
            color: '#00ff41',
            border: '1px solid #00ff41',
            borderRadius: '0.5rem',
            fontFamily: 'Fira Code, monospace',
            fontSize: '0.875rem',
            boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
          },
          success: {
            iconTheme: {
              primary: '#00ff41',
              secondary: '#0a0a0a',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff4500',
              secondary: '#0a0a0a',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
) 
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AppProvider } from './context/AppContext.jsx'
import { UserProvider } from './context/UserContext.jsx'
// 1. Importar el nuevo Provider
import { DocumentProvider } from './context/DocumentContext.jsx' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <AppProvider>
        {/* 2. Envolver App con DocumentProvider */}
        <DocumentProvider>
          <App />
        </DocumentProvider>
      </AppProvider>
    </UserProvider>
  </React.StrictMode>,
)
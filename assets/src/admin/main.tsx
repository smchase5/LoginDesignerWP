import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '@/index.css'
import '@/layouts.css'

let hasInitialized = false

// Wait for WordPress media library to be fully loaded before initializing React
function initApp() {
    if (hasInitialized) {
        return
    }

    const container = document.getElementById('ldwp-admin-root')
    if (!container) {
        console.error('LoginDesignerWP: Root container not found')
        return
    }

    hasInitialized = true
    const root = createRoot(container)
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    )
}

// Mount immediately. Media-heavy controls wait for wp.media when opened.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp)
} else {
    initApp()
}

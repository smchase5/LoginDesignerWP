import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '@/index.css'
import '@/layouts.css'

// Wait for WordPress media library to be fully loaded before initializing React
function initApp() {
    const container = document.getElementById('ldwp-admin-root')
    if (!container) {
        console.error('LoginDesignerWP: Root container not found')
        return
    }

    const root = createRoot(container)
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    )
}

// Check if wp.media is ready, if not, wait for it
function waitForWpMedia() {
    // DEBUG: Log what's available
    console.log('LoginDesignerWP: Checking WordPress APIs...', {
        'window.wp': typeof window.wp,
        'window.wp.media': typeof window.wp?.media,
        'window.wp.Backbone': typeof window.wp?.Backbone,
        'window.wp.Backbone.View': typeof window.wp?.Backbone?.View,
        'window.wp.hooks': (window.wp as any)?.hooks
    });

    // Check if wp, wp.media, and wp.Backbone are all available
    if (
        typeof window.wp !== 'undefined' &&
        typeof window.wp.media !== 'undefined' &&
        typeof window.wp.Backbone !== 'undefined' &&
        typeof window.wp.Backbone.View !== 'undefined'
    ) {
        // Everything is ready, initialize the app
        console.log('LoginDesignerWP: All WordPress APIs ready, initializing app');
        initApp()
    } else {
        // Not ready yet, check again in 50ms
        console.log('LoginDesignerWP: WordPress APIs not ready, waiting 50ms...');
        setTimeout(waitForWpMedia, 50)
    }
}

// Start the wait process when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForWpMedia)
} else {
    waitForWpMedia()
}
